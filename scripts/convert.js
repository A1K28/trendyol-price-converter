log("Thank you for using Trendyol Currency Converter! Enjoy");

const maxCacheTimeInMillis = 6*3600*1000; // 6 hours
const regex = new RegExp('\\d+\\.\\d+ TL');
const regexAlt = new RegExp('\\d+ TL');
const conversionUrl = "https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/try/gel.json";
var updateInProgress = false;

function update(rate) {
    // log("Window Loaded");
    // processNodes(rate);
    // let priceDocument = document.evaluate("//div[contains(@class, 'product-price-container')]//font[contains(text(), ' TL')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    // const priceText = priceDocument.textContent;
    // log("Price Text " + priceText);
    // let priceTy = regex.exec(priceText);
    // if (priceTy == null) {
    //     priceTy = regexAlt.exec(priceText);
    // }
    // const priceGel = (Number(priceTy) * rate).toFixed(2);
    // priceDocument.textContent = priceText + ' (' + priceGel + ' GEL)';
}

// window.addEventListener('load', function(){
//     setTimeout(fetchRate, 1500);
// });

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
        log("Saving value: " + value + " in cache");
        return callback(value);
    });
}

function fetchRate() {
    let callback = processNodes;
    chrome.storage.local.get(['rate', 'savedAt'], function(items) {
        if (items.rate && items.savedAt && items.savedAt > Date.now() - maxCacheTimeInMillis) {
            log('Retrieving a cached rate: ' + items.rate);
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
                log(n.textContent);
                if (n.textContent && !n.textContent.includes(" GEL)") && (regex.test(n.textContent) || regexAlt.test(n.textContent))) {
                    let ext;
                    if (regex.test(n.textContent)) {
                        ext = regex.exec(n.textContent);
                    } else if (regexAlt.test(n.textContent)) {
                        ext = regexAlt.exec(n.textContent);
                    }
                    for (let i = 0; i < ext.length; i++) {
                        const priceGel = (Number(ext[i].replace(" TL", "")) * rate).toFixed(2);
                        console.log(ext[i] + " " + ext[i].replace(" TL", "") + " " + priceGel)
                        n.textContent = n.textContent.replace(ext[i], ext[i] + ' (' + priceGel + ' GEL)');
                    }
                }
            }
        });
    updateInProgress = false;
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