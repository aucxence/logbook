// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');


// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

// Take the text parameter passed to this HTTP endpoint and insert it into 
// Cloud Firestore under the path /messages/:documentId/original
exports.createBetterNotification = functions.firestore
    .document('tasks/{taskId}').onWrite((change: any, context: any) => {

        let task: any;
        let type: string = ''

        if (!change.after.exists) {
            // deletion
            type = 'delete';
            task = change.before.data();
        } else if (!change.before.exists) {
            // creation
            type = 'create';
            task = change.after.data();

            console.log(task);

            if (task.assignedTo.length > 0 && task.assignerId.length > 0 && task.assignedTo !== task.assignerId) {
                let email: string;

                db.collection('users').doc(task.assignedTo).get()
                    .then((doc: any) => {
                        email = doc.data().email;
                        console.log('==>' + email);

                        const transporter = nodemailer.createTransport({
                            host: 'smtp.gmail.com',
                            port: 465,
                            secure: true,
                            auth: {
                                user: 'instanttransfermanager@gmail.com',
                                pass: 'instransfer'
                            }
                        });

                        const mailOptions = {
                            from: 'instanttransfermanager@gmail.com',
                            to: email,
                            subject: task.label,
                            text: 'Notifications Système\n\n' + task.assignedToName +
                                ' vient de vous affecter une tâche: ' +
                                task.label + '.\n\nPrière de vous connecter à la plateforme pour en savoir davantage.' +
                                '\n\nCordialement'
                        };

                        transporter.sendMail(mailOptions, function (error: any, info: any) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Email sent: ' + info.response);
                            }
                        });
                    })
            }

        } else {
            // update
            type = 'update';
            task = change.after.data();
        }

        const lpad = (str: string, padString: string, length: number) => {
            let strg = str;
            while (strg.length < length)
                strg = padString + strg;
            return strg;
        }

        const now = new Date();
        const hours = lpad((now.getHours() + 1).toString(), '0', 2);
        const HourTime = hours + ':' + lpad(now.getMinutes().toString(), '0', 2);

        return db.collection('notifications').add({
            CreatedBy: task.CreatedBy,
            CreatedByName: task.CreatedByName,
            HourTime: HourTime,
            WorkedWith: task.WorkedWith || '',
            WorkedWithName: task.WorkedWithName || '',
            assignedTo: task.assignedTo || '',
            assignedToName: task.assignedToName || '',
            creationDate: now,
            discardedBy: [],
            label: task.label,
            seenBy: [
                task.CreatedBy
            ],
            status: 'public',
            subtasksNumber: task.subtasksNumber,
            taskid: context.params.taskId,
            toShowTo: task.toShowTo || [],
            type: type
        }).then((ref: any) => {
            return {
                code: '200',
                message: `ajout de la notif ${task.label} réussi`
            };
        }).catch((err: any) => {
            return {
                code: err.code,
                message: err.message
            };
        })

    });

exports.ScheduledReset = functions.pubsub.schedule('30 17 * * *') // 17h30 là bas pour 22h30 ici
    .timeZone('America/New_York') // Users can choose timezone - default is America/Los_Angeles
    .onRun((context: any) => {

        const today = new Date();

        const b = today;
        b.setHours(0, 0, 0, 0);

        const e = today
        e.setHours(23, 59, 0, 0);

        return db.collection('tasks')
            .where('deadline', '>=', b)
            .where('deadline', '<', e)
            .where('repeat', '==', true)
            .get()
            .then((snapshot: any) => {
                const rescheduleServer = (docdata: any) => {

                    console.log(docdata.startingDate);

                    // 1. Tâches journalières
                    if (docdata.period === 'DAY') {

                        const deadline = new Date(docdata.deadline);
                        deadline.setDate(deadline.getDate() + 1 * docdata.every);

                        return deadline;
                    }

                    // 2. Tâches hebdomadaires
                    else if (docdata.period === 'WEEK') {

                        const weeklydeadline = docdata.weekdays.map((day: number) => {
                            const deadline = new Date(docdata.deadline);

                            if (deadline.getDay() < day) {
                                // not yet on that day
                                // console.log('==> Option 1 with ' + day)
                                deadline.setDate(deadline.getDate() + (1 - deadline.getDay()) % 7 + day - 1);
                            } else {
                                // past that day
                                // console.log('==> Option 2 with ' + day)
                                deadline.setDate(deadline.getDate() + (7 - deadline.getDay()) % 7 + day + 7 * (docdata.every - 1));
                            }

                            return deadline;
                        }).sort((a: number, d: number) => {
                            return a - d;
                        })[0];

                        return weeklydeadline;

                    }

                    // 3. Tâches Mensuelles
                    else if (docdata.period === 'MONTH') {

                        let monthlydeadline = new Date(docdata.deadline);

                        if (docdata.monthlyOption === 'STRAIGHTDATE') {

                            monthlydeadline.setMonth(monthlydeadline.getMonth() + 1 * docdata.every);
                            // console.log(d11check);
                            if (docdata.monthday === 32) {
                                monthlydeadline.setMonth(monthlydeadline.getMonth() + 1);
                                monthlydeadline.setDate(0)
                            }

                            return monthlydeadline;
                        } else {
                            const getSpecificdays = (x: number, y: number) => {

                                const d = new Date(new Date().getFullYear(), y, 1);
                                const month = (d.getMonth());
                                // const year = d.getFullYear();

                                // if (month > 11) {
                                //   year++;
                                //   month = month % 12
                                // }
                                // console.log(`${1} - ${month} - ${year}`);
                                const mondays = [];

                                // d = new Date(year, month, 1);

                                let count = 0;

                                while (d.getDay().toString() !== x.toString()) {
                                    // console.log(d.getDay() + ' ?= ' + x + ' === ' + (d.getDay().toString() === x.toString()))
                                    d.setDate(d.getDate() + 1);
                                    count = count + 1;
                                    if (count === 10) { break; }
                                }

                                // Get all the other Mondays in the month
                                while (d.getMonth() === month) {
                                    mondays.push(new Date(d));
                                    d.setDate(d.getDate() + 7);
                                }

                                return mondays;
                            };

                            const relevantdays = getSpecificdays(docdata.dayofweek, monthlydeadline.getMonth() + 1 * docdata.every);

                            // console.log('relevants days are: ' + relevantdays);

                            if (docdata.dayOrder > relevantdays.length) {
                                monthlydeadline = relevantdays[relevantdays.length - 1];
                            } else {
                                monthlydeadline = relevantdays[docdata.dayOrder - 1];
                            }

                            return monthlydeadline;
                        }
                    }

                    // 4. Yearly Tasks
                    else if (docdata.period === 'YEAR') {

                        const yearlydeadline = docdata.deadline;
                        yearlydeadline.setFullYear(yearlydeadline.getFullYear() + 1 * docdata.every);

                        return yearlydeadline;
                    }
                }

                snapshot.forEach((doc: any) => {

                    let docdata = doc.data();
                    const olddocdata = docdata;

                    console.log(docdata);

                    // ---- update tasks and subtasks status
                    docdata.completed = false;
                    docdata.progress = 0;
                    docdata.status = 'undone';

                    if (docdata.subtasksNumber > 0) {
                        const newsubtasks = docdata.subtasks;

                        for (let i = 0; i < docdata.subtasks.length || 0; i++) {
                            newsubtasks[i].completed = false
                        }

                        docdata.subtasks = newsubtasks;
                    }

                    // figure out the deadline
                    docdata.deadline = rescheduleServer(docdata);

                    db.collection('executions').add({
                        ...olddocdata,
                        taskid: docdata.taskid
                    });

                    db.collection('tasks').doc(docdata.taskid).update(docdata);
                })
            });
    });

