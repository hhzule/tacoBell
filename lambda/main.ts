const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event: any) => {
    console.log(event);
    const body = JSON.parse(event.body);

    switch (event.info.fieldName) {
        case 'getCurrent':
            // code to get current weather, and store in DynamoDB
             try {
                 const temp = Math.floor(Math.random() * 50 + 10) // dummy temperature
                 const year = new Date().getFullYear(); // current year to make unique id with zipcode

                // get current date
                 let today: any = new Date();
                 let dd = String(today.getDate()).padStart(2, '0');
                let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                let yyyy = today.getFullYear();
                today = mm + '/' + dd + '/' + yyyy;
 
         const params = {
             TableName: process.env.TODOS_TABLE,
             Key: {
                 id: `${event.arguments.zipcode}${year}` // date as unique id
             },
             ExpressionAttributeNames: { "#city": `${today.toString()}` },
             ExpressionAttributeValues: { ":city": `${temp}` },
             UpdateExpression: "set #city = :city",
             ReturnValues: "UPDATED_NEW"
         };
         const todos = await docClient.update(params).promise();
         return temp;
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



   
