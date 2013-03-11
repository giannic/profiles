var apiUrlOpen = "http://127.0.0.1:3000/apps/open";
var apiUrlClose = "http://127.0.0.1:3000/apps/close";
var userid = null;

var bkg = chrome.extension.getBackgroundPage();
bkg.console.log("Loaded")

var tabDomains = {}; // maps tab ids to URLs
var activeDomains = {} // domains that are open already

chrome.tabs.onCreated.addListener(function(tab) {
  tabDomains[tab["id"]] = null;
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {         
  // If tab has no URL yet, return
  if (!("url" in changeInfo) || changeInfo["url"] == "chrome://newtab/") {
    return;
  }

  // Get the domain of the tab
  var url = changeInfo["url"];
  var domain = getGeneralDomain($.url(url).attr("host"));
  console.log("new domain opened: " + domain);
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
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  // Get domain of closed tab
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
  }

};

function postToOpen(domain) {
  var posixTime = Math.round(new Date().getTime() / 1000);
  var postData = {
    "category": "social",
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
  //bkg.console.log("POST to " + apiUrlOpen + ": " + JSON.stringify(postData));
};

function postToClose(domain, appId) {
  var posixTime = Math.round(new Date().getTime() / 1000);
  var postData = {"appid": appId, "close_date": posixTime};
  $.post(apiUrlClose, postData);
  bkg.console.log("POST to " + apiUrlClose + ": " + JSON.stringify(postData));
};

// Replaces subdomain.domain.com with www.domain.com
// ex. maps.google.com --> www.google.com
function getGeneralDomain(domain) {
  var periodIndex = domain.indexOf(".");
  return "www" + domain.substring(periodIndex, domain.length);
}

chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
  userid = message["userid"];
  console.log("logged in as " + userid);
});

