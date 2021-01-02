var admin = require("firebase-admin");

var serviceAccount = require("./instant-transfer-management-firebase-adminsdk-shpel-494ad40170.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://instant-transfer-management.firebaseio.com"
});

const db = admin.firestore();

db.collection('tasks').get().then((snapshot) => {
  snapshot.forEach((snap) => {
    let snapdata = snap.data();
    console.log('-------------------------');
    console.log(snapdata);
    console.log('-------------------------');
    db.collection('tasks').doc(snapdata.taskid).update({
      startingDate: new Date(snapdata.startingDate),
      deadline: new Date(snapdata.deadline),
      creationDate: new Date(snapdata.creationDate)
    });
    console.log('update for ' + snapdata.taskid + ' made')
  })
});