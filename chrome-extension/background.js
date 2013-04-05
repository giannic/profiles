//var baseUrl = "http://davidxu.me:3000";
var baseUrl = "http://127.0.0.1:3000";
var apiUrlOpen = baseUrl + "/apps/open";
var apiUrlClose = baseUrl + "/apps/close";
var userid = null;
var storage = chrome.storage.local;
var tabDomains = {}; // maps tab ids to URLs
var activeDomains = {}; // domains that are open already
var whitelist = [];
var _recording = true;

$(document).ready(function() {
  init();
});

function init() {
  //printChromeStorage();
  storage.get({"userid": null}, function(items) {
    userid = items.userid; 
    if (userid) {
      console.log("Loaded userid " + userid);
      getWhitelist();
    }
    else {
      console.log("No userid to be loaded");
    }
  });
  console.log("Init finished")
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
        console.log("dirty-closed domains: ");
        console.log(domains);
        for (var d in domains) {
          console.log("domain: " + d);
          if (isInWhitelist(d)) {
            var appId = domains[d]["appId"];
            console.log("------appid=" + appId + "--------");
            var posixTime = items.lastKnownTime;
            if (!posixTime) {
              posixTime = getCurrentTime();
            }
            postToClose(d, appId, posixTime);
          }
        }
      }
      storage.set({"activeDomains": null});
      registerAllTabs();
      window.setInterval(logTime, 5000);
  });
};

// Gets all open tabs and stores their domains in memory and in chrome storage
// Call this function if the extension is loaded after tabs have been opened
// or if the user logs in after tabs have been loaded
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
  storage.set({"activeDomains": activeDomains});
  console.log("Registered all active tabs");
}

//==================
// Other functions
//==================

// Records the time to Chrome storage
function logTime() {
  var time = Math.round((new Date()).getTime() / 1000);
  storage.set({"lastKnownTime": time});
};

function processUrl(tabId, url) {
  var domain = getDomain(url);
  //console.log("got url " + url);
  //console.log("got host " + host);
  //console.log("got domain " + domain);

  // If user opened chrome://*, ignore and return
  var excludedDomains = ["chrome", "extensions", "devtools"];
  if (excludedDomains.indexOf(domain) != -1) {
    return false;
  }

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

  return domain;
};

function incrementDomainCount(domain) {
  // If this app is not in the whitelist, just return
  if(!isInWhitelist(domain)) {
    return;
  }

  if (!(domain in activeDomains) && userid) {
    postToOpen(domain);
  }
}

function decrementDomainCount(domain) {
  // If this app is not in the whitelist, just return
  if(!isInWhitelist(domain)) {
    return;
  }

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
  //console.log(activeDomains);
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
  $.getJSON(baseUrl + "/users/" + userid + "/whitelist.json",
    function(data){
      whitelist = data;
      checkDirtyClose();
    });
}

function isInWhitelist(domain) {
  return (whitelist.indexOf(domain) != -1); 
};

function addToWhiteList(tabid, url) {
  var domain = getDomain(url);
  console.log("Adding " + domain + " to whitelist");
  if (!(domain in whitelist)) {
    whitelist.append(domain);
  }
  postToAllowApp(domain);
};

//=======================
// Request Functions
//=======================

function postToClose(domain, appId, posixTime) {
  if (!appId) {
    console.log("WARNING APPID IS NULL");
  }
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
      activeDomains[domain] = {"count": 1};
      console.log("POST open success\n" + JSON.stringify(data));
      activeDomains[domain]["appId"] = data["appid"];
      console.log("new appId added " + activeDomains[domain]["appId"]);
      storage.set({"activeDomains": activeDomains});
      console.log("POST to " + apiUrlOpen + ": " + JSON.stringify(postData));
    }
  });
};

function postToAllowApp(domain) {
  if (!userid) {
    console.log("Null userid, cannot POST"); 
    return;
  }
  var postData = {"id": userid, "domain": domain};
  $.post(baseUrl + "/users/allow", postData);
  console.log("POST to /users/allow; domain: " + domain);
};

//===============
// Utilities
//===============

// Returns a domain of form domain.com from a url
function getDomain(url) {
  var domain = $.url(url).attr("host");
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

//==============================
// Chrome listeners and helpers
//==============================

// Message listener to listen to popup.js
chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
  console.log("message listener");
  console.log(message);

  // Toggle recording
  if ("recording" in message) {
    toggleRecording(message);
  }

  // If user has turned off recording, do nothing
  if (!_recording) {
    return;
  }
  
  // Handle userid returned from chrome extension login
  if ("userid" in message) {
    setUserId(message);
  }

  // Handle add app
  if ("allowed_url" in message) {
    var url = message["allowed_url"];
    addToWhiteList(tabid, url);
    if ("tabid" in message) {
      var tabid = message["tabid"];
      tabDomains[tabId] = getDomain(url); 
    }
  }
});

function toggleRecording(message) {
    _recording = message["recording"];
    if (_recording) {
      init();
    }
    console.log("recording: " + _recording);
};

function setUserId(message) {
    console.log("setting userid");
    userid = message["userid"];
    storage.set({"userid": userid}, function() {
      console.log("Stored user id " + userid);
      init();
    });
};

// Tab created listener
chrome.tabs.onCreated.addListener(function(tab) {
  // If user has toggled off recording, do nothing
  if (!_recording) {
    return;
  }

  tabDomains[tab["id"]] = null;
});

// Tab updated listener
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {         
  // If user has toggled off recording, do nothing
  if (!_recording) {
    return;
  }

  // If tab has no URL yet, return
  if (!("url" in changeInfo) || changeInfo["url"] == "chrome://newtab/") {
    return;
  }
  // Process the url
  processUrl(tabId, changeInfo["url"]);
});

// Tab close listener
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  // If user has toggled off recording, do nothing
  if (!_recording) {
    return;
  }

  // Wait 1s - if this listener is triggered by application quit,
  // we want to register the close next time Chrome is opened
  // so decrementDomainCount() doesn't quit in the middle of execution

  var closedDomain = tabDomains[tabId];
  setTimeout(function(){
    if (tabId in tabDomains) {
      delete tabDomains[tabId];
      decrementDomainCount(closedDomain);
    }
  }, 1000);
});
