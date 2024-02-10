console.log("Thank you for using Trendyol Currency Converter! Enjoy")

const liraToGel = 0.086

window.addEventListener('load', function(){
    console.log("Window Loaded")
    const priceText = document.evaluate("/html/body/div[1]/div[5]/main/div/div[2]/div/div[2]/div[2]/div/div[1]/div[2]/div/div/div[3]/div/div/span/font/font", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;
    console.log("Price Text " + priceText).textContent
});