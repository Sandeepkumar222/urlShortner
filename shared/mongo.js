 // importing MongoDb and connecting to client
const { MongoClient } = require("mongodb");
 const client = new MongoClient(process.env.MONGODB_URL);
 const dbname = process.env.MONGODB_NAME;


 const mongo = {
     db : null,
     async connect() {
        await client.connect();
        this.db = client.db(dbname);
        console.log("Connnected to db..."+ dbname);
       
     },
 };
module.exports = mongo;
