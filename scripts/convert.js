log("Thank you for using Trendyol Currency Converter! Enjoy");

const maxCacheTimeInMillis = 6*3600*1000; // 6 hours
const regex = new RegExp('\\d+\\.\\d+,\\d+\\s*TL');
const regex2 = new RegExp('\\d+\\.\\d+\\s*TL');
const regexAlt = new RegExp('\\d+\\s*TL');
const conversionUrl = "https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/try/gel.json";
var updateInProgress = false;

function log(message) {
    console.log("[Trendyol Converter] " + message);
}

function getRate() {
    let response = httpGet(conversionUrl);
    return response['gel'];
}

function httpGet(url) {
    log("Sending GET request to: " + url)
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false ); // false for synchronous request
    xmlHttp.send( null );
    return JSON.parse(xmlHttp.responseText);
}

function cacheRate(callback) {
    let value = getRate();
    chrome.storage.local.set({ rate : value, savedAt: Date.now() }).then(() => {
        return callback(value);
    });
}

function fetchRate() {
    let callback = processNodes;
    chrome.storage.local.get(['rate', 'savedAt'], function(items) {
        if (items.rate && items.savedAt && items.savedAt > Date.now() - maxCacheTimeInMillis) {
            return callback(items.rate);
        } else {
            return cacheRate(callback);
        }
    });
}

function walkDOM(node,callback) {
    if (node.nodeName != 'SCRIPT') { // ignore javascript
        callback(node);
        for (var i=0; i<node.childNodes.length; i++) {
            walkDOM(node.childNodes[i], callback);
        }
    }
}

function processNodes(rate) {
    updateInProgress = true;
    walkDOM(document.body,function(n){
            if (n.nodeType === 3) {
                if (n.textContent && n.textContent === 'TL' && n.parentNode && n.parentNode.parentNode && n.parentNode.parentNode.parentNode) {
                    replacePrice(n.parentNode.parentNode.parentNode, rate);
                } else {
                    replacePrice(n, rate);
                }
            }
        });
    updateInProgress = false;
}

function replacePrice(n, rate) {
    if (n.textContent && !n.textContent.includes(" GEL)")) {
        let ext;
        if (regex.test(n.textContent)) {
            ext = regex.exec(n.textContent);
        } else if (regex2.test(n.textContent)) {
            ext = regex2.exec(n.textContent);
        } else if (regexAlt.test(n.textContent)) {
            ext = regexAlt.exec(n.textContent);
        } else {
            return;
        }
        for (let i = 0; i < ext.length; i++) {
            let v = ext[i].replace("TL", "").trim();
            if (v.includes(",")) {
                v = v.replaceAll(".","").replace(",", ".");
            }
            const priceGel = (Number(v) * rate).toFixed(2);
            n.textContent = n.textContent.replace(ext[i], ext[i] + ' (' + priceGel + ' GEL)');
        }
    }
}

var timeout = null;
document.addEventListener("DOMSubtreeModified", function() {
    if (!updateInProgress) {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(fetchRate, 500);
    }
}, false);