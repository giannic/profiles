var baseUrl = "http://davidxu.me:3000";
//var baseUrl = "http://127.0.0.1:3000";
var apiUrlOpen = baseUrl + "/apps/open";
var apiUrlClose = baseUrl + "/apps/close";
var userid = null;
var storage = chrome.storage.local;
var tabDomains = {}; // maps tab ids to URLs
var activeDomains = {}; // domains that are open already
var whitelist = {};

$(document).ready(function() {
  init();
});

function init() {
  loadUserId();
  console.log("Loaded")
  //printChromeStorage();
  checkDirtyClose();
  storage.set({"activeDomains": activeDomains});
  getWhitelist();
}

//==================
// Init functions
//==================

function checkDirtyClose() {
  // see if we have active domains stored in chrome storage
  storage.get({"activeDomains": null, "lastKnownTime": null}, 
    function(items) {
      var domains = items.activeDomains;
      // if we do, post close with the last recorded time
      if (domains) {
        for (var d in domains) {
          if (domains.hasOwnProperty(d)) {
            var appId = domains[d]["appId"];
            var posixTime = items.lastKnownTime;
            if (!posixTime) {
              posixTime = getCurrentTime();
            }
            //postToClose(d, appId, posixTime);
          }
        }
      }
    storage.set({"activeDomains": null});
    // 
    registerAllTabs();
    window.setInterval(logTime, 5000);
  });
};

function registerAllTabs() {
  chrome.windows.getAll({"populate": true}, function(windows) {
    for (var i = 0; i < windows.length; i ++ ) {
      var tabs = windows[i].tabs;
      for (var j = 0; j < tabs.length; j ++ ) {
        var id = tabs[j].id;
        var url = tabs[j].url;
        processUrl(id, url);
      }
    }
  });
  console.log("Registered all active tabs");
}

//==================
// Other functions
//==================

// Records the time to Chrome storage
function logTime() {
  storage.set({"lastKnownTime": Math.round((new Date()).getTime() / 1000)});
};

// Load user id from Chrome storage
function loadUserId() {
  userid = storage.get({"userid": null}, function(items) {
    userid = items.userid; 
  });
  console.log("Loaded userid " + userid);
}

function processUrl(tabId, url) {
  var domain = getGeneralDomain($.url(url).attr("host"));
  // If user opened chrome://*, ignore and return
  /*
  var excludedDomains = ["chrome", "extensions", "devtools"];
  if (excludedDomains.indexOf(domain) != -1) {
    return false;
  }
  */
  var oldDomain = tabDomains[tabId];

  // if new tab
  if (tabDomains[tabId] == null) {
    tabDomains[tabId] = domain;
    incrementDomainCount(domain);
  }
  // if user navigated from one domain to another
  else if (oldDomain != domain) {
    // Increment number of active tabs with this domain
    incrementDomainCount(domain);

    // Decrement domain user just navigated away from
    decrementDomainCount(tabDomains[tabId]);
  }
  // else, user has navigated from one page to another on same domain

  // Remember the current domain for this tab in case we close it later
  tabDomains[tabId] = domain;

  return true;
};

function incrementDomainCount(domain) {
  if (!(domain in activeDomains)) {
    activeDomains[domain] = {"count": 0};
    if (userid && isInWhitelist(domain)) {
      postToOpen(domain);
    }
  }
  activeDomains[domain]["count"] += 1;
  storage.set({"activeDomains": activeDomains});
  console.log(activeDomains[domain]["count"] + " tabs open for " + domain);
}

function decrementDomainCount(domain) {
  // If last tab for that domain, delete from active domains
  if (domain in activeDomains && activeDomains[domain]["count"] == 1) {
    var appId = activeDomains[domain]["appId"];
    delete activeDomains[domain];
    console.log("No more tabs open for " + domain);
    if (userid && isInWhitelist(domain)) {
      postToClose(domain, appId, getCurrentTime());
    }
  }
  // Else, decrement
  else {
    activeDomains[domain]["count"] = activeDomains[domain]["count"] - 1;
    console.log(activeDomains[domain]["count"] + " tabs open for " + domain);
  }
  storage.set({"activeDomains": activeDomains});
};

// Return the category of an app domain
function getCategory(domain) {
  // naive hashfunction so I can avoid storing categories lolol
  // that's a job for the backend
  // pass the buck
  var r = domain.length % 3
  if (r == 0) {
    return "social";
  }
  else if (r == 1) {
    return "productivity";
  }
  else {
    return "entertainment";
  }
}

function getWhitelist() {
  whitelist = {"twitter.com": true,
                "facebook.com": true,
                "google.com": true,
                "tumblr.com": true,
                "pinterest.com": true,
                "youtube.com": true,
                "linkedin.com": true,
                "myspace.com": true,
                "vimeo.com": true,
                "blogger.com": true,
                "pandora.com": true,
                "spotify.com": true,
                "github.com": true,
                "stackoverflow.com": true,
                "ycombinator.com": true,
                "reddit.com": true,
                "mint.com": true,
              };
}

function isInWhitelist(domain) {
  return domain in whitelist;
};

//=======================
// Request Functions
//=======================

function postToClose(domain, appId, posixTime) {
  var postData = {"appid": appId, "close_date": posixTime};
  $.post(apiUrlClose, postData);
  console.log("POST to close for domain " + domain + ": " + JSON.stringify(postData));
};

function postToOpen(domain) {
  var posixTime = getCurrentTime();
  var postData = {
    "category": getCategory(domain),
    "userid": userid,
    "open_date": posixTime,
    "url": domain,
    "img_url": "placeholder.jpg"
  };
  $.ajax({
    type: "POST",
    url: apiUrlOpen,
    data: postData,
    success: function(data) {
      console.log(JSON.stringify(data));
      activeDomains[domain]["appId"] = data["appid"];
      console.log("new appId added " + activeDomains[domain]["appId"]);
    }
  });
  console.log("POST to " + apiUrlOpen + ": " + JSON.stringify(postData));
};

//===============
// Utilities
//===============

// Replaces subdomain.domain.com with www.domain.com
// ex. maps.google.com --> www.google.com
function getGeneralDomain(domain) {
  if (domain.indexOf("chrome://") !== -1) {
    return "chrome";
  }

  // special case for mail.google.com
  if (domain.indexOf("mail.google.com") !== -1) {
    
    return "mail.google.com";
  }

  var firstIndex = domain.indexOf(".");
  if (firstIndex == domain.lastIndexOf(".")) {
    return domain;
  }
  return domain.substring(firstIndex + 1, domain.length);
}

function getCurrentTime() {
  return Math.round(new Date().getTime() / 1000);
}

function printChromeStorage() {
  storage.get({"activeDomains": null}, function(items) {
      console.log(items.activeDomains);
  });
}

//====================
// Chrome listeners
//====================

chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
  console.log("message listener");
  userid = message["userid"];
  storage.set({"userid": userid}, function() {
    console.log("Stored user id")
  });
  console.log("Logged in as " + userid);
  registerAllTabs();
});

chrome.tabs.onCreated.addListener(function(tab) {
  tabDomains[tab["id"]] = null;
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {         
  // If tab has no URL yet, return
  if (!("url" in changeInfo) || changeInfo["url"] == "chrome://newtab/") {
    return;
  }
  // Process the url
  processUrl(tabId, changeInfo["url"]);
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  var closedDomain = tabDomains[tabId];
  if (tabId in tabDomains) {
    delete tabDomains[tabId];
    decrementDomainCount(closedDomain);
  }
});
