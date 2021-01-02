var admin = require("firebase-admin");

var serviceAccount = require("./instant-transfer-management-firebase-adminsdk-shpel-494ad40170.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://instant-transfer-management.firebaseio.com"
});

const firestore = admin.firestore();
const path = require("path");
const fs = require("fs");
const directoryPath = path.join(__dirname, "files");

console.log('--q ' + directoryPath);

fs.readdir(directoryPath, function(err, files) {
  if (err) {
    return console.log("Unable to scan directory: " + err);
  }

  files.forEach((file) => {
    var lastDotIndex = file.lastIndexOf(".");

    var menu = require("./files/" + file);

    menu.forEach((obj) => {
      console.log(obj);
      firestore
        .collection(file.substring(0, lastDotIndex))
        .add(obj)
        .then(function(docRef) {
          console.log("Document written");
        })
        .catch(function(error) {
          console.error("Error adding document: ", error);
        });
    });
  });
});
