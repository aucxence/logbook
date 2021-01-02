import { Subtask } from './subtask';
import { v4 as uuidv4 } from 'uuid';

export class Task {
    taskid: string = uuidv4();
    label = '';

    assignerId: string = '';
    assignerName: string = '';

    assignedTo = '';
    assignedToName: string = '';

    projectId: string = '';
    ProjectTitle: string = '';
    projectStatus = true;

    creationDate = new Date();
    deadline = new Date();
    description: string = '';

    subtasks: Subtask[] = [];

    subtasksNumber = 0;

    completed = false;

    progress = 0;

    status = 'undone';

    CreatedBy = '';
    CreatedByName: string = '';

    ApprovedBy = '';
    ApprovedByName = '';
    WorkedWith = '';
    WorkedWithName = '';

    repeat = false;
    every = 1;
    period = 'WEEK';
    monthlyOption = 'STRAIGHTDATE';

    startingDate = new Date();
    startingMonth = new Date().getMonth() + 1;
    startingYear = new Date();

    HourTime: string = '';
    weekdays: number[] = [1, 2, 3, 4, 5, 6];
    monthday = 15;
    dayOrder = 2;
    dayofweek = 3;

    toShowTo: string[];

    cronjob: string;

    fonction = 0;

    constructor(jsonObj?) {
        if (jsonObj) {
            const datevalues = ['startingDate', 'startingYear', 'creationDate', 'deadline'];
            // tslint:disable-next-line: forin
            for (const prop in jsonObj) {
                if (datevalues.indexOf(prop) > -1) {
                    this[prop] = new Date(jsonObj[prop].seconds * 1000);
                } else {
                    this[prop] = jsonObj[prop];
                }
                // console.log('* ' + jsonObj[prop]);
            }
        }
    }

    toString() {
        return JSON.stringify(this.jsonTask());
    }

    jsonTask() {
        // tslint:disable-next-line: forin
        const { taskid, label, assignerId, assignerName,
            assignedTo, assignedToName, projectId, ProjectTitle,
            projectStatus, creationDate, deadline, description,
            subtasks, subtasksNumber, completed, progress, status,
            CreatedBy, CreatedByName, ApprovedBy, ApprovedByName, WorkedWith, WorkedWithName,
            repeat, every, period, monthlyOption,
            startingDate, startingMonth, startingYear, HourTime,
            weekdays, monthday, dayOrder, dayofweek, toShowTo, fonction } = this;

        const data = {
            taskid, label, assignerId, assignerName,
            assignedTo, assignedToName, projectId, ProjectTitle,
            projectStatus, creationDate, deadline, description,
            subtasks, subtasksNumber, completed, progress, status,
            CreatedBy, CreatedByName, ApprovedBy, ApprovedByName, WorkedWith, WorkedWithName,
            repeat, every, period, monthlyOption,
            startingDate, startingMonth, startingYear, HourTime,
            weekdays, monthday, dayOrder, dayofweek, toShowTo, fonction
        };

        // tslint:disable-next-line: forin
        for (const prop in data) {
            // console.log(`* ${prop}: ${this[prop]}`);
            if (data[prop] === undefined) { data[prop] = ''; }
        }

        if (!data.assignedTo || data.assignedTo === undefined) { data.assignedTo = ''; }
        if (!data.assignedToName || data.assignedToName === undefined) { data.assignedToName = ''; }
        if (!data.CreatedBy || data.assignedTo === undefined) { data.CreatedBy = ''; }
        if (!data.CreatedBy || data.CreatedByName === undefined) { data.CreatedByName = ''; }

        const today = new Date();
        data.deadline.setHours(today.getHours(), today.getMinutes(), today.getSeconds(), today.getMilliseconds());

        return data;
    }

    addSubTask(currentsubtask) {
        this.subtasks.push({
            task: currentsubtask,
            completed: this.completed
        });
        currentsubtask = '';

        this.progress = 0;
        let progress = 0;
        this.completed = true;

        this.subtasks.forEach((subtask) => {
            progress = progress + (subtask.completed === true ? 100 : 0);
            this.completed = this.completed && subtask.completed;
        });
        this.subtasksNumber = this.subtasks.length;

        this.progress = progress / this.subtasks.length;

        if (this.completed === true) {
            this.status = 'done';
        } else if (this.progress > 0) {
            this.status = 'ongoing';
        } else {
            this.status = 'undone';
        }

        return currentsubtask;
    }

