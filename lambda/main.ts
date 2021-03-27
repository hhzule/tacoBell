const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
import axios from "axios"

exports.handler = async (event: any) => {
    console.log(event);
  

    switch (event.info.fieldName) {
        case 'getCurrent':
            try{
            // code to get current weather, and store in DynamoDB

            // first get the coordinates using zipcode
                let lat;
                let lng;
                const getcity = await axios.get(`https://www.zipcodeapi.com/rest/X1paJY65GOw2Rv9pGbkIIuqzpwBEZOuiuXhhPnfFbIad4HB3kqF70rL2qBiLFpHM/info.json/${event.arguments.zipcode}/degrees`)
                    .then(function (response) {
                  
                    lat = response.data.lat;
                    lng = response.data.lng
                });

                // get weather using coordinates
                let result;
                    const getweather = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=a1c75fcafe88cc8d0c19e0ff95b22d83`)
                    .then(function (response) {
                    console.log(response.data.main.temp, "weahther");
                  result = response.data.main.temp
                });

                // const temp = Math.floor(Math.random() * 50 + 10); // dummy temperature

                // current year to make unique id with zipcode
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

                // add to dy1namoDB
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


// http://www.zipcodeapi.com/rest/X1paJY65GOw2Rv9pGbkIIuqzpwBEZOuiuXhhPnfFbIad4HB3kqF70rL2qBiLFpHM/info.json/75600/radians"
   
// X1paJY65GOw2Rv9pGbkIIuqzpwBEZOuiuXhhPnfFbIad4HB3kqF70rL2qBiLFpHM