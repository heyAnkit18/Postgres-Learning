const {Client}=require('pg');


const client=new Client({
    user:"postgres",
    host:"localhost",
    database:"DemoDB",
    password:"1806",
    port:"5432",
});

client.connect().then(()=>{
    console.log("Connected to postgreSql")
}).catch((err)=>{
    console.error('Error in Database:', err)
})