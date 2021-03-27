const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
import axios from "axios"

exports.handler = async (event: any) => {
    console.log(event);
  

    switch (event.info.fieldName) {
        case 'getCurrent':
            try{
            // code to get current weather, and store in DynamoDB
                // get weather using zipcode
                let result;
                const getweather = await axios.get(`https://api.weatherapi.com/v1/current.json?key=03c6f672b8c64399851185215212703&q=${event.arguments.zipcode}&aqi=no`)
                .then(function (response) {
                console.log(response, "weahther");
              result = response.data.current.temp_c
            });

                const year = new Date().getFullYear();
                // get current date
                let today: any = new Date();
                let dd = String(today.getDate()).padStart(2, '0');
                let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                let yyyy = today.getFullYear();
                today = mm + '/' + dd + '/' + yyyy;

                // params object for Dynamo1DB
                const params = {
                    TableName: process.env.TODOS_TABLE,
                    Key: {
                        id: `${event.arguments.zipcode}${year}` // date as unique id
                    },
                    ExpressionAttributeNames: { "#city": `${today.toString()}` },
                    ExpressionAttributeValues: { ":city": `${result}` },
                    UpdateExpression: "set #city = :city",
                    ReturnValues: "UPDATED_NEW"
                };

                // add to dynamoDB
                const todos = await docClient.update(params).promise();
                // return the weather
                return `${result}°C`;
            }
            catch (err) {
                console.log("ERRROR", err);
                return err;
            }
 
        case 'getData':
            // code
            try {
                const year = event.arguments.input.year
                const zipcode = event.arguments.input.zipcode
                const key = zipcode + year;
                    const params = {
                  TableName: process.env.TODOS_TABLE,
                  Key: {
                      id: key
                  }
              };
    
                const todos = await docClient.get(params).promise();
                    // format the return type to be an object as per schema
                   let result= []
                   for (const [key, value] of Object.entries(todos.Item)) {
                       const data = {
                       "date": key,
                       "temp": value
                       }
                       result.push(data)
                    }
                    //  filter out the id (key, value)
                    let res = result.filter((obj)=> { return obj.date != 'id'})
       
                return res
                
             } catch (err) {
                     console.log("ERRROR", err);
              return err;
             }
        default:
            return "nothing"
    }
}