    toggleSubtaskStatus(i) {

        console.log('++++++++++++++++++++++++')
        this.subtasks[i].completed = !this.subtasks[i].completed;

        this.progress = 0;
        let progress = 0;
        this.completed = true;
        this.subtasks.forEach((subtask) => {
            progress = progress + (subtask.completed === true ? 100 : 0);
            this.completed = this.completed && subtask.completed;
        });
        this.progress = progress / this.subtasks.length;
        this.subtasksNumber = this.subtasks.length;

        if (this.completed === true) {
            this.status = 'done';
        } else if (this.progress > 0) {
            this.status = 'ongoing';
        } else {
            this.status = 'undone';
        }
    }

    deleteSubtask(i) {
        this.subtasks.splice(i, 1);

        let progress = 0;
        this.completed = this.subtasks.length === 0 ? this.completed : true;
        this.subtasks.forEach((subtask) => {
            progress = progress + (subtask.completed === true ? 100 : 0);
            this.completed = this.completed && subtask.completed;
        });

        this.progress = this.subtasks.length === 0
            ? this.progress
            : progress / this.subtasks.length;

        this.subtasksNumber = this.subtasks.length;

        if (this.completed === true) {
            this.status = 'done';
        } else if (this.progress > 0) {
            this.status = 'ongoing';
        } else {
            this.status = 'undone';
        }
    }

    manageAllSubtasks() {
        if (this.subtasks.length > 0) {
            this.subtasks.forEach((subtask) => {
                subtask.completed = !this.completed;
            });
        }

        this.subtasksNumber = this.subtasks.length;

        this.progress = (this.completed === false ? 100 : 0);

        if (this.completed === false) {
            this.status = 'done';
        } else if (this.progress > 0) {
            this.status = 'ongoing';
        } else {
            this.status = 'undone';
        }
    }

    reschedule = () => {

        let months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];

        let days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

