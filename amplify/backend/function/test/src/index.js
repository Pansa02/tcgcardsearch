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
    
    let cardResponse = ''
    
    const convertedBody = JSON.parse(event.body)
    console.log(convertedBody['dateTime'])
    const responseBody = convertedBody['e'];
    
    for (let i = 0; i < responseBody.length; i++) {
        let cardName = responseBody[i]["Card Name"]
        let exclusionaryWords = responseBody[i]["Exclusionary Words"]
        let maxPrice = responseBody[i]["Max Price"].replace('$', '')
        let freeShipping = (responseBody[i]["Free Shipping"] === true)
        let immediateBuyout = (responseBody[i]["Immediate Buyout Only"] === true)
        let auctionEndTime = responseBody[i]["Aucton End Time"]
        let endTimeArr = auctionEndTime.split("/")
        
        
        const apiUrlMain = "https://svcs.ebay.com/services/search/FindingService/v1\
?OPERATION-NAME=findItemsAdvanced\
&sortOrder=PricePlusShippingLowest\
&buyerPostalCode=02723&SERVICE-VERSION=1.13.0\
&SECURITY-APPNAME=" + apikey +
"&RESPONSE-DATA-FORMAT=JSON\
&REST-PAYLOAD\
&descriptionSearch=false\
&categoryId=183454\
&categoryName=CCG%20Individual%20Cards"
        
        
        exclusionaryWords = exclusionaryWords.replace(",", "")
        const exclusionaryWordsArr = exclusionaryWords.split(" ")
        
        if (exclusionaryWords !== "") {
            for (let i = 0; i < exclusionaryWordsArr.length; i++) {
                cardName = cardName + " -" + exclusionaryWordsArr[i]
            }
        }

        let url = apiUrlMain
        
        let itemFilterGroup = 0
        
        if (maxPrice !== '') {
            url = url + "&itemFilter(" + String(itemFilterGroup) + ").name=MaxPrice&itemFilter(0).value=" + maxPrice +"&itemFilter(" + String(itemFilterGroup) + ").paramName=Currency&itemFilter(" + String(itemFilterGroup) +").paramValue=USD"
            itemFilterGroup++
        }
        
        if (freeShipping === true) {
            url = url + "&itemFilter(" + String(itemFilterGroup) + ").name=FreeShippingOnly&itemFilter(" + String(itemFilterGroup) + ").value=true"
            itemFilterGroup++
        }
        
        const apiUrlCard = "&keywords=" + cardName
        
        
        if (auctionEndTime !== "//") {
            var addTime = function(str, days, hours, minutes) {
                days = days === "" ? "0" : days
                hours = hours === "" ? "0" : hours
                minutes = minutes === "" ? "0" : minutes
                console.log(days + hours + minutes)
              var myDate = new Date(str);
              myDate.setDate(myDate.getDate() + parseInt(days));
              myDate.setHours(myDate.getHours() + parseInt(hours))
              myDate.setMinutes(myDate.getMinutes() + parseInt(minutes))
              myDate.toISOString()
              console.log(myDate)
              return myDate;
            }
            var adjustedTimeLeft = addTime(convertedBody['dateTime'], endTimeArr[0], endTimeArr[1], endTimeArr[2])
            
            const apiUrlTimeLeft = "&itemFilter(" + String(itemFilterGroup) + ").name=EndTimeTo&itemFilter(" + String(itemFilterGroup) + ").value=" + adjustedTimeLeft.toISOString()
            
            url = url + apiUrlTimeLeft
        }
        
        
        url = url + apiUrlCard

        let apiResult = []
        await axios.get(url)
            .then(result => {
                console.log(result.data.findItemsAdvancedResponse[0]["ack"])
                // console.log(result.data.findItemsAdvancedResponse[0]["errorMessage"][0]["error"])
                apiResult =  result.data
            })
            .catch(error => {
                console.log(error)
            })
        
        const itemsList = apiResult.findItemsAdvancedResponse[0].searchResult[0].item
        
        cardResponse = cardResponse + "-----------" + cardName.toUpperCase() + "-----------\n\n"
        if (apiResult.findItemsAdvancedResponse[0].searchResult[0]['@count'] !== '0') {
            for (let x = 0; x < itemsList.length; x++) {
                
                if (immediateBuyout === true) {
                    if (itemsList[x]["listingInfo"][0].buyItNowAvailable[0] !== "true" && itemsList[x]["listingInfo"][0].listingType[0] !== "FixedPrice") {
                        continue;
                    }
                }
                
                const title = itemsList[x]['title'][0]
                const condition = setCondition(() => itemsList[x]["condition"][0].conditionDisplayName[0])
                const price = itemsList[x]["sellingStatus"][0].convertedCurrentPrice[0]['__value__']
                const shipping = itemsList[x]["shippingInfo"][0].shippingServiceCost[0]['__value__'] + " " + itemsList[x]["shippingInfo"][0].shippingServiceCost[0]['@currencyId']
                const timeLeft = itemsList[x]["sellingStatus"][0].timeLeft[0]
                const itemUrl = itemsList[x]["viewItemURL"][0]
                
                
                cardResponse = cardResponse + "Card: " + title + "\n" + "Price: " + "$" + price + "\n" + "Condition: " + condition + "\n" + "Time left: " + timeLeft + "\n" + "shipping: " + shipping + "\n" + itemUrl + '\n\n'
            
            }
        } else {
            cardResponse = cardResponse + "No matches for " + cardName
        }
        

    }
    
    
    
    
    const response = await {
        statusCode: 200,
    //  Uncomment below to enable CORS requests
     headers: {
         "Access-Control-Allow-Origin": "*",
         "Access-Control-Allow-Headers": "*",
     }, 
        body: await JSON.stringify(cardResponse),
    };
    console.log(response)
    return await response;
};