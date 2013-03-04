var apiUrlOpen = "apiUrlOpen";
var apiUrlClose = "apiUrlClose";

var bkg = chrome.extension.getBackgroundPage();

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
    activeDomains[domain] = 0;
    postToBackend(domain, apiUrlOpen);
  }
  activeDomains[domain] += 1;
}

function decrementDomainCount(domain) {
  // If last tab for that domain, delete from active domains
  if (activeDomains[domain] == 1) {
    delete activeDomains[domain];
    postToBackend(domain, apiUrlClose);
  }
  // Else, decrement
  else {
    activeDomains[domain] = activeDomains[domain] - 1;
  }

};

function postToBackend(domain, targetUrl) {
  var posixTime = Math.round(new Date().getTime() / 1000);
  var postData = {"domain": domain, "time": posixTime};
};

// Replaces subdomain.domain.com with www.domain.com
// ex. maps.google.com --> www.google.com
function getGeneralDomain(domain) {
  var periodIndex = domain.indexOf(".");
  return "www" + domain.substring(periodIndex, domain.length);

}

