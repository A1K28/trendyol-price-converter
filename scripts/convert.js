log("Thank you for using Trendyol Currency Converter! Enjoy");

const maxCacheTimeInMillis = 6*3600*1000; // 6 hours
const regex = new RegExp("(\\d+(\\.|\\,))?\\d+((\\.|\\,)\\d\\d)?\\s*TL");
const conversionUrl = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/try.json"
var updateInProgress = false;

function log(message) {
    console.log("[Trendyol Converter] " + message);
}

function getRate() {
    let response = httpGet(conversionUrl);
    return response['try']['gel'];
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
        let text = n.textContent.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
        if (!regex.test(text)) return;
        let ext = regex.exec(text);
        while (ext) {
            text = text.replace(ext[0], "");
            let i = 0;
            if (!ext[i] || ext[i].length < 3) break;
            let v = ext[i].replace("TL", "").trim();
            if (!(v[v.length-3] === ',' || v[v.length-3] === '.')) v += "00";
            v = v.replaceAll(".","").replaceAll(",", "");
            v = v.substring(0, v.length-2) + "." + v.substring(v.length-2);
            const priceGel = (Number(v) * rate).toFixed(2);
            // log("match: " + ext + " v: " + v + " priceGel: " + priceGel);
            n.textContent = n.textContent.replace(/[\u200B-\u200D\uFEFF]/g, '').trim().replace(ext[i], ext[i] + ' (' + priceGel + ' GEL)');
            if (text.length < 3) break;
            ext = regex.exec(text);
        };
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