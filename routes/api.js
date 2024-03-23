'use strict';
const bodyParser  = require('body-parser'); // MY CODE
const express     = require('express');
let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ↓ ↓ ↓ MY CODE ↓ ↓ ↓ 
let mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);
// --- SCHEMA FOR ISSUES
const issueSchema = new mongoose.Schema({
  "issue_title": {
    type: String,
    required: true,
    // unique: true
  },
  "issue_text": {
    type: String,
    required: true
  },
  // "created_on": {
  //   type: Date,
  //   default: Date.now
  // },
  // "updated_on": {
  //   type: Date,
  //   default: Date.now
  // },
  "created_by": {
    type: String,
    required: true
  },
  "assigned_to": {
    type: String,
    default: ""
  }
  ,
  "open": {
    type: Boolean,
    default: true
  },
  "status_text": {
    type: String,
    default: ""
  },
  "project_name": {
    type: String
  }
}
,{ timestamps: { createdAt: 'created_on', updatedAt: 'updated_on' } }
)

let Issue = mongoose.model("Issue", issueSchema);
// ↑ ↑ ↑ MY CODE ↑ ↑ ↑ 

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      // let _id = req.query._id || /.+/; // THE REGEX DOESN'T WORK BECAUSE _id IS OF TYPE ObjectId, WHICH WORKS DIFFERENTLY FROM STRINGS.
      let issue_title = req.query.issue_title || /.+/;
      let issue_text = req.query.issue_text || /.+/;
      let created_by = req.query.created_by || /.+/;
      let assigned_to = req.query.assigned_to || /.*/ ;
      // let open = req.query.open || true || false;
      let open = req.query.open;
      // let created_on = req.query.created_on || /.+/;
      // let updated_on = req.query.updated_on || /.+/;
      let status_text = req.query.status_text || /.*/;

      Issue.find({
        // "_id": _id,
        "issue_title": issue_title,
        "issue_text": issue_text,
        "created_by": created_by,
        "assigned_to": assigned_to,
        // "open": open || (true|false),
        $or: [{"open": open}, {"open": {$exists:true} }],
        // "created_on": created_on,
        // "updated_on": updated_on,
        "status_text": status_text,
        "project_name": project
      })
      // .select({"__v": 0})
      .then(issueData=>{
        // console.log("Tuki");
        res.json(issueData);
        // res.send(issueData.length.toString());
        // res.send({"arrayLength": issueData.length, ARRAY_DE_DATOS: issueData})
        })
      .catch(err=>{
        console.log("Salió mal")
      })
    })
    
    .post(function (req, res){
      let project = req.params.project;
      // let title = req.body.issue_title;
      // let description = req.body.issue_text;
      // let author = req.body.created_by;
      // let asignee = req.body.assigned_to;
      // let status = req.body.status_text;

      // const createIssue=(done)=>{
        new Issue({
          issue_title: req.body.issue_title,
          issue_text: req.body.issue_text,
          created_by: req.body.created_by,
          assigned_to: req.body.assigned_to,
          status_text: req.body.status_text,
          project_name: project
        }).save()
        // --- APPARENTLY .save() NO LONGER ACCEPTS CALLBACKS
        // .save(function(err, issueData){
        //     if(err){console.error(err); return};
        //     done(null, console.log(`Added ${issueData}`))
        //   })
        // .select({"__v": 0, "_id":0}) // DIDN'T WORK
        .then(issueData => {
          // res.send(issueData);
          res.json({
            assigned_to: issueData.assigned_to,
            status_text: issueData.status_text,
            open: issueData.open,
            _id: issueData._id,
            issue_title: issueData.issue_title,
            issue_text: issueData.issue_text,
            created_by: issueData.created_by,
            created_on: issueData.created_on,
            updated_on: issueData.updated_on
          })
          // console.log(`Pasó perri`)
        })
        .catch(err =>{
          // console.error("Didn't work", err);
          // throw new Error("error: 'required field(s) missing'")
          res.send({error: 'required field(s) missing'})
        })
      // }

    })
    
    .put(function (req, res){
      let project = req.params.project;
      let _id = req.body._id;
      // IF _ID WAS NOT SENT:
      if(!_id){
        res.send({error: 'missing _id'});
        return
      };
      // CREATE OBJECT WITH VALUES FROM INPUT FIELDS
      let obj = {
       "issue_title": req.body.issue_title,
       "issue_text": req.body.issue_text,
       "created_by" : req.body.created_by,
       "assigned_to": req.body.assigned_to,
       "open" :req.body.open, //|| "", 
       "status_text": req.body.status_text
      }
      // let openKey = req.body.open == "false" ? false : true;
      // IF ALL INPUT FIELDS ARE EMPTY:
      if(Object.values(obj).every(field=>!field)){
        // if(openKey==data.open){
          // SEND ERROR
          res.send({error: 'no update field(s) sent', '_id': _id});
          return
        // }
      }
      // let objKeys = Object.keys(obj);
      // IF THERE'S SOMETHING TO CHANGE
      Issue.findById({"_id": _id})
      .then(data => {
        // LOOP THROUGH ALL THE SUBMITTED FIELDS
        for(let key in obj) {
          // IF SUBMITTED FIELD IS DIFFERENT FROM ORIGINAL FIELD AND IT'S NOT AN EMPTY STRING
          if(data[key] != obj[key] && obj[key] ){
            // UPDATE ORIGINAL FIELD TO NEW FIELD
            data[key] = obj[key]
          }
        }
        // SET UPDATE DATE
        // data.updated_on = new Date();
        // data.updated_on = Date.now;
        // SAVE UPDATED DATA IN MONGOOSE
        data.save()
        // IF SUCCESSFUL
        .then(updatedData=>{
          // done(null, updatedData); // IS THIS NECESSARY?
          res.send({result: 'successfully updated', '_id': _id});
        })
        // IF UNSUCCESSFUL
        .catch(err=>{
          res.send({error: 'could not update', '_id': _id})
          // ↑ ↑ EL PROBLEMA LLEGA HASTA ACÁ
        })
      })
      // IF MONGO FAILED TO FIND OBJECT BY ID
      .catch(err=>{
        res.send({error: 'could not update', '_id': _id})
      })
    }) 
      
    

    .delete(function (req, res){
      let project = req.params.project;
      let _id = req.body._id;
      if(!_id){
        return res.send({error: 'missing _id'})
      };

      Issue.findOneAndDelete ({"_id": _id})
      .then(removedIssue=>{
        if(removedIssue){
          res.send({result: 'successfully deleted', '_id': _id });
        }else{
          res.send({error: 'could not delete', '_id': _id })
        }
      })
      .catch(err=>{
        res.send({error: 'could not delete', '_id': _id })
      })
    });
    
};
