log("Thank you for using Trendyol Currency Converter! Enjoy");

const liraToGel = getRate();
const regex = new RegExp('\\d+\\.\\d+');
const regexAlt = new RegExp('\\d+');

function main() {
    log("Window Loaded");
    setTimeout(function() {document.documentElement.style.display = '';}, 10000);
    let priceDocument = document.evaluate("//div[contains(@class, 'product-price-container')]//font[contains(text(), ' TL')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    const priceText = priceDocument.textContent;
    log("Price Text " + priceText);
    let priceTy = regex.exec(priceText);
    if (priceTy == null) {
        priceTy = regexAlt.exec(priceText);
    }
    const priceGel = (Number(priceTy) * liraToGel).toFixed(2);
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
    return 0.086;
}