        if (this.repeat === true) {
            const docdata = this;

            // ---- check periodicity and reset deadline and starting_date

            // 1. Tâches journalières
            if (docdata.period === 'DAY') {

                // coté serveur
                // const nextschedulingday = new Date();
                // nextschedulingday.setDate(nextschedulingday.getDate() + 1 * docdata.every);
                // return days[nextschedulingday.getDay()] + ' ' + nextschedulingday.getDate() + ' ' + months[nextschedulingday.getMonth()];
                // this.deadline = nextschedulingday;

                // coté client

                const d1 = new Date(this.startingDate);
                d1.setHours(0, 0, 0, 0);
                const d2 = new Date();
                d2.setHours(0, 0, 0, 0);

                const d = d2.getTime() > d1.getTime() ? d2 : d1;

                const nextschedulingday = d;
                // nextschedulingday.setDate(nextschedulingday.getDate() + 1 * docdata.every); annulé coté client
                this.deadline = nextschedulingday;
                return days[nextschedulingday.getDay()] + ' ' + nextschedulingday.getDate() + ' ' + months[nextschedulingday.getMonth()];

            }

            // 2. Tâches hebdomadaires
            else if (docdata.period === 'WEEK') {

                const nextschedulingday = docdata.weekdays.map((day: number) => {
                    // find next available day
                    const d1 = new Date(this.startingDate);
                    d1.setHours(0, 0, 0, 0);
                    const d2 = new Date();
                    d2.setHours(0, 0, 0, 0);

                    const d = d2.getTime() > d1.getTime() ? d2 : d1;

                    if (d.getDay() <= day) {
                        // not yet on that day
                        // console.log('==> Option 1 with ' + day)
                        d.setDate(d.getDate() + (1 - d.getDay()) % 7 + day - 1);
                    } else {
                        // past that day
                        // console.log('==> Option 2 with ' + day)
                        d.setDate(d.getDate() + (7 - d.getDay()) % 7 + day + 7 * (docdata.every - 1));
                    }

                    return d;
                }).sort((a, d) => {
                    return a.getTime() - d.getTime();
                })[0];

                // console.log('--------------->  ' + nextschedulingday);

                this.deadline = nextschedulingday;
                return days[nextschedulingday.getDay()] + ' ' + nextschedulingday.getDate() + ' ' + months[nextschedulingday.getMonth()];

            }

            // 3. Tâches Mensuelles
            else if (docdata.period === 'MONTH') {

                let nextschedulingday;

                if (docdata.monthlyOption === 'STRAIGHTDATE') {

                    let d1: Date;

                    const lastday = new Date(new Date().getFullYear(), this.startingMonth, 0);

                    // console.log('ok : ' + lastday);

                    let d11: Date;

                    // console.log('comparaison : ' + this.monthday + ' - ' + lastday.getDate());

                    if (this.monthday <= lastday.getDate()) {
                        d11 = new Date(new Date().getFullYear(), this.startingMonth - 1, this.monthday)
                    } else {
                        d11 = new Date(lastday);
                    }

                    d11.setHours(0, 0, 0, 0);

                    const d12 = new Date();
                    d12.setHours(0, 0, 0, 0);

                    // console.log('monthday ' + this.monthday);

                    // console.log('d1 = ' + d11);
                    // console.log('d2 = ' + d12);



                    if (d11.getTime() - d12.getTime() >= 0) {
                        d1 = d11;
                    } else {
                        const d11check = d11;
                        d11check.setMonth(d11check.getMonth() + 1 * this.every);
                        // console.log(d11check);
                        while (d11check.getTime() < d12.getTime()) {
                            d11check.setMonth(d11check.getMonth() + 1 * this.every);
                            // console.log(d11check);
                        }
                        d1 = d11check;
                    }

                    nextschedulingday = d1;

                    this.deadline = nextschedulingday;

                    // console.log('-------------- >  ' + nextschedulingday);

                    return days[nextschedulingday.getDay()] + ' ' + nextschedulingday.getDate() + ' ' + months[nextschedulingday.getMonth()];
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

                    let relevantdays = getSpecificdays(docdata.dayofweek, this.startingMonth - 1);

                    console.log('relevants days are: ' + relevantdays);

                    if (docdata.dayOrder > relevantdays.length) {
                        nextschedulingday = relevantdays[relevantdays.length - 1];
                    } else {
                        nextschedulingday = relevantdays[docdata.dayOrder - 1];
                    }

                    console.log('exit date 1: ' + nextschedulingday);

                    const dateoftoday = new Date();
                    dateoftoday.setHours(0, 0, 0, 0);

                    while (nextschedulingday.getTime() < dateoftoday.getTime()) {
                        relevantdays = getSpecificdays(docdata.dayofweek, this.startingMonth - 1 + 1 * this.every);
                        if (docdata.dayOrder > relevantdays.length) {
                            nextschedulingday = relevantdays[relevantdays.length - 1];
                        } else {
                            nextschedulingday = relevantdays[docdata.dayOrder - 1];
                        }
                    }

                    this.deadline = nextschedulingday;

                    // tslint:disable-next-line: max-line-length
                    return days[nextschedulingday.getDay()] + ' ' + nextschedulingday.getDate() + ' ' + months[nextschedulingday.getMonth()];
                }
            }

            // 4. Yearly Tasks
            else if (docdata.period === 'YEAR') {

                const d1 = new Date(this.startingYear);
                d1.setHours(0, 0, 0, 0);
                const d2 = new Date();
                d2.setHours(0, 0, 0, 0);

                while (d2.getTime() > d1.getTime()) {
                    d1.setFullYear(d1.getFullYear() + 1 * this.every);
                }

                const today = d1;
                const nextschedulingday = today;

                // console.log('-> ' + nextschedulingday);

                // nextschedulingday.setFullYear(today.getFullYear() + 1 * docdata.every); annulé coté client

                // console.log('+> ' + nextschedulingday);

                return days[nextschedulingday.getDay()]
                    + ' ' + nextschedulingday.getDate() + ' ' + months[nextschedulingday.getMonth()]
                    + ' ' + nextschedulingday.getFullYear();

                this.deadline = nextschedulingday;
            }

            // console.log(this.nextOccurrence);
        } else {
            const nextschedulingday = new Date();
            return days[nextschedulingday.getDay()]
                + ' ' + nextschedulingday.getDate() + ' ' + months[nextschedulingday.getMonth()]
                + ' ' + nextschedulingday.getFullYear();
        }
    }

    rescheduleServer = (docdata: any) => {

        console.log(this.startingDate);

        const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];

        const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

        if (docdata.repeat === true) {

            // ---- check periodicity and reset deadline and starting_date

            // 1. Tâches journalières
            if (docdata.period === 'DAY') {

                // coté serveur
                // const nextschedulingday = new Date();
                // nextschedulingday.setDate(nextschedulingday.getDate() + 1 * docdata.every);
                // this.deadline = nextschedulingday;

                // coté client

                const d1 = new Date(docdata.startingDate);
                d1.setHours(0, 0, 0, 0);
                const d2 = new Date();
                d2.setHours(0, 0, 0, 0);

                const d = d2.getTime() > d1.getTime() ? d2 : d1;

                const nextschedulingday = d;
                nextschedulingday.setDate(nextschedulingday.getDate() + 1 * docdata.every);
                docdata.deadline = nextschedulingday;

                return days[nextschedulingday.getDay()]
                    + ' ' + nextschedulingday.getDate() + ' ' + months[nextschedulingday.getMonth()]
                    + ' ' + nextschedulingday.getFullYear();
            }

            // 2. Tâches hebdomadaires
            else if (docdata.period === 'WEEK') {

                const nextschedulingday = docdata.weekdays.map((day: number) => {
                    // find next available day
                    const d1 = new Date(docdata.startingDate);
                    d1.setHours(0, 0, 0, 0);
                    const d2 = new Date();
                    d2.setHours(0, 0, 0, 0);

                    const d = d2.getTime() > d1.getTime() ? d2 : d1;

                    if (d.getDay() < day) {
                        // not yet on that day
                        // console.log('==> Option 1 with ' + day)
                        d.setDate(d.getDate() + (1 - d.getDay()) % 7 + day - 1);
                    } else {
                        // past that day
                        // console.log('==> Option 2 with ' + day)
                        d.setDate(d.getDate() + (7 - d.getDay()) % 7 + day + 7 * (docdata.every - 1));
                    }

                    return d;
                }).sort((a, d) => {
                    return a.getTime() - d.getTime();
                })[0];

                // console.log('--------------->  ' + nextschedulingday);
                docdata.deadline = nextschedulingday;
                return days[nextschedulingday.getDay()]
                    + ' ' + nextschedulingday.getDate() + ' ' + months[nextschedulingday.getMonth()]
                    + ' ' + nextschedulingday.getFullYear();

            }

            // 3. Tâches Mensuelles
            else if (docdata.period === 'MONTH') {

                let nextschedulingday;

                if (docdata.monthlyOption === 'STRAIGHTDATE') {

                    let d1: Date;

                    const lastday = new Date(new Date().getFullYear(), docdata.startingMonth, 0);

                    // console.log('ok : ' + lastday);

                    let d11: Date;

                    // console.log('comparaison : ' + this.monthday + ' - ' + lastday.getDate());

                    if (this.monthday <= lastday.getDate()) {
                        d11 = new Date(new Date().getFullYear(), this.startingMonth - 1, this.monthday)
                    } else {
                        d11 = new Date(lastday);
                    }

                    d11.setHours(0, 0, 0, 0); //the monthday day or last day (in case of 32)

                    const d12 = new Date();
                    d12.setHours(0, 0, 0, 0);

                    // console.log('monthday ' + this.monthday);

                    // console.log('d1 = ' + d11);
                    // console.log('d2 = ' + d12);

                    const d11check = d11;
                    d11check.setMonth(d11check.getMonth() + 1 * this.every);
                    // console.log(d11check);
                    while (d11check.getTime() < d12.getTime()) {
                        d11check.setMonth(d11check.getMonth() + 1 * this.every);
                        // console.log(d11check);
                    }
                    d1 = d11check;

                    nextschedulingday = d1;

                    this.deadline = nextschedulingday;

                    // console.log('-------------- >  ' + nextschedulingday);

                    return days[nextschedulingday.getDay()]
                        + ' ' + nextschedulingday.getDate()
                        + ' ' + months[nextschedulingday.getMonth()];
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

                    let relevantdays = getSpecificdays(docdata.dayofweek, this.startingMonth + 1 * (this.every - 1));

                    // console.log('relevants days are: ' + relevantdays);

                    if (docdata.dayOrder > relevantdays.length) {
                        nextschedulingday = relevantdays[relevantdays.length - 1];
                    } else {
                        nextschedulingday = relevantdays[docdata.dayOrder - 1];
                    }

                    console.log('exit date 1: ' + nextschedulingday);

                    const dateoftoday = new Date();
                    dateoftoday.setHours(0, 0, 0, 0);

                    while (nextschedulingday.getTime() <= dateoftoday.getTime()) {
                        relevantdays = getSpecificdays(docdata.dayofweek, this.startingMonth - 1 + 1 * this.every);
                        if (docdata.dayOrder > relevantdays.length) {
                            nextschedulingday = relevantdays[relevantdays.length - 1];
                        } else {
                            nextschedulingday = relevantdays[docdata.dayOrder - 1];
                        }
                    }

                    this.deadline = nextschedulingday;
                    return days[nextschedulingday.getDay()]
                        + ' ' + nextschedulingday.getDate() + ' ' + months[nextschedulingday.getMonth()];
                }
            }

            // 4. Yearly Tasks
            else if (docdata.period === 'YEAR') {

                const today = new Date();
                const nextschedulingday = today;

                // console.log('-> ' + nextschedulingday);

                nextschedulingday.setFullYear(today.getFullYear() + 1 * docdata.every);

                // console.log('+> ' + nextschedulingday);
                this.deadline = nextschedulingday;

                return days[nextschedulingday.getDay()]
                    + ' ' + nextschedulingday.getDate() + ' ' + months[nextschedulingday.getMonth()]
                    + ' ' + nextschedulingday.getFullYear();
            }

            // console.log(this.nextOccurrence);
        } else {
            const nextschedulingday = new Date();
            return days[nextschedulingday.getDay()]
                + ' ' + nextschedulingday.getDate() + ' ' + months[nextschedulingday.getMonth()]
                + ' ' + nextschedulingday.getFullYear();
        }
    }

}
