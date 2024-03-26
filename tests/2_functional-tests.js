const chai = require('chai');
const assert = chai.assert;

const server = require('../server');

const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const mocha = require('mocha');  // FROM CHATGPT
const before = mocha.before;   // FROM CHATGPT



suite('Functional Tests', function () {
    this.timeout(5000);
    suite('POST tests', () => {
      // TEST #1
        test('Create an issue with every field: POST request to /api/issues/{project}', function (done) {
         chai
          .request(server)
          .keepOpen()
          .post('/api/issues/test')
          .send({
            issue_title: "Test Issue 1",
            issue_text: "Testing...",
            created_by: "Rodrigo",
            assigned_to: "Steve",
            status_text: "Urgent",
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, 'Test Issue 1');
            assert.equal(res.body.issue_text, "Testing...");
            assert.equal(res.body.created_by, "Rodrigo");
            assert.equal(res.body.assigned_to, "Steve");
            assert.equal(res.body.status_text, "Urgent");
            assert.equal(res.body.open, true);
            // assert.equal(res.body.project_name, "test"); // project_name DOESN'T DISPLAY IN THE RESPONSE
            assert.property(res.body, "_id");
            // done();
          });
         chai
          .request(server)
          .keepOpen()
          .post('/api/issues/test')
          .send({
            issue_title: "Issue to be updated",
            issue_text: "Update this",
            created_by: "Rodrigo",
            assigned_to: "Bob",
            status_text: "Urgent",
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, 'Issue to be updated');
            assert.equal(res.body.issue_text, "Update this");
            assert.equal(res.body.created_by, "Rodrigo");
            assert.equal(res.body.assigned_to, "Bob");
            assert.equal(res.body.status_text, "Urgent");
            assert.equal(res.body.open, true);
            assert.property(res.body, "_id");
            done();
          });
        });
      // TEST #2
        test("Create an issue with only required fields", function(done){
         chai
            .request(server)
            .keepOpen()
            .post("/api/issues/test")
            .send({
                issue_title: "Test Issue 2",
                issue_text: "Tested",
                created_by: "Rodri",  
            })
            .end((err, res)=>{
                assert.equal(res.status, 200);
                assert.equal(res.body.issue_title, "Test Issue 2");
                assert.equal(res.body.issue_text, "Tested");
                assert.equal(res.body.created_by, "Rodri");
                assert.equal(res.body.assigned_to, "");
                assert.equal(res.body.status_text, "");
                assert.equal(res.body.open, true);
                // assert.equal(res.body.project_name, "test"); project_name DOESN'T DISPLAY IN THE RESPONSE
                assert.isString(res.body._id);
                done()
            })
        });
      // TEST #3
        test("Create an issue with missing required fields", function(done){
          chai
              .request(server)
              .keepOpen()
              .post("/api/issues/test")
              .send({})
              .end((err, res)=>{
                  assert.equal(res.status, 200); //
                  assert.isObject(res.body); //
                  assert.equal(res.text, '{"error":"required field(s) missing"}');
                  assert.equal(res.body.error, 'required field(s) missing'); //
                  done()
            })
        });
    })
    suite('GET tests', () => {
      // TEST #4
      test("View issues on a project", function(done){
        chai
          .request(server)
          .keepOpen()
          .get("/api/issues/test")
          .end((err, res)=>{
            assert.isArray(res.body);
            assert.isObject(res.body[0]);
            assert.property(res.body[0], "_id");
            assert.property(res.body[0], "issue_title");
            assert.property(res.body[0], "issue_text");
            assert.property(res.body[0], "created_by");
            assert.property(res.body[0], "assigned_to");
            assert.property(res.body[0], "open");
            assert.property(res.body[0], "status_text");
            assert.property(res.body[0], "created_on");
            assert.property(res.body[0], "updated_on");
            assert.property(res.body[0], "project_name");
            assert.equal(res.body.every(issue => issue["project_name"] == "test"), true)
            assert.typeOf(res.body[0].open, "boolean");
            done()
          })
      });
    // TEST #5
      test("View issues on a project with one filter", function(done){
        chai
          .request(server)
          .keepOpen()
          .get("/api/issues/test?issue_title=Test%20Issue%201")
          .end((err, res)=>{
            assert.isArray(res.body);
            assert.equal(res.body.every(item=>item.project_name == "test"), true)
            assert.equal(res.body.every(item=>item.issue_title == "Test Issue 1"), true)
            done()
          })
      });
    // TEST #6
      test("View issues on a project with multiple filters", function(done){
        chai
          .request(server)
          .keepOpen()
          .get("/api/issues/test?created_by=Rodrigo&assigned_to=Steve")
          .end((err, res) => {
            assert.isArray(res.body);
            assert.equal(res.body.every(issue => issue.project_name == "test"), true)
            assert.equal(res.body.every(issue => issue.created_by == "Rodrigo"), true);
            assert.equal(res.body.every(issue => issue.assigned_to == "Steve"), true);
            done()
          })
      });
    })
    suite('PUT tests', () => {
      // let _id; // I COULD HAVE **DECLARED** THE _id VARIABLE HERE AND THEN UPDATED IT INSIDE THE FIRST TEST. NO NEED TO NEST CHAI TESTS
      
      // ↓ ↓ ↓ COULD HAVE USED before() FOR PRE-TEST SETUP
      //  before(function(done) {
      // ↓ ↓ ↓ NO NEED FOR THIS FIRST CHAI TO BE A test
    // TEST #7
      test("Update one field on an issue", function(done){  
        // --- 1ST CHAI: .GET REQUEST TO RETRIEVE _id OF ISSUE TO UPDATE ---
        // --- 1ST CHAI: .GET REQUEST TO RETRIEVE _id OF ISSUE TO UPDATE ---
        chai
        .request(server)
        .keepOpen()
        .get("/api/issues/test?issue_title=Issue%20to%20be%20updated")
        .end((err, res) => {
          if (err) return done(err); ////
          let _id = res.body[0]._id;
          // console.log("Here's the ID: "+_id);
          // --- 2ND CHAI: .PUT REQUEST TO UPDATE ISSUE ---
          // --- 2ND CHAI: .PUT REQUEST TO UPDATE ISSUE ---
          chai
            .request(server)
            .keepOpen()
            .put("/api/issues/test")
            .send({
              "_id" : _id,
              "status_text" : "updated"
            })
            .end((err, res) => {
              if (err) return done(err); ////
              // console.log("Segunda parte");
              // console.log("2: "+res.body[0]);
              // console.log("json?: "+JSON.stringify(res.body));
              assert.isObject(res.body); //
              assert.equal(res.text, `{"result":"successfully updated","_id":"${_id}"}`);
              // --- 3RD CHAI: .GET REQUEST TO VERIFY SUCCESSFUL UPDATE ---
              // --- 3RD CHAI: .GET REQUEST TO VERIFY SUCCESSFUL UPDATE ---
              chai
                .request(server)
                .keepOpen()
                .get(`/api/issues/test?_id=${_id}`)
                .end((err, res) => {
                  if (err) return done(err); ////
                  console.log("3er paso:")
                  // console.log("created_on: "+res.body[0].created_on)
                  // console.log("updated_on: "+res.body[0].updated_on)
                  // console.log("created_on: "+new Date(res.body[0].created_on))
                  // console.log("updated_on: "+new Date(res.body[0].updated_on))
                  assert.isAbove(new Date(res.body[0].updated_on), new Date(res.body[0].created_on));
                  done()  
                })
            });
            // done()
        })
      });
    // PRE-TEST #8
      // --- USING before() FOR PRE-TEST SETUP TO CREATE THE ISSUE TO UPDATE
      before( (done)=>{
        // chai
        //     .request(server)
        //     .keepOpen()
        //     .post('/api/issues/test')
        //     .send({
        //       issue_title: "Issue to be updated",
        //       issue_text: "Update this",
        //       created_by: "Rodrigo",
        //       assigned_to: "Bob",
        //       status_text: "Urgent",
        //     })
        //     .end(function (err, res) {
        //       console.log("'Issue to be updated' was created")
        //       // done();
        //     });
        chai
          .request(server)
          .keepOpen()
          .post('/api/issues/test')
          .send({
            issue_title: "Issue to be updated multiple times",
            issue_text: "Update this",
            created_by: "Rodrigo",
            assigned_to: "Steve",
            status_text: "Fixed",
          })
          .end(function (err, res) {
            if(err){console.log(err)};
            console.log("1st log: 'Issue to be updated' was created")
            done();
          });
      })

      // DECLARING let _id OUTSIDE TESTS SO ITS SCOPE IS THE FULL SUITE
      let _id;
      // USING before FOR GETTING _id OF ISSUE TO UPDATE
      before( function(done) {
        chai
          .request(server)
          .keepOpen()
          .get("/api/issues/test?issue_title=Issue to be updated multiple times")
          .end((err, res) => {
            if(err){console.log(err)}
            _id = res.body[0]._id;
            console.log("2nd log: "+_id);
            done()
          })
      })
      // USING RETRIEVED _id TO UPDATE ISSUE
      before ( function(done) {
        chai
          .request(server)
          .keepOpen()
          .put("/api/issues/test")
          .send({
            _id: _id,
            issue_text: "UPDATED",
            assigned_to: "UPDATED",
            open: "false"
          })
          .end((err, res) => {
            console.log(res.body);
            console.log(res.text);
            // assert.isObject(res.body);
            // assert.equal(res.body[0]._id, _id); ////////////
            done()
          })
      })
    // TEST #8
      test("Update multiple fields on an issue", function(done){
        chai
          .request(server)
          .keepOpen()
          .get(`/api/issues/test?_id=${_id}`)
          .end((err, res) => {
            assert.equal(res.body[0]._id, _id); 
            assert.equal(res.body[0].issue_text, "UPDATED");
            assert.equal(res.body[0].assigned_to, "UPDATED");
            assert.equal(res.body[0].open, false)
            done()
          })
      });
    // TEST #9
      test("Update an issue with missing _id", function(done){
        chai
          .request(server)
          .keepOpen()
          .put("/api/issues/test")
          .send({
            issue_text: "THIS SHOULD NOT DISPLAY",
            assigned_to: "THIS SHOULD NOT DISPLAY",
          })
          .end((err, res) => {
            if(err){console.log(err)};
            assert.isObject(res.body);
            assert.equal(res.text, '{"error":"missing _id"}');
            assert.equal(res.body.error, "missing _id")
            done()
          })
      });
    // TEST #10
      test("Update an issue with no fields to update", function(done){
        chai 
          .request(server)
          .keepOpen()
          .put("/api/issues/test")
          .send({
            "_id": _id
          })
          .end((err, res) => {
            if(err){console.log(err)};
            assert.isObject(res.body);
            assert.equal(res.text, `{"error":"no update field(s) sent","_id":"${_id}"}`)
            done()
          })
      });
    // TEST #11
      test("Update an issue with an invalid _id", function(done){
        chai
          .request(server)
          .keepOpen()
          .put("/api/issues/test")
          .send({
            _id: "invalid ID"
          })
          .end((err, res) => {
            if(err){console.log(err)};
            assert.isObject(res.body);
            assert.equal(res.text, `{"error":"could not update","_id":"invalid ID"}`)
            done()
          })
      });
    })

    suite('DELETE tests', () => {
    // PRE-TEST #12
      let _id;
      // CREATE AN ISSUE TO BE DELETED AFTERWARDS
      before((done)=>{
        chai
          .request(server)
          .keepOpen()
          .post("/api/issues/test")
          .send({
            issue_title: "Issue to be deleted",
            issue_text: "You should not be able to see this issue",
            created_by: "The Admin"
          })
          .end((err, res) =>{
            if(err){console.log(err)};
            console.log("Issue to be deleted successfully created");
            done()
          })
      })
      // GET _ID OF ISSUE TO BE DELETED
      before((done)=>{
        chai
          .request(server)
          .keepOpen()
          .get("/api/issues/test?issue_title=Issue to be deleted")
          .end((err, res) => {
            if(err){console.log(err)};
            _id = res.body[0]._id;
            console.log("_id of issue to be deleted: "+res.body[0]._id);
            done()
          })
      })
    // TEST #12
      test("Delete an issue", function(done){
        chai
          .request(server)
          .keepOpen()
          .delete("/api/issues/test")
          .send({
            _id: _id
          })
          .end((err, res) => {
            if(err){console.log(err)};
            assert.isObject(res.body);
            assert.equal(res.text, `{"result":"successfully deleted","_id":"${_id}"}`)
            done()
          })
      });
    // TEST #13
      test("Delete an issue with an invalid _id", function(done){
        chai
          .request(server)
          .keepOpen()
          .delete("/api/issues/test")
          .send({
            _id: "invalidIdString"
          })
          .end((err, res) => {
            if(err){console.log(err)};
            assert.isObject(res.body);
            assert.equal(res.text, `{"error":"could not delete","_id":"invalidIdString"}`);
            assert.equal(res.body.error, "could not delete");
            done()
          })
      });
    // TEST #14
      test("Delete an issue with missing _id", function(done){
        chai
          .request(server)
          .keepOpen()
          .delete("/api/issues/test")
          .send({})
          .end((err, res) => {
            if(err){console.log(err)};
            assert.isObject(res.body);
            assert.equal(res.text, `{"error":"missing _id"}`);
            assert.equal(res.body.error, "missing _id")
            done()
          })
      });
    })
});

