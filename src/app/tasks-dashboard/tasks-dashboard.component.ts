import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { AuthService } from '../shared/auth.service';
import { Notification } from '../models/notification';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Response } from '../models/response';
import { User } from '../models/user';

@Component({
  selector: 'app-tasks-dashboard',
  templateUrl: './tasks-dashboard.component.html',
  styleUrls: ['./tasks-dashboard.component.scss']
})
export class TasksDashboardComponent implements OnInit {

  alltasks: any[] = [];
  scheduledtasks: any[] = [];
  spontaneoustasks: any[] = [];
  performance = 0;
  newlyaddedtasks: any[] = [];
  passedtasks: any[] = [];

  notifs: Notification[] = [];
  currentuser: firebase.User;
  user: User;

  fadeout = false;

  useravailable = false;

  // tslint:disable-next-line: variable-name
  constructor(public auth: AuthService, private _toastr: ToastrService, private router: Router) { }

  ngOnInit(): void {

    this.fadeout = false;

    try {
      console.log('ici');
      if (this.auth.currentUser.email) {
        console.log('là');
        this.currentuser = this.auth.currentUser;
        this.user = this.auth.user;
        this.useravailable = true;
      } else {
        this.signOut();
      }
    } catch (e) {
      this.signOut();
    }

    const before = new Date();
    before.setDate(before.getDate() - 2);
    before.setHours(0, 0, 0, 0);

    const after = new Date();
    after.setHours(23, 59, 0, 0);

    this.auth.getLiveNotifications({
      beginningDate: before,
      endingDate: after
    }).subscribe(changes => {
      this.notifs = changes.map(notif =>  new Notification(notif.payload.doc.data()));
      this.notifs = this.notifs.filter((notif) => notif.discardedBy.indexOf(this.currentuser.uid) === -1);
    });
  }

  signOut() {
    this.auth.SingOut().then((e: Response) => {
      // console.log(e);
      this._toastr.success(e.code, e.message, {
        timeOut: 1000
      }).onHidden.subscribe(e => {
        // console.log(e);
        this.router.navigate(['/login']);
      })
    }).catch((err: Response) => this._toastr.error(err.code, err.message, {
      timeOut: 3000
    }));
  }

  getRelevantTasks = () => {
    const getRelevantTasks = firebase.functions().httpsCallable('getRelevantTasks');

    const today = new Date();
    const lastthirtydays = new Date();

    lastthirtydays.setDate(lastthirtydays.getDate() - 30);

    console.log(lastthirtydays + ' -- ' + today);

    return getRelevantTasks({
      beginningDate: lastthirtydays.toDateString(),
      endingDate: today.toDateString(),
    });
  }

  getScheduledTasks = () => {
    this.scheduledtasks = this.alltasks.filter((value, index, array) => {
      return value.repeat;
    });
    // console.log(JSON.stringify(this.scheduledtasks));
  }

  getSpontaneousTasks = () => {
    this.spontaneoustasks = this.alltasks.filter((value, index, array) => {
      return !value.repeat;
    });
    // console.log(JSON.stringify(this.spontaneoustasks));
  }

  getNewlyAdded = () => {
    this.newlyaddedtasks = this.alltasks.filter((value, index, array) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);

      console.log(new Date(value.creationDate._seconds * 1000));

      const e = new Date(value.creationDate._seconds * 1000);
      e.setHours(0, 0, 0, 0);

      console.log(((d.getTime() - e.getTime()) / (1000 * 60 * 60 * 24)));

      return ((d.getTime() - e.getTime()) / (1000 * 60 * 60 * 24)) <= 7;
    }).map((task) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);

      const e = new Date(task.creationDate._seconds * 1000);
      e.setHours(0, 0, 0, 0);

      return {
        ...task,
        difference: ((d.getTime() - e.getTime()) / (1000 * 60 * 60 * 24))
      };
    }).slice(0, 9);
  }

  getPassedTasks = () => {
    this.passedtasks = this.alltasks.filter((value, index, array) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const deadline = new Date(value.deadline._seconds * 1000);
      deadline.setHours(0, 0, 0, 0);

      return (deadline.getTime() - today.getTime()) < 0;
    }).map((task) => {
      task.deadline = new Date(task.deadline._seconds * 1000);
      if (task.period === 'DAY') {
        task.period = 'Journalière';
      } else if (task.period === 'WEEK') {
        task.period = 'Hebdomadaire';
      } else if (task.period === 'MONTH') {
        task.period = 'Mensuelle';
      } else if (task.period === 'YEAR') {
        task.period = 'Année';
      }
      return task;
    }).slice(0, 9);
  }

  getPerformance = () => {
    let performance = 0;
    this.alltasks.forEach(task => {
      performance += task.progress;
    });
    performance /= this.alltasks.length;
    this.performance = performance;
    console.log(performance);
  }

}
