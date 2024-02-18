log("Thank you for using Trendyol Currency Converter! Enjoy");

const maxCacheTimeInMillis = 6*3600*1000; // 6 hours
const regex = new RegExp('\\d+\\.\\d+');
const regexAlt = new RegExp('\\d+');
const conversionUrl = "https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/try/gel.json";

function main() {
    log("Window Loaded");

    cacheRate(getRate());
    fetchRate()
    // getCachedObject('rate');

    setTimeout(function() {document.documentElement.style.display = '';}, 10000);
    let priceDocument = document.evaluate("//div[contains(@class, 'product-price-container')]//font[contains(text(), ' TL')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    const priceText = priceDocument.textContent;
    log("Price Text " + priceText);
    let priceTy = regex.exec(priceText);
    if (priceTy == null) {
        priceTy = regexAlt.exec(priceText);
    }
    const priceGel = (Number(priceTy) * getRate()).toFixed(2);
    priceDocument.textContent = priceText + ' (' + priceGel + ' GEL)';
}

window.addEventListener('load', function(){
    setTimeout(main, 1500);
});

function log(message) {
    console.log("[Trendyol Converter] " + message);
}

// TODO: make this dynamic.
// send HTTP GET request to get the current exchange rate between TY & GEL
function getRate() {
    return 0.085;
    // let response = httpGet(conversionUrl);
    // return response['gel'];
}

function httpGet(theUrl) {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return JSON.parse(xmlHttp.responseText);
}

function cacheRate() {
    let value = getRate();
    chrome.storage.local.set({ rate : value, savedAt: Date.now() }).then(() => {
        log("Saving value: " + value + " in cache");
        return value;
    });
}

function fetchRate() {
    chrome.storage.local.get(['rate', 'savedAt'], function(items) {
        log(items.rate)
        log(items.savedAt)
        if (items.rate && items.savedAt) {
            if (items.savedAt > Date.now() - maxCacheTimeInMillis) {
                log(items.rate);
                return items.rate; // Serialization is auto, so nested objects are no problem
            }
        }
        return cacheRate();
    });
}