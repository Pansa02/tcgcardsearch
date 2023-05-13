/*
Use the following code to retrieve configured secrets from SSM:

const aws = require('aws-sdk');

const { Parameters } = await (new aws.SSM())
  .getParameters({
    Names: ["ebayAPIKey"].map(secretName => process.env[secretName]),
    WithDecryption: true,
  })
  .promise();

Parameters will be of the form { Name: 'secretName', Value: 'secretValue', ... }[]
*/


/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
 
const axios = require('axios');

async function getApiKey() {
    const aws = require('aws-sdk');
    const { Parameters } = await (new aws.SSM())
    .getParameters({
        Names: ["ebayAPIKey"].map(secretName => process.env[secretName]),
        WithDecryption: true,
    })
    .promise();
    
    const apiKey = Parameters.pop().Value
    return apiKey
}

function setCondition(conditionVal, catchVal) {
    try {
        return conditionVal();
    } catch (e) {
        if (catchVal) catchVal(e);
        return "N/A"
    }
}

exports.handler = async (event) => {
    const apikey = await getApiKey()
    
    let cardResponse = 'cardResponse :\n'
    
    const responseBody = event['e'];
    
    for (let i = 0; i < responseBody.length; i++) {
        let cardName = responseBody[i]["Card Name"]
        let exclusionaryWords = responseBody[i]["Exclusionary Words"]
        let maxPrice = responseBody[i]["Max Price"].replace('$', '')
        let freeShipping = responseBody[i]["Free Shipping"]
        let immediateBuyout = responseBody[i]["Immediate Buyout Only"]
        let auctionEndTime = responseBody[i]["Aucton End Time"]
        
        const url = ("https://svcs.ebay.com/services/search/FindingService/v1\
?OPERATION-NAME=findItemsAdvanced\
&sortOrder=PricePlusShippingLowest\
&buyerPostalCode=92128&SERVICE-VERSION=1.13.0\
&SECURITY-APPNAME=" + apikey +
"&RESPONSE-DATA-FORMAT=JSON\
&REST-PAYLOAD\
&descriptionSearch=false\
&categoryId=183454\
&categoryName=CCG%20Individual%20Cards\
&itemFilter(0).name=MaxPrice\
&itemFilter(0).value=" + maxPrice +
"&itemFilter(0).paramName=Currency\
&itemFilter(0).paramValue=USD\
&keywords=" + cardName)
        // const apiResult = await fetch(url)
        // .then(data=>{return data.json()})
        // .then(res=>{console.log(res)})
        // .catch(error=>console.log(error))
        // const apiResult = await getUrlResponse(url)
        let apiResult = []
        await axios.get(url)
            .then(result => {
                apiResult =  result.data
            })
            .catch(error => {
                console.log("THIS IS AN ERROR!!")
                console.log(error)
            })
        
        console.log(apiResult)
        console.log(apiResult.findItemsAdvancedResponse[0].searchResult[0])
        console.log(apiResult.findItemsAdvancedResponse[0].searchResult[0].item[0])
        
        const itemsList = apiResult.findItemsAdvancedResponse[0].searchResult[0].item
        
        // for (let x = 0; x < itemsList.length; x++) {
        //     console.log(itemsList[x]['title'][0])
        // }
        console.log(itemsList[0])
        
        if (apiResult.findItemsAdvancedResponse[0].searchResult[0]['@count'] !== '0') {
            console.log("@count > 0")
            for (let x = 0; x < itemsList.length; x++) {
                
                const title = itemsList[x]['title'][0]
                const condition = setCondition(() => itemsList[x]["condition"][0])
                const price = itemsList[x]["sellingStatus"][0].convertedCurrentPrice[0]['__value__']
                const shipping = itemsList[x]["shippingInfo"][0].shippingServiceCost[0]['__value__'] + " " + itemsList[x]["shippingInfo"][0].shippingServiceCost[0]['@currencyId']
                const timeLeft = itemsList[x]["sellingStatus"][0].timeLeft[0]
                const itemUrl = itemsList[x]["viewItemURL"][0]
                
                cardResponse = cardResponse + "Card: " + title + "\n" + "Price: " + "$" + price + "\n" + "Condition: " + condition + "\n" + "Time left: " + timeLeft + "\n" + "shipping: " + shipping + "\n" + itemUrl + '\n\n'
            }
        } else {
            console.log("No matches for " + cardName)
        }
        

    }
    console.log(cardResponse)
    
    
    
    
    const response = await {
        statusCode: 200,
    //  Uncomment below to enable CORS requests
     headers: {
         "Access-Control-Allow-Origin": "*",
         "Access-Control-Allow-Headers": "*",
     }, 
        body: JSON.stringify(cardResponse),
        // body: JSON.stringify(responseBody),
    };
    return response;
};