exports.createItessesTasks = functions.https.onCall((data: any, context: any) => {

    const inverttasks = [
        {
            ApprovedBy: "",
            ApprovedByName: "",
            CreatedBy: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            CreatedByName: "Archivaxi LOGIN",
            HourTime: "15:39",
            ProjectTitle: "",
            WorkedWith: "",
            WorkedWithName: "",
            assignedTo: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            assignedToName: "Archivaxi LOGIN",
            assignerId: "",
            assignerName: "",
            completed: false,
            creationDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            dayOrder: 2,
            dayofweek: 3,
            deadline: "Tue Jul 07 2020 15:39:45 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            description: "",
            every: 1,
            fonction: 0,
            label: "Brancher son onduleur, au mur patienter quelques minutes et allumer l'onduleur",
            monthday: 15,
            monthlyOption: "STRAIGHTDATE",
            period: "WEEK",
            progress: 0,
            projectId: "",
            projectStatus: true,
            repeat: true,
            startingDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            startingMonth: 7,
            startingYear: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            status: "undone",
            subtasks: [],
            subtasksNumber: 0,
            taskid: "baa46b29-7d3b-4419-b3da-d9a8f45497d6",
            toShowTo: ["PUrHOGrYHKgco8InACrJKHzsmWh2", "bFunwx9k4YTe2XwI3sX1LweAKYv1", "KqFFTZQ2C4UhZtNZ2kyyRFXl8We2", "stGE4fV9iOVdpl3ofnlRmQmglJd2", "ZVw8R7wlywd0RzGrF7aaljJ8IV33", "be9CNvPS6dT4bwXVX7rHeEspf6E3", "sY4UFXWbJhRKxI9x4s4d2gfja2b2", "UdSPApWWxAPtzMb5vH7snMzUFn93", "cKhbmC6rmbX74AJuDauih399NwU2"],
            weekdays: [1, 2, 3, 4, 5, 6]
        },
        {
            ApprovedBy: "",
            ApprovedByName: "",
            CreatedBy: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            CreatedByName: "Archivaxi LOGIN",
            HourTime: "15:39",
            ProjectTitle: "",
            WorkedWith: "",
            WorkedWithName: "",
            assignedTo: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            assignedToName: "Archivaxi LOGIN",
            assignerId: "",
            assignerName: "",
            completed: false,
            creationDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            dayOrder: 2,
            dayofweek: 3,
            deadline: "Tue Jul 07 2020 15:39:45 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            description: "",
            every: 1,
            fonction: 0,
            label: "Démarrer l'unité centrale et attendre au moins cinq minutes avant de lancer Moneygram avant 7h",
            monthday: 15,
            monthlyOption: "STRAIGHTDATE",
            period: "WEEK",
            progress: 0,
            projectId: "",
            projectStatus: true,
            repeat: true,
            startingDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            startingMonth: 7,
            startingYear: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            status: "undone",
            subtasks: [],
            subtasksNumber: 0,
            taskid: "baa46b29-7d3b-4419-b3da-d9a8f45497d6",
            toShowTo: ["PUrHOGrYHKgco8InACrJKHzsmWh2", "bFunwx9k4YTe2XwI3sX1LweAKYv1", "KqFFTZQ2C4UhZtNZ2kyyRFXl8We2", "stGE4fV9iOVdpl3ofnlRmQmglJd2", "ZVw8R7wlywd0RzGrF7aaljJ8IV33", "be9CNvPS6dT4bwXVX7rHeEspf6E3", "sY4UFXWbJhRKxI9x4s4d2gfja2b2", "UdSPApWWxAPtzMb5vH7snMzUFn93", "cKhbmC6rmbX74AJuDauih399NwU2"],
            weekdays: [1, 2, 3, 4, 5, 6]
        },
        {
            ApprovedBy: "",
            ApprovedByName: "",
            CreatedBy: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            CreatedByName: "Archivaxi LOGIN",
            HourTime: "15:39",
            ProjectTitle: "",
            WorkedWith: "",
            WorkedWithName: "",
            assignedTo: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            assignedToName: "Archivaxi LOGIN",
            assignerId: "",
            assignerName: "",
            completed: false,
            creationDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            dayOrder: 2,
            dayofweek: 3,
            deadline: "Tue Jul 07 2020 15:39:45 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            description: "",
            every: 1,
            fonction: 0,
            label: "Ouvrir son CASH IT",
            monthday: 15,
            monthlyOption: "STRAIGHTDATE",
            period: "WEEK",
            progress: 0,
            projectId: "",
            projectStatus: true,
            repeat: true,
            startingDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            startingMonth: 7,
            startingYear: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            status: "undone",
            subtasks: [],
            subtasksNumber: 0,
            taskid: "baa46b29-7d3b-4419-b3da-d9a8f45497d6",
            toShowTo: ["PUrHOGrYHKgco8InACrJKHzsmWh2", "bFunwx9k4YTe2XwI3sX1LweAKYv1", "KqFFTZQ2C4UhZtNZ2kyyRFXl8We2", "stGE4fV9iOVdpl3ofnlRmQmglJd2", "ZVw8R7wlywd0RzGrF7aaljJ8IV33", "be9CNvPS6dT4bwXVX7rHeEspf6E3", "sY4UFXWbJhRKxI9x4s4d2gfja2b2", "UdSPApWWxAPtzMb5vH7snMzUFn93", "cKhbmC6rmbX74AJuDauih399NwU2"],
            weekdays: [1, 2, 3, 4, 5, 6]
        },
        {
            ApprovedBy: "",
            ApprovedByName: "",
            CreatedBy: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            CreatedByName: "Archivaxi LOGIN",
            HourTime: "15:39",
            ProjectTitle: "",
            WorkedWith: "",
            WorkedWithName: "",
            assignedTo: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            assignedToName: "Archivaxi LOGIN",
            assignerId: "",
            assignerName: "",
            completed: false,
            creationDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            dayOrder: 2,
            dayofweek: 3,
            deadline: "Tue Jul 07 2020 15:39:45 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            description: "",
            every: 1,
            fonction: 0,
            label: "Reception des clients",
            monthday: 15,
            monthlyOption: "STRAIGHTDATE",
            period: "WEEK",
            progress: 0,
            projectId: "",
            projectStatus: true,
            repeat: true,
            startingDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            startingMonth: 7,
            startingYear: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            status: "undone",
            subtasks: [],
            subtasksNumber: 0,
            taskid: "baa46b29-7d3b-4419-b3da-d9a8f45497d6",
            toShowTo: ["PUrHOGrYHKgco8InACrJKHzsmWh2", "bFunwx9k4YTe2XwI3sX1LweAKYv1", "KqFFTZQ2C4UhZtNZ2kyyRFXl8We2", "stGE4fV9iOVdpl3ofnlRmQmglJd2", "ZVw8R7wlywd0RzGrF7aaljJ8IV33", "be9CNvPS6dT4bwXVX7rHeEspf6E3", "sY4UFXWbJhRKxI9x4s4d2gfja2b2", "UdSPApWWxAPtzMb5vH7snMzUFn93", "cKhbmC6rmbX74AJuDauih399NwU2"],
            weekdays: [1, 2, 3, 4, 5, 6]
        },
        {
            ApprovedBy: "",
            ApprovedByName: "",
            CreatedBy: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            CreatedByName: "Archivaxi LOGIN",
            HourTime: "15:39",
            ProjectTitle: "",
            WorkedWith: "",
            WorkedWithName: "",
            assignedTo: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            assignedToName: "Archivaxi LOGIN",
            assignerId: "",
            assignerName: "",
            completed: false,
            creationDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            dayOrder: 2,
            dayofweek: 3,
            deadline: "Tue Jul 07 2020 15:39:45 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            description: "",
            every: 1,
            fonction: 0,
            label: "Faire le billetage de toutes les espèces en caisse",
            monthday: 15,
            monthlyOption: "STRAIGHTDATE",
            period: "WEEK",
            progress: 0,
            projectId: "",
            projectStatus: true,
            repeat: true,
            startingDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            startingMonth: 7,
            startingYear: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            status: "undone",
            subtasks: [],
            subtasksNumber: 0,
            taskid: "baa46b29-7d3b-4419-b3da-d9a8f45497d6",
            toShowTo: ["PUrHOGrYHKgco8InACrJKHzsmWh2", "bFunwx9k4YTe2XwI3sX1LweAKYv1", "KqFFTZQ2C4UhZtNZ2kyyRFXl8We2", "stGE4fV9iOVdpl3ofnlRmQmglJd2", "ZVw8R7wlywd0RzGrF7aaljJ8IV33", "be9CNvPS6dT4bwXVX7rHeEspf6E3", "sY4UFXWbJhRKxI9x4s4d2gfja2b2", "UdSPApWWxAPtzMb5vH7snMzUFn93", "cKhbmC6rmbX74AJuDauih399NwU2"],
            weekdays: [1, 2, 3, 4, 5, 6]
        },
        {
            ApprovedBy: "",
            ApprovedByName: "",
            CreatedBy: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            CreatedByName: "Archivaxi LOGIN",
            HourTime: "15:39",
            ProjectTitle: "",
            WorkedWith: "",
            WorkedWithName: "",
            assignedTo: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            assignedToName: "Archivaxi LOGIN",
            assignerId: "",
            assignerName: "",
            completed: false,
            creationDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            dayOrder: 2,
            dayofweek: 3,
            deadline: "Tue Jul 07 2020 15:39:45 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            description: "",
            every: 1,
            fonction: 0,
            label: "Impression et autocontrole des différents rapports de la jounée",
            monthday: 15,
            monthlyOption: "STRAIGHTDATE",
            period: "WEEK",
            progress: 0,
            projectId: "",
            projectStatus: true,
            repeat: true,
            startingDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            startingMonth: 7,
            startingYear: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            status: "undone",
            subtasks: [],
            subtasksNumber: 0,
            taskid: "baa46b29-7d3b-4419-b3da-d9a8f45497d6",
            toShowTo: ["PUrHOGrYHKgco8InACrJKHzsmWh2", "bFunwx9k4YTe2XwI3sX1LweAKYv1", "KqFFTZQ2C4UhZtNZ2kyyRFXl8We2", "stGE4fV9iOVdpl3ofnlRmQmglJd2", "ZVw8R7wlywd0RzGrF7aaljJ8IV33", "be9CNvPS6dT4bwXVX7rHeEspf6E3", "sY4UFXWbJhRKxI9x4s4d2gfja2b2", "UdSPApWWxAPtzMb5vH7snMzUFn93", "cKhbmC6rmbX74AJuDauih399NwU2"],
            weekdays: [1, 2, 3, 4, 5, 6]
        },
        {
            ApprovedBy: "",
            ApprovedByName: "",
            CreatedBy: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            CreatedByName: "Archivaxi LOGIN",
            HourTime: "15:39",
            ProjectTitle: "",
            WorkedWith: "",
            WorkedWithName: "",
            assignedTo: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            assignedToName: "Archivaxi LOGIN",
            assignerId: "",
            assignerName: "",
            completed: false,
            creationDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            dayOrder: 2,
            dayofweek: 3,
            deadline: "Tue Jul 07 2020 15:39:45 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            description: "",
            every: 1,
            fonction: 0,
            label: "Remplissage de la fiche synthèse en ligne",
            monthday: 15,
            monthlyOption: "STRAIGHTDATE",
            period: "WEEK",
            progress: 0,
            projectId: "",
            projectStatus: true,
            repeat: true,
            startingDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            startingMonth: 7,
            startingYear: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            status: "undone",
            subtasks: [],
            subtasksNumber: 0,
            taskid: "baa46b29-7d3b-4419-b3da-d9a8f45497d6",
            toShowTo: ["PUrHOGrYHKgco8InACrJKHzsmWh2", "bFunwx9k4YTe2XwI3sX1LweAKYv1", "KqFFTZQ2C4UhZtNZ2kyyRFXl8We2", "stGE4fV9iOVdpl3ofnlRmQmglJd2", "ZVw8R7wlywd0RzGrF7aaljJ8IV33", "be9CNvPS6dT4bwXVX7rHeEspf6E3", "sY4UFXWbJhRKxI9x4s4d2gfja2b2", "UdSPApWWxAPtzMb5vH7snMzUFn93", "cKhbmC6rmbX74AJuDauih399NwU2"],
            weekdays: [1, 2, 3, 4, 5, 6]
        },
        {
            ApprovedBy: "",
            ApprovedByName: "",
            CreatedBy: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            CreatedByName: "Archivaxi LOGIN",
            HourTime: "15:39",
            ProjectTitle: "",
            WorkedWith: "",
            WorkedWithName: "",
            assignedTo: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            assignedToName: "Archivaxi LOGIN",
            assignerId: "",
            assignerName: "",
            completed: false,
            creationDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            dayOrder: 2,
            dayofweek: 3,
            deadline: "Tue Jul 07 2020 15:39:45 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            description: "",
            every: 1,
            fonction: 0,
            label: "Fermeture du CASH IT",
            monthday: 15,
            monthlyOption: "STRAIGHTDATE",
            period: "WEEK",
            progress: 0,
            projectId: "",
            projectStatus: true,
            repeat: true,
            startingDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            startingMonth: 7,
            startingYear: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            status: "undone",
            subtasks: [],
            subtasksNumber: 0,
            taskid: "baa46b29-7d3b-4419-b3da-d9a8f45497d6",
            toShowTo: ["PUrHOGrYHKgco8InACrJKHzsmWh2", "bFunwx9k4YTe2XwI3sX1LweAKYv1", "KqFFTZQ2C4UhZtNZ2kyyRFXl8We2", "stGE4fV9iOVdpl3ofnlRmQmglJd2", "ZVw8R7wlywd0RzGrF7aaljJ8IV33", "be9CNvPS6dT4bwXVX7rHeEspf6E3", "sY4UFXWbJhRKxI9x4s4d2gfja2b2", "UdSPApWWxAPtzMb5vH7snMzUFn93", "cKhbmC6rmbX74AJuDauih399NwU2"],
            weekdays: [1, 2, 3, 4, 5, 6]
        },
        {
            ApprovedBy: "",
            ApprovedByName: "",
            CreatedBy: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            CreatedByName: "Archivaxi LOGIN",
            HourTime: "15:39",
            ProjectTitle: "",
            WorkedWith: "",
            WorkedWithName: "",
            assignedTo: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            assignedToName: "Archivaxi LOGIN",
            assignerId: "",
            assignerName: "",
            completed: false,
            creationDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            dayOrder: 2,
            dayofweek: 3,
            deadline: "Tue Jul 07 2020 15:39:45 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            description: "",
            every: 1,
            fonction: 0,
            label: "Envoi du rapport CASH IT en ligne",
            monthday: 15,
            monthlyOption: "STRAIGHTDATE",
            period: "WEEK",
            progress: 0,
            projectId: "",
            projectStatus: true,
            repeat: true,
            startingDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            startingMonth: 7,
            startingYear: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            status: "undone",
            subtasks: [],
            subtasksNumber: 0,
            taskid: "baa46b29-7d3b-4419-b3da-d9a8f45497d6",
            toShowTo: ["PUrHOGrYHKgco8InACrJKHzsmWh2", "bFunwx9k4YTe2XwI3sX1LweAKYv1", "KqFFTZQ2C4UhZtNZ2kyyRFXl8We2", "stGE4fV9iOVdpl3ofnlRmQmglJd2", "ZVw8R7wlywd0RzGrF7aaljJ8IV33", "be9CNvPS6dT4bwXVX7rHeEspf6E3", "sY4UFXWbJhRKxI9x4s4d2gfja2b2", "UdSPApWWxAPtzMb5vH7snMzUFn93", "cKhbmC6rmbX74AJuDauih399NwU2"],
            weekdays: [1, 2, 3, 4, 5, 6]
        },
        {
            ApprovedBy: "",
            ApprovedByName: "",
            CreatedBy: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            CreatedByName: "Archivaxi LOGIN",
            HourTime: "15:39",
            ProjectTitle: "",
            WorkedWith: "",
            WorkedWithName: "",
            assignedTo: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            assignedToName: "Archivaxi LOGIN",
            assignerId: "",
            assignerName: "",
            completed: false,
            creationDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            dayOrder: 2,
            dayofweek: 3,
            deadline: "Tue Jul 07 2020 15:39:45 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            description: "",
            every: 1,
            fonction: 0,
            label: "Envoi des différents rapports par mail",
            monthday: 15,
            monthlyOption: "STRAIGHTDATE",
            period: "WEEK",
            progress: 0,
            projectId: "",
            projectStatus: true,
            repeat: true,
            startingDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            startingMonth: 7,
            startingYear: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            status: "undone",
            subtasks: [],
            subtasksNumber: 0,
            taskid: "baa46b29-7d3b-4419-b3da-d9a8f45497d6",
            toShowTo: ["PUrHOGrYHKgco8InACrJKHzsmWh2", "bFunwx9k4YTe2XwI3sX1LweAKYv1", "KqFFTZQ2C4UhZtNZ2kyyRFXl8We2", "stGE4fV9iOVdpl3ofnlRmQmglJd2", "ZVw8R7wlywd0RzGrF7aaljJ8IV33", "be9CNvPS6dT4bwXVX7rHeEspf6E3", "sY4UFXWbJhRKxI9x4s4d2gfja2b2", "UdSPApWWxAPtzMb5vH7snMzUFn93", "cKhbmC6rmbX74AJuDauih399NwU2"],
            weekdays: [1, 2, 3, 4, 5, 6]
        },
        {
            ApprovedBy: "",
            ApprovedByName: "",
            CreatedBy: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            CreatedByName: "Archivaxi LOGIN",
            HourTime: "15:39",
            ProjectTitle: "",
            WorkedWith: "",
            WorkedWithName: "",
            assignedTo: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            assignedToName: "Archivaxi LOGIN",
            assignerId: "",
            assignerName: "",
            completed: false,
            creationDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            dayOrder: 2,
            dayofweek: 3,
            deadline: "Tue Jul 07 2020 15:39:45 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            description: "",
            every: 1,
            fonction: 0,
            label: "Ranger les espèces dans le coffre fort et fermer",
            monthday: 15,
            monthlyOption: "STRAIGHTDATE",
            period: "WEEK",
            progress: 0,
            projectId: "",
            projectStatus: true,
            repeat: true,
            startingDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            startingMonth: 7,
            startingYear: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            status: "undone",
            subtasks: [],
            subtasksNumber: 0,
            taskid: "baa46b29-7d3b-4419-b3da-d9a8f45497d6",
            toShowTo: ["PUrHOGrYHKgco8InACrJKHzsmWh2", "bFunwx9k4YTe2XwI3sX1LweAKYv1", "KqFFTZQ2C4UhZtNZ2kyyRFXl8We2", "stGE4fV9iOVdpl3ofnlRmQmglJd2", "ZVw8R7wlywd0RzGrF7aaljJ8IV33", "be9CNvPS6dT4bwXVX7rHeEspf6E3", "sY4UFXWbJhRKxI9x4s4d2gfja2b2", "UdSPApWWxAPtzMb5vH7snMzUFn93", "cKhbmC6rmbX74AJuDauih399NwU2"],
            weekdays: [1, 2, 3, 4, 5, 6]
        },
        {
            ApprovedBy: "",
            ApprovedByName: "",
            CreatedBy: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            CreatedByName: "Archivaxi LOGIN",
            HourTime: "15:39",
            ProjectTitle: "",
            WorkedWith: "",
            WorkedWithName: "",
            assignedTo: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            assignedToName: "Archivaxi LOGIN",
            assignerId: "",
            assignerName: "",
            completed: false,
            creationDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            dayOrder: 2,
            dayofweek: 3,
            deadline: "Tue Jul 07 2020 15:39:45 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            description: "",
            every: 1,
            fonction: 0,
            label: "Bien sécuriser les clés du coffre fort",
            monthday: 15,
            monthlyOption: "STRAIGHTDATE",
            period: "WEEK",
            progress: 0,
            projectId: "",
            projectStatus: true,
            repeat: true,
            startingDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            startingMonth: 7,
            startingYear: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            status: "undone",
            subtasks: [],
            subtasksNumber: 0,
            taskid: "baa46b29-7d3b-4419-b3da-d9a8f45497d6",
            toShowTo: ["PUrHOGrYHKgco8InACrJKHzsmWh2", "bFunwx9k4YTe2XwI3sX1LweAKYv1", "KqFFTZQ2C4UhZtNZ2kyyRFXl8We2", "stGE4fV9iOVdpl3ofnlRmQmglJd2", "ZVw8R7wlywd0RzGrF7aaljJ8IV33", "be9CNvPS6dT4bwXVX7rHeEspf6E3", "sY4UFXWbJhRKxI9x4s4d2gfja2b2", "UdSPApWWxAPtzMb5vH7snMzUFn93", "cKhbmC6rmbX74AJuDauih399NwU2"],
            weekdays: [1, 2, 3, 4, 5, 6]
        },
        {
            ApprovedBy: "",
            ApprovedByName: "",
            CreatedBy: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            CreatedByName: "Archivaxi LOGIN",
            HourTime: "15:39",
            ProjectTitle: "",
            WorkedWith: "",
            WorkedWithName: "",
            assignedTo: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            assignedToName: "Archivaxi LOGIN",
            assignerId: "",
            assignerName: "",
            completed: false,
            creationDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            dayOrder: 2,
            dayofweek: 3,
            deadline: "Tue Jul 07 2020 15:39:45 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            description: "",
            every: 1,
            fonction: 0,
            label: "Envoie des soldes",
            monthday: 15,
            monthlyOption: "STRAIGHTDATE",
            period: "WEEK",
            progress: 0,
            projectId: "",
            projectStatus: true,
            repeat: true,
            startingDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            startingMonth: 7,
            startingYear: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            status: "undone",
            subtasks: [],
            subtasksNumber: 0,
            taskid: "baa46b29-7d3b-4419-b3da-d9a8f45497d6",
            toShowTo: ["PUrHOGrYHKgco8InACrJKHzsmWh2", "bFunwx9k4YTe2XwI3sX1LweAKYv1", "KqFFTZQ2C4UhZtNZ2kyyRFXl8We2", "stGE4fV9iOVdpl3ofnlRmQmglJd2", "ZVw8R7wlywd0RzGrF7aaljJ8IV33", "be9CNvPS6dT4bwXVX7rHeEspf6E3", "sY4UFXWbJhRKxI9x4s4d2gfja2b2", "UdSPApWWxAPtzMb5vH7snMzUFn93", "cKhbmC6rmbX74AJuDauih399NwU2"],
            weekdays: [1, 2, 3, 4, 5, 6]
        },
        {
            ApprovedBy: "",
            ApprovedByName: "",
            CreatedBy: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            CreatedByName: "Archivaxi LOGIN",
            HourTime: "15:39",
            ProjectTitle: "",
            WorkedWith: "",
            WorkedWithName: "",
            assignedTo: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            assignedToName: "Archivaxi LOGIN",
            assignerId: "",
            assignerName: "",
            completed: false,
            creationDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            dayOrder: 2,
            dayofweek: 3,
            deadline: "Tue Jul 07 2020 15:39:45 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            description: "",
            every: 1,
            fonction: 0,
            label: "Fermeture des logiciels",
            monthday: 15,
            monthlyOption: "STRAIGHTDATE",
            period: "WEEK",
            progress: 0,
            projectId: "",
            projectStatus: true,
            repeat: true,
            startingDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            startingMonth: 7,
            startingYear: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            status: "undone",
            subtasks: [],
            subtasksNumber: 0,
            taskid: "baa46b29-7d3b-4419-b3da-d9a8f45497d6",
            toShowTo: ["PUrHOGrYHKgco8InACrJKHzsmWh2", "bFunwx9k4YTe2XwI3sX1LweAKYv1", "KqFFTZQ2C4UhZtNZ2kyyRFXl8We2", "stGE4fV9iOVdpl3ofnlRmQmglJd2", "ZVw8R7wlywd0RzGrF7aaljJ8IV33", "be9CNvPS6dT4bwXVX7rHeEspf6E3", "sY4UFXWbJhRKxI9x4s4d2gfja2b2", "UdSPApWWxAPtzMb5vH7snMzUFn93", "cKhbmC6rmbX74AJuDauih399NwU2"],
            weekdays: [1, 2, 3, 4, 5, 6]
        },
        {
            ApprovedBy: "",
            ApprovedByName: "",
            CreatedBy: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            CreatedByName: "Archivaxi LOGIN",
            HourTime: "15:39",
            ProjectTitle: "",
            WorkedWith: "",
            WorkedWithName: "",
            assignedTo: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            assignedToName: "Archivaxi LOGIN",
            assignerId: "",
            assignerName: "",
            completed: false,
            creationDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            dayOrder: 2,
            dayofweek: 3,
            deadline: "Tue Jul 07 2020 15:39:45 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            description: "",
            every: 1,
            fonction: 0,
            label: "Extinction de la machine",
            monthday: 15,
            monthlyOption: "STRAIGHTDATE",
            period: "WEEK",
            progress: 0,
            projectId: "",
            projectStatus: true,
            repeat: true,
            startingDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            startingMonth: 7,
            startingYear: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            status: "undone",
            subtasks: [],
            subtasksNumber: 0,
            taskid: "baa46b29-7d3b-4419-b3da-d9a8f45497d6",
            toShowTo: ["PUrHOGrYHKgco8InACrJKHzsmWh2", "bFunwx9k4YTe2XwI3sX1LweAKYv1", "KqFFTZQ2C4UhZtNZ2kyyRFXl8We2", "stGE4fV9iOVdpl3ofnlRmQmglJd2", "ZVw8R7wlywd0RzGrF7aaljJ8IV33", "be9CNvPS6dT4bwXVX7rHeEspf6E3", "sY4UFXWbJhRKxI9x4s4d2gfja2b2", "UdSPApWWxAPtzMb5vH7snMzUFn93", "cKhbmC6rmbX74AJuDauih399NwU2"],
            weekdays: [1, 2, 3, 4, 5, 6]
        },
        {
            ApprovedBy: "",
            ApprovedByName: "",
            CreatedBy: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            CreatedByName: "Archivaxi LOGIN",
            HourTime: "15:39",
            ProjectTitle: "",
            WorkedWith: "",
            WorkedWithName: "",
            assignedTo: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            assignedToName: "Archivaxi LOGIN",
            assignerId: "",
            assignerName: "",
            completed: false,
            creationDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            dayOrder: 2,
            dayofweek: 3,
            deadline: "Tue Jul 07 2020 15:39:45 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            description: "",
            every: 1,
            fonction: 0,
            label: "Débrancher l'onduleur de la prise secteur",
            monthday: 15,
            monthlyOption: "STRAIGHTDATE",
            period: "WEEK",
            progress: 0,
            projectId: "",
            projectStatus: true,
            repeat: true,
            startingDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            startingMonth: 7,
            startingYear: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            status: "undone",
            subtasks: [],
            subtasksNumber: 0,
            taskid: "baa46b29-7d3b-4419-b3da-d9a8f45497d6",
            toShowTo: ["PUrHOGrYHKgco8InACrJKHzsmWh2", "bFunwx9k4YTe2XwI3sX1LweAKYv1", "KqFFTZQ2C4UhZtNZ2kyyRFXl8We2", "stGE4fV9iOVdpl3ofnlRmQmglJd2", "ZVw8R7wlywd0RzGrF7aaljJ8IV33", "be9CNvPS6dT4bwXVX7rHeEspf6E3", "sY4UFXWbJhRKxI9x4s4d2gfja2b2", "UdSPApWWxAPtzMb5vH7snMzUFn93", "cKhbmC6rmbX74AJuDauih399NwU2"],
            weekdays: [1, 2, 3, 4, 5, 6]
        },
        {
            ApprovedBy: "",
            ApprovedByName: "",
            CreatedBy: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            CreatedByName: "Archivaxi LOGIN",
            HourTime: "15:39",
            ProjectTitle: "",
            WorkedWith: "",
            WorkedWithName: "",
            assignedTo: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            assignedToName: "Archivaxi LOGIN",
            assignerId: "",
            assignerName: "",
            completed: false,
            creationDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            dayOrder: 2,
            dayofweek: 3,
            deadline: "Tue Jul 07 2020 15:39:45 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            description: "",
            every: 1,
            fonction: 0,
            label: "Eteindre le climatiseur",
            monthday: 15,
            monthlyOption: "STRAIGHTDATE",
            period: "WEEK",
            progress: 0,
            projectId: "",
            projectStatus: true,
            repeat: true,
            startingDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            startingMonth: 7,
            startingYear: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            status: "undone",
            subtasks: [],
            subtasksNumber: 0,
            taskid: "baa46b29-7d3b-4419-b3da-d9a8f45497d6",
            toShowTo: ["PUrHOGrYHKgco8InACrJKHzsmWh2", "bFunwx9k4YTe2XwI3sX1LweAKYv1", "KqFFTZQ2C4UhZtNZ2kyyRFXl8We2", "stGE4fV9iOVdpl3ofnlRmQmglJd2", "ZVw8R7wlywd0RzGrF7aaljJ8IV33", "be9CNvPS6dT4bwXVX7rHeEspf6E3", "sY4UFXWbJhRKxI9x4s4d2gfja2b2", "UdSPApWWxAPtzMb5vH7snMzUFn93", "cKhbmC6rmbX74AJuDauih399NwU2"],
            weekdays: [1, 2, 3, 4, 5, 6]
        },
        {
            ApprovedBy: "",
            ApprovedByName: "",
            CreatedBy: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            CreatedByName: "Archivaxi LOGIN",
            HourTime: "15:39",
            ProjectTitle: "",
            WorkedWith: "",
            WorkedWithName: "",
            assignedTo: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            assignedToName: "Archivaxi LOGIN",
            assignerId: "",
            assignerName: "",
            completed: false,
            creationDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            dayOrder: 2,
            dayofweek: 3,
            deadline: "Tue Jul 07 2020 15:39:45 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            description: "",
            every: 1,
            fonction: 0,
            label: "Eteindre les lumières",
            monthday: 15,
            monthlyOption: "STRAIGHTDATE",
            period: "WEEK",
            progress: 0,
            projectId: "",
            projectStatus: true,
            repeat: true,
            startingDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            startingMonth: 7,
            startingYear: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            status: "undone",
            subtasks: [],
            subtasksNumber: 0,
            taskid: "baa46b29-7d3b-4419-b3da-d9a8f45497d6",
            toShowTo: ["PUrHOGrYHKgco8InACrJKHzsmWh2", "bFunwx9k4YTe2XwI3sX1LweAKYv1", "KqFFTZQ2C4UhZtNZ2kyyRFXl8We2", "stGE4fV9iOVdpl3ofnlRmQmglJd2", "ZVw8R7wlywd0RzGrF7aaljJ8IV33", "be9CNvPS6dT4bwXVX7rHeEspf6E3", "sY4UFXWbJhRKxI9x4s4d2gfja2b2", "UdSPApWWxAPtzMb5vH7snMzUFn93", "cKhbmC6rmbX74AJuDauih399NwU2"],
            weekdays: [1, 2, 3, 4, 5, 6]
        },
        {
            ApprovedBy: "",
            ApprovedByName: "",
            CreatedBy: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            CreatedByName: "Archivaxi LOGIN",
            HourTime: "15:39",
            ProjectTitle: "",
            WorkedWith: "",
            WorkedWithName: "",
            assignedTo: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            assignedToName: "Archivaxi LOGIN",
            assignerId: "",
            assignerName: "",
            completed: false,
            creationDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            dayOrder: 2,
            dayofweek: 3,
            deadline: "Tue Jul 07 2020 15:39:45 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            description: "",
            every: 1,
            fonction: 0,
            label: "Fermer les portes et la grille",
            monthday: 15,
            monthlyOption: "STRAIGHTDATE",
            period: "WEEK",
            progress: 0,
            projectId: "",
            projectStatus: true,
            repeat: true,
            startingDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            startingMonth: 7,
            startingYear: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            status: "undone",
            subtasks: [],
            subtasksNumber: 0,
            taskid: "baa46b29-7d3b-4419-b3da-d9a8f45497d6",
            toShowTo: ["PUrHOGrYHKgco8InACrJKHzsmWh2", "bFunwx9k4YTe2XwI3sX1LweAKYv1", "KqFFTZQ2C4UhZtNZ2kyyRFXl8We2", "stGE4fV9iOVdpl3ofnlRmQmglJd2", "ZVw8R7wlywd0RzGrF7aaljJ8IV33", "be9CNvPS6dT4bwXVX7rHeEspf6E3", "sY4UFXWbJhRKxI9x4s4d2gfja2b2", "UdSPApWWxAPtzMb5vH7snMzUFn93", "cKhbmC6rmbX74AJuDauih399NwU2"],
            weekdays: [1, 2, 3, 4, 5, 6]
        },
        {
            ApprovedBy: "",
            ApprovedByName: "",
            CreatedBy: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            CreatedByName: "Archivaxi LOGIN",
            HourTime: "15:39",
            ProjectTitle: "",
            WorkedWith: "",
            WorkedWithName: "",
            assignedTo: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            assignedToName: "Archivaxi LOGIN",
            assignerId: "",
            assignerName: "",
            completed: false,
            creationDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            dayOrder: 2,
            dayofweek: 3,
            deadline: "Tue Jul 07 2020 15:39:45 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            description: "",
            every: 1,
            fonction: 0,
            label: "Enregistrer les transactions dans le CASH IT au fur et a mesure",
            monthday: 15,
            monthlyOption: "STRAIGHTDATE",
            period: "WEEK",
            progress: 0,
            projectId: "",
            projectStatus: true,
            repeat: true,
            startingDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            startingMonth: 7,
            startingYear: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            status: "undone",
            subtasks: [],
            subtasksNumber: 0,
            taskid: "baa46b29-7d3b-4419-b3da-d9a8f45497d6",
            toShowTo: ["PUrHOGrYHKgco8InACrJKHzsmWh2", "bFunwx9k4YTe2XwI3sX1LweAKYv1", "KqFFTZQ2C4UhZtNZ2kyyRFXl8We2", "stGE4fV9iOVdpl3ofnlRmQmglJd2", "ZVw8R7wlywd0RzGrF7aaljJ8IV33", "be9CNvPS6dT4bwXVX7rHeEspf6E3", "sY4UFXWbJhRKxI9x4s4d2gfja2b2", "UdSPApWWxAPtzMb5vH7snMzUFn93", "cKhbmC6rmbX74AJuDauih399NwU2"],
            weekdays: [1, 2, 3, 4, 5, 6]
        },
        {
            ApprovedBy: "",
            ApprovedByName: "",
            CreatedBy: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            CreatedByName: "Archivaxi LOGIN",
            HourTime: "15:39",
            ProjectTitle: "",
            WorkedWith: "",
            WorkedWithName: "",
            assignedTo: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            assignedToName: "Archivaxi LOGIN",
            assignerId: "",
            assignerName: "",
            completed: false,
            creationDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            dayOrder: 2,
            dayofweek: 3,
            deadline: "Tue Jul 07 2020 15:39:45 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            description: "",
            every: 1,
            fonction: 0,
            label: "Payer les clients avec les reçus du CASH IT",
            monthday: 15,
            monthlyOption: "STRAIGHTDATE",
            period: "WEEK",
            progress: 0,
            projectId: "",
            projectStatus: true,
            repeat: true,
            startingDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            startingMonth: 7,
            startingYear: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            status: "undone",
            subtasks: [],
            subtasksNumber: 0,
            taskid: "baa46b29-7d3b-4419-b3da-d9a8f45497d6",
            toShowTo: ["PUrHOGrYHKgco8InACrJKHzsmWh2", "bFunwx9k4YTe2XwI3sX1LweAKYv1", "KqFFTZQ2C4UhZtNZ2kyyRFXl8We2", "stGE4fV9iOVdpl3ofnlRmQmglJd2", "ZVw8R7wlywd0RzGrF7aaljJ8IV33", "be9CNvPS6dT4bwXVX7rHeEspf6E3", "sY4UFXWbJhRKxI9x4s4d2gfja2b2", "UdSPApWWxAPtzMb5vH7snMzUFn93", "cKhbmC6rmbX74AJuDauih399NwU2"],
            weekdays: [1, 2, 3, 4, 5, 6]
        },
        {
            ApprovedBy: "",
            ApprovedByName: "",
            CreatedBy: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            CreatedByName: "Archivaxi LOGIN",
            HourTime: "15:39",
            ProjectTitle: "",
            WorkedWith: "",
            WorkedWithName: "",
            assignedTo: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            assignedToName: "Archivaxi LOGIN",
            assignerId: "",
            assignerName: "",
            completed: false,
            creationDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            dayOrder: 2,
            dayofweek: 3,
            deadline: "Tue Jul 07 2020 15:39:45 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            description: "",
            every: 1,
            fonction: 0,
            label: "Démarrer l'unité centrale et attendre au moins cinq minutes avant de lancer Moneygram avant 7",
            monthday: 15,
            monthlyOption: "STRAIGHTDATE",
            period: "WEEK",
            progress: 0,
            projectId: "",
            projectStatus: true,
            repeat: true,
            startingDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            startingMonth: 7,
            startingYear: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            status: "undone",
            subtasks: [],
            subtasksNumber: 0,
            taskid: "baa46b29-7d3b-4419-b3da-d9a8f45497d6",
            toShowTo: ["PUrHOGrYHKgco8InACrJKHzsmWh2", "bFunwx9k4YTe2XwI3sX1LweAKYv1", "KqFFTZQ2C4UhZtNZ2kyyRFXl8We2", "stGE4fV9iOVdpl3ofnlRmQmglJd2", "ZVw8R7wlywd0RzGrF7aaljJ8IV33", "be9CNvPS6dT4bwXVX7rHeEspf6E3", "sY4UFXWbJhRKxI9x4s4d2gfja2b2", "UdSPApWWxAPtzMb5vH7snMzUFn93", "cKhbmC6rmbX74AJuDauih399NwU2"],
            weekdays: [1, 2, 3, 4, 5, 6]
        },
        {
            ApprovedBy: "",
            ApprovedByName: "",
            CreatedBy: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            CreatedByName: "Archivaxi LOGIN",
            HourTime: "15:39",
            ProjectTitle: "",
            WorkedWith: "",
            WorkedWithName: "",
            assignedTo: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            assignedToName: "Archivaxi LOGIN",
            assignerId: "",
            assignerName: "",
            completed: false,
            creationDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            dayOrder: 2,
            dayofweek: 3,
            deadline: "Tue Jul 07 2020 15:39:45 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            description: "",
            every: 1,
            fonction: 0,
            label: "Reporter dans le CASH IT le billetage tel que perçu du et remis au client",
            monthday: 15,
            monthlyOption: "STRAIGHTDATE",
            period: "WEEK",
            progress: 0,
            projectId: "",
            projectStatus: true,
            repeat: true,
            startingDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            startingMonth: 7,
            startingYear: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            status: "undone",
            subtasks: [],
            subtasksNumber: 0,
            taskid: "baa46b29-7d3b-4419-b3da-d9a8f45497d6",
            toShowTo: ["PUrHOGrYHKgco8InACrJKHzsmWh2", "bFunwx9k4YTe2XwI3sX1LweAKYv1", "KqFFTZQ2C4UhZtNZ2kyyRFXl8We2", "stGE4fV9iOVdpl3ofnlRmQmglJd2", "ZVw8R7wlywd0RzGrF7aaljJ8IV33", "be9CNvPS6dT4bwXVX7rHeEspf6E3", "sY4UFXWbJhRKxI9x4s4d2gfja2b2", "UdSPApWWxAPtzMb5vH7snMzUFn93", "cKhbmC6rmbX74AJuDauih399NwU2"],
            weekdays: [1, 2, 3, 4, 5, 6]
        },
        {
            ApprovedBy: "",
            ApprovedByName: "",
            CreatedBy: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            CreatedByName: "Archivaxi LOGIN",
            HourTime: "15:39",
            ProjectTitle: "",
            WorkedWith: "",
            WorkedWithName: "",
            assignedTo: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            assignedToName: "Archivaxi LOGIN",
            assignerId: "",
            assignerName: "",
            completed: false,
            creationDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            dayOrder: 2,
            dayofweek: 3,
            deadline: "Tue Jul 07 2020 15:39:45 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            description: "",
            every: 1,
            fonction: 0,
            label: "Ne pas fermer le CASH IT avec forçage",
            monthday: 15,
            monthlyOption: "STRAIGHTDATE",
            period: "WEEK",
            progress: 0,
            projectId: "",
            projectStatus: true,
            repeat: true,
            startingDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            startingMonth: 7,
            startingYear: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            status: "undone",
            subtasks: [],
            subtasksNumber: 0,
            taskid: "baa46b29-7d3b-4419-b3da-d9a8f45497d6",
            toShowTo: ["PUrHOGrYHKgco8InACrJKHzsmWh2", "bFunwx9k4YTe2XwI3sX1LweAKYv1", "KqFFTZQ2C4UhZtNZ2kyyRFXl8We2", "stGE4fV9iOVdpl3ofnlRmQmglJd2", "ZVw8R7wlywd0RzGrF7aaljJ8IV33", "be9CNvPS6dT4bwXVX7rHeEspf6E3", "sY4UFXWbJhRKxI9x4s4d2gfja2b2", "UdSPApWWxAPtzMb5vH7snMzUFn93", "cKhbmC6rmbX74AJuDauih399NwU2"],
            weekdays: [1, 2, 3, 4, 5, 6]
        },
        {
            ApprovedBy: "",
            ApprovedByName: "",
            CreatedBy: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            CreatedByName: "Archivaxi LOGIN",
            HourTime: "15:39",
            ProjectTitle: "",
            WorkedWith: "",
            WorkedWithName: "",
            assignedTo: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            assignedToName: "Archivaxi LOGIN",
            assignerId: "",
            assignerName: "",
            completed: false,
            creationDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            dayOrder: 2,
            dayofweek: 3,
            deadline: "Tue Jul 07 2020 15:39:45 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            description: "",
            every: 1,
            fonction: 0,
            label: "Décompte des pièces comptable chaque jour",
            monthday: 15,
            monthlyOption: "STRAIGHTDATE",
            period: "WEEK",
            progress: 0,
            projectId: "",
            projectStatus: true,
            repeat: true,
            startingDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            startingMonth: 7,
            startingYear: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            status: "undone",
            subtasks: [],
            subtasksNumber: 0,
            taskid: "baa46b29-7d3b-4419-b3da-d9a8f45497d6",
            toShowTo: ["PUrHOGrYHKgco8InACrJKHzsmWh2", "bFunwx9k4YTe2XwI3sX1LweAKYv1", "KqFFTZQ2C4UhZtNZ2kyyRFXl8We2", "stGE4fV9iOVdpl3ofnlRmQmglJd2", "ZVw8R7wlywd0RzGrF7aaljJ8IV33", "be9CNvPS6dT4bwXVX7rHeEspf6E3", "sY4UFXWbJhRKxI9x4s4d2gfja2b2", "UdSPApWWxAPtzMb5vH7snMzUFn93", "cKhbmC6rmbX74AJuDauih399NwU2"],
            weekdays: [1, 2, 3, 4, 5, 6]
        }
    ];

    const tasks = [];

    const n = inverttasks.length;

    for (let i = 0; i < n; i++) {
        tasks.push(inverttasks[n - 1 - i]);
    }

    const lpad = (str: string, padString: string, length: number) => {
        let strg = str;
        while (strg.length < length)
            strg = padString + strg;
        return strg;
    }


    tasks.forEach((task: any) => {
        const now = new Date();
        const hours = now.getHours() + 1;
        const HourTime = lpad(hours.toString(), '0', 2) + ':' + lpad(now.getMinutes().toString(), '0', 2);

        task.CreatedBy = data.CreatedBy;
        task.CreatedByName = data.CreatedByName;
        task.HourTime = HourTime;
        task.assignedTo = data.CreatedBy;
        task.assignedToName = data.CreatedByName;
        task.creationDate = now;
        task.deadline = now;
        task.startingDate = now;
        task.startingYear = now;
        task.taskid = uuidv4();
        task.fonction = data.fonction;

        db.collection('tasks').doc(task.taskid).set(task);
    });

    return {
        code: '200',
        message: `ajout  réussi des tâches`
    };
});