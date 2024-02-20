require('dotenv').config();
//.......................................................
const express  =require('express');
const cors = require('cors');
const db = require("./mongoDb/mongo.js");
/////////////////////////////////////////////----->>>>
const backEndRouter = require('./routers/backEndRouter.js');
const auth = require('./routers/auth.js');
////////////////////////////////////////////////
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 5000;
////////////////////////////////////////////////////
// debugger;
const app = express()
app.use(cookieParser());
app.use(express.json());
app.use(cors( )); //working
app.use(express.urlencoded({ extended: true }));

/////.. Route middlewares--/////
app.use("/be",backEndRouter);
app.use("/auth",auth);

///////////////////////////Routes////////////////////////
app.get('/', async (req, res) =>{
res.status(500).json({success :true ,  message : "Welcome to BackOffice API"});
});
////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
db.once('open',()=> {
    console.log("MongoDb ===> connection established")
    app.listen(PORT, ()=>{console.log(`listening on port ${PORT}`)});
});
///////////////////////////////////////////////////////////////////////