// ----- THERE WAS NO WAY TO GET THE TESTS TO RUN USING ZOMBIE -----
// --- MIGHT BE OUTDATED/DEPRECATED/PRESENT COMPATIBILITY ISSUES ----
// ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ 
// const Browser = require('zombie');
// // Browser.site="http://localhost:3000"; 
// Browser.site="http://0.0.0.0:3000";
// suite('Functional Tests', function() {
//     this.timeout(5000);
    
//     const browser = new Browser();

//     suiteSetup(function(done) {
//         return browser.visit("/", done())
//     });

//     suite('Headless browser', function () {
//         test('should have a working "site" property', function() {
//           assert.isNotNull(browser.site);
//         });
//       });

//     suite("POST tests", function () {
//         test("Create an issue with every field: POST request to /api/issues/{project}", function (done) {
//             browser.fill('input[name="issue_title"]', "Prueba1")
//             .fill("issue_text", "This is a test")
//             .fill("created_by", "Rodrigo")
//             .fill("assigned_to", "Steve")
//             .fill("status_text", "A-OK")
//             .then(() => {
//                 browser.pressButton("#testForm1 button[type='submit']", () => {
//                     browser.assert.success();
//                     browser.assert.text("issue_title", "Prueba1");
//                     browser.assert.text("issue_text", "This is a test");
//                     browser.assert.text("created_by", "Rodrigo");
//                     browser.assert.text("assigned_to", "Steve");
//                     browser.assert.text("status_text", "A-OK");
//                     done();
//                 })
//             })
//             .catch((error) => {
//                 done(error);
//             });
//         })
//     })
        
// });
