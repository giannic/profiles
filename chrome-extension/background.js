//$(document).ready(function() {

var apiUrlOpen = "http://127.0.0.1:3000/apps/open";
var apiUrlClose = "http://127.0.0.1:3000/apps/close";
var userid = null;
var bkg = chrome.extension.getBackgroundPage();

loadUserId();
bkg.console.log("Loaded")

var tabDomains = {}; // maps tab ids to URLs
var activeDomains = {} // domains that are open already

chrome.management.onInstalled.addListener(function(info) {
  registerAllTabs();
});

chrome.management.onEnabled.addListener(function(info) {
  registerAllTabs();
});

function registerAllTabs() {
  var windows_ = [];
  chrome.windows.getAll({"populate": true}, function(windows) {
    windows_ = windows;
  });
  for (var i = 0; i < windows_.length; i ++ ) {
    var tabs = windows_[i].tabs;
    for (var j = 0; j < tabs; j ++ ) {
      var id = tabs[j].id;
      var url = tabs[j].url;
      processUrl(id, url);
    }
  }
}

function loadUserId() {
  userid = chrome.storage.local.get({"userid": null}, function(items) {
    userid = items.userid; 
  });
  bkg.console.log("Loaded userid " + userid);
}

chrome.tabs.onCreated.addListener(function(tab) {
  bkg.console.log("tab created!");
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

function processUrl(tabId, url) {
  var domain = getGeneralDomain($.url(url).attr("host"));
  // If user opened chrome://*, ignore and return
  if (domain == "chrome") {
    return false;
  }
  console.log("tab navigated to domain: " + domain);
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

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  bkg.console.log("closed tab " + tabId);
  var closedDomain = tabDomains[tabId];
  delete tabDomains[tabId];

  decrementDomainCount(closedDomain);
});

function incrementDomainCount(domain) {
  if (!(domain in activeDomains)) {
    activeDomains[domain] = {"count": 0};
    if (userid) {
      postToOpen(domain);
    }
  }
  activeDomains[domain]["count"] += 1;
  bkg.console.log(activeDomains[domain]["count"] + " tabs open for " + 
    domain);
}

function decrementDomainCount(domain) {
  // If last tab for that domain, delete from active domains
  if (activeDomains[domain]["count"] == 1) {
    var appId = activeDomains[domain]["appId"];
    console.log("about to close appId " + appId);
    delete activeDomains[domain];
    if (userid) {
      postToClose(domain, appId);
    }
  }
  // Else, decrement
  else {
    activeDomains[domain]["count"] = activeDomains[domain]["count"] - 1;
    bkg.console.log(activeDomains[domain]["count"] + " tabs open for " + domain);
  }

};

function postToOpen(domain) {
  var posixTime = Math.round(new Date().getTime() / 1000);
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
  bkg.console.log("POST to " + apiUrlOpen + ": " + JSON.stringify(postData));
};

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

function postToClose(domain, appId) {
  var posixTime = Math.round(new Date().getTime() / 1000);
  var postData = {"appid": appId, "close_date": posixTime};
  $.post(apiUrlClose, postData);
  bkg.console.log("POST to " + apiUrlClose + ": " + JSON.stringify(postData));
};

// Replaces subdomain.domain.com with www.domain.com
// ex. maps.google.com --> www.google.com
function getGeneralDomain(domain) {
  if (domain.indexOf("chrome://") !== -1) {
    return "chrome";
  }

  var firstIndex = domain.indexOf(".");
  if (firstIndex == domain.lastIndexOf(".")) {
    return domain;
  }
  return domain.substring(firstIndex + 1, domain.length);
  /*
  var truncateIndex = domain.indexOf(".") + 1;
  if (domain.indexOf("www") == -1) {
    truncateIndex = domain.indexOf("/") + 1; // Index of second slash in http(s)://
  }
  return domain.substring(truncateIndex, domain.length);
  */
}

chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
  userid = message["userid"];
  chrome.storage.local.set({"userid": userid}, function() {
    console.log("Stored user id")
  });
  console.log("logged in as " + userid);
});

//});
