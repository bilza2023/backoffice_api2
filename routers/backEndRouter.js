require('dotenv').config(); 
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const express = require('express');
const addQuestion = require('./addQuestion.js');
const getModel = require('./getModel.js');
const backEndRouter = express.Router();
/////////////////////////////////////////////////

backEndRouter.use((req, res, next) => {
  try {
  const token = req.headers.authorization.split(" ")[1]; 
  if (!token) {
    return res.status(401).json({ message: 'Missing Authorization token' });
  }
  
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; 
    req.isAdmin = req.user.status === "admin"; 
    next(); 
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
});
//////////////////////////////////
backEndRouter.post("/syllabus", async function (req, res) {
   try {
  //  debugger;
   const tcode  = req.body.tcode;
    // console.log('tcode:', tcode); 
  
  if (!tcode) {return  res.status(400).json({ message: "missing data" }); }
  const theMdl = await getModel(tcode);
  if(!theMdl) { return res.status(404).json({ ok:false, message: "tcode not found" });}

 const questions = await theMdl.find({}).select({
      classNo: 1,
      chapter: 1,
      board: 1,
      exercise:1,
      sortOrder:1,
      questionNo:1,
      part:1,
      name:1,
      questionType: 1,
      status: 1,
      filename: 1,
      filledBy:1
  });

      return res.status(200).json({ questions, message: "success",ok:true  });

  } catch (error) {
    console.error(error);
     return res.status(500).json({ ok:false, message: "failed to load syllabus" });
    // return res.status(500).json({ message: 'Unknown error!' });
  }
});
////////////////////////////////////////////////////////
backEndRouter.post("/update" , async function(req,res) {
  try {
  debugger;
  const presentation = req.body.presentation;
  const id  = presentation._id;
  const tcode  = req.body.tcode;
  
  if (!id || !tcode) {return  res.status(400).json({ message: "missing data" }); }
  
  const theMdl = await getModel(tcode);
  if(!theMdl) { return res.status(404).json({ ok:false, message: "tcode not found" });}

   const options = { new: false, upsert: false };
   const tf  = await theMdl.findByIdAndUpdate(id,presentation, options);
      if (tf   ){
        return res.status(200).json({ message: 'success' });
      }else {
        return res.status(404).json({ message: "failed to save" });
      }

  } catch(error) {
    return res.status(400).json({message : 'unknown error!'  });
  }
});
////////////////////////////////////////////////////////
backEndRouter.post("/read" , async function(req,res) {
  try {
  //debugger;
   const id  = req.body.id;
  const tcode  = req.body.tcode;
  if (!id || !tcode) {return  res.status(400).json({ message: "missing data" }); }
  
   const theMdl = await getModel(tcode);
  if(!theMdl) { return res.status(404).json({ ok:false, message: "tcode not found" });}

   const item  = await theMdl.findById(id).lean();
      if (item !== null   ){
        return res.status(200).json({item});
      }else {
        return res.status(404).json({ message: "Not found" });
      }

  } catch(error) {
    return res.status(400).json({message : 'unknown error!'  });
  }
});
////////////////////////////////////////////////////////
backEndRouter.post("/add_question" , async function(req,res) {
  try {
    debugger;
   const qData  = req.body.qData;
   const result = await addQuestion(qData);
    if (result.ok  ){
      return res.status(200).json({ question: result.question, message: "success" });
    }else {
      return res.status(404).json({ message: result.message });
    }                  
  } catch(error) {
    return res.status(400).json({message : 'unknown error!'  });
  }
});
////////////////////////////////////////////////////////
backEndRouter.post("/copy_question" , async function(req,res) {
 try{
  const idFrom  = req.body.idFrom;
  const idTo  = req.body.idTo;
  const tcodeFrom  = req.body.tcodeFrom;
  const tcodeTo  = req.body.tcodeTo;

  if (!idTo || !tcodeTo) {return res.status(400).json({ message: "missing data" }); }

  if (!idFrom || !tcodeFrom) {return  res.status(400).json({ message: "missing data" }); }

   const theMdlFrom = await getModel(tcodeFrom);
   if(!theMdlFrom) { return res.status(404).json({ ok:false, message: "tcode From not found" });}
    let objectId = new mongoose.Types.ObjectId(idFrom);
    const question = await theMdlFrom.findById(objectId );    
     if (!question){
        return res.status(404).json({message : "question not found"});
     }
  const theMdlTo = await getModel(tcodeTo);
  if(!theMdlTo) { return res.status(404).json({ ok:false, message: "tcode From not found" });}
  debugger;
  let objectIdTo = new mongoose.Types.ObjectId(idTo);
  const questionTo = await theMdlTo.findById(objectIdTo ); 
  if (!questionTo){
        return res.status(404).json({message : "question not found"});
     }
 questionTo.slides = question.slides;
  const options = { new: false, upsert: false };
   const tf  = await theMdlTo.findByIdAndUpdate(objectIdTo,questionTo, options);
      if (tf   ){
        return res.status(200).json({ message: 'success' });
      }else {
        return res.status(404).json({ message: "failed to save" });
      }

 }catch(e){
  return res.status(400).json({msg : 'unknown error!'  });
 }
});
////////////////////////////////////////////////////////
backEndRouter.post("/delete_question" , async function(req,res) {
  try {

debugger;
  const id  = req.body.id;
  const tcode  = req.body.tcode;
  if (!id || !tcode) {return  res.status(400).json({ message: "missing data" }); }
  
   const theMdl = await getModel(tcode);
  if(!theMdl) { return res.status(404).json({ ok:false, message: "tcode not found" });}

   let objectId = new mongoose.Types.ObjectId(id);
     const question = await theMdl.findById(objectId );    
     if (!question){
        return res.status(404).json({message : "question not found"});
     }
     if (question.slides.length > 0){
            return res.status(400).json({message : "question has content"});
     }
     
     await theMdl.findByIdAndRemove(objectId );    
     return res.status(200).json({message : 'question deleted'  });
      
  } catch(error) {
    return res.status(400).json({msg : 'unknown error!'  });
  }
});
////////////////////////////////////////////////////////
module.exports = backEndRouter;
////////////////////////////////////////////////////////
