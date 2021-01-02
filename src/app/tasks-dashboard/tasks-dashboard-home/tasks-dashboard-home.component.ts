import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AuthService } from 'src/app/shared/auth.service';
import { Task } from 'src/app/models/task';
import cronstrue from 'cronstrue';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { Response } from '../../models/response';
import { User } from 'src/app/models/user';


@Component({
  selector: 'app-tasks-dashboard-home',
  templateUrl: './tasks-dashboard-home.component.html',
  styleUrls: ['./tasks-dashboard-home.component.scss']
})
export class TasksDashboardHomeComponent implements OnInit {

  alltasks: Task[] = [];
  assignedtasks: Task[] = [];

  executions: Task[] = [];
  scheduledtasks: Task[] = [];
  spontaneoustasks: Task[] = [];
  soonovertasks: Task[] = [];
  assignedsoonovertasks: Task[] = [];

  assignedscheduledtasks: Task[] = [];
  assignedspontaneoustasks: Task[] = [];

  performance = 0;
  newlyaddedtasks: any[] = [];
  passedtasks: any[] = [];

  scheduledshow: number;
  spontaneousshow: number;

  repeatScheme = new Task();

  accordionlastactive: string;
  currentuser: firebase.User;
  user: User;

  suspendeduntil: Date;

  constructor(public auth: AuthService, private _toastr: ToastrService, private router: Router) {
    this.suspendeduntil = new Date();
    this.suspendeduntil.setDate(this.suspendeduntil.getDate() + 22);
  }

  signOut() {
    this.auth.fadeOut = false;
    this.auth.SingOut().then((e: Response) => {
      // console.log(e);
      this._toastr.success('Opération réussie', e.message, {
        timeOut: 1000
      }).onHidden.subscribe(e => {
        // console.log(e);
        this.router.navigate(['/login']);
      })
    }).catch((err: Response) => this._toastr.error(err.code, err.message, {
      timeOut: 3000
    }))
      .finally(() => {
        this.auth.fadeOut = true;
        this._toastr.success('Opération réussie', 'Succès', {
          timeOut: 1000
        })
      });
  }

  ngOnInit(): void {

    this.auth.fadeOut = false;

    try {
      console.log('ici');
      if (this.auth.currentUser.email) {
        console.log('là');
        this.currentuser = this.auth.currentUser;
        this.user = this.auth.user;
      } else {
        this.signOut();
      }
    } catch (e) {
      this.signOut();
    }

    this.repeatScheme.assignedTo = this.currentuser.uid;
    this.repeatScheme.CreatedBy = this.currentuser.uid;
    // this.repeatScheme.assignedToName = this.auth.user.firstname + ' ' + this.auth.user.lastname;
    this.repeatScheme.assignedToName = this.currentuser.displayName;

    this.auth.getLiveTasks().subscribe(changes => {
      this.alltasks = changes.map(item => {
        const ftask = new Task(item.payload.doc.data());
        ftask.cronjob = this.cronjobprocessing(ftask);
        ftask.taskid = item.payload.doc.id;

        return Object.assign(new Task(), ftask);
      });

      this.auth.alltasks = this.alltasks;

      const fct: number = (+this.user.fonction * 1);

      console.log('===> ' + this.user.fonction);

      this.getScheduledTasks();
      this.getSpontaneousTasks();
      // this.getPerformance();
      this.getNewlyAdded();
      this.getSoonOverTasks();

      if (this.alltasks.length === 0 && (fct <= 750)) {
        this.auth.createBulkTasksForItesses()
          .finally(() => {
            this.auth.fadeOut = true;
            this._toastr.success('Opération réussie', 'Succès', {
              timeOut: 1000
            })
          });
      } else {
        this.auth.fadeOut = true;
        this._toastr.success('Opération réussie', 'Succès', {
          timeOut: 1000
        })
      }

    });

    this.getLiveAssignedTasks();

    this.getLiveExecutions();

  }

  getSoonOverTasks() {
    this.soonovertasks = this.alltasks.filter((value, index, array) => {
      const d: Date = value.deadline;
      d.setHours(0, 0, 0, 0);

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      return d.getTime() === now.getTime();
    });
  }

  getAssignedSoonOverTasks() {
    this.assignedsoonovertasks = this.assignedtasks.filter((value, index, array) => {
      const d: Date = value.deadline;
      d.setHours(0, 0, 0, 0);

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      return d.getTime() === now.getTime();
    });
  }

  getLiveAssignedTasks() {
    const now = new Date();

    this.auth.getAssignedTasks({
      beginningDate: new Date(2020, 6, 1),
      endingDate: now
    }).subscribe((tasks) => {
      this.assignedtasks = [];
      this.assignedtasks = tasks.map(task => {
        const ftask = new Task(task.payload.doc.data());
        ftask.cronjob = this.cronjobprocessing(ftask);
        ftask.taskid = task.payload.doc.id;
        return Object.assign(new Task(), ftask);
      });

      this.auth.assignedtasks = this.assignedtasks;

      this.getAssignedScheduledTasks();
      this.getAssignedSpontaneousTasks();
      this.getAssignedSoonOverTasks();
    });
  }

  getAssignedScheduledTasks = () => {
    this.assignedscheduledtasks = this.assignedtasks.filter((value, index, array) => {
      return value.repeat;
    });
  }

  getAssignedSpontaneousTasks = () => {
    this.assignedspontaneoustasks = this.assignedtasks.filter((value, index, array) => {
      return !value.repeat;
    });
  }

  getLiveExecutions() {
    const now = new Date();

    this.auth.getExecutions({
      beginningDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endingDate: now
    }).subscribe((executions) => {
      this.executions = [];
      executions.forEach(exec => {
        const execintask = new Task(exec.data());
        this.executions.push(execintask);
      });
      this.getPerformance();
      this.getPassedTasks();
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

      // console.log(new Date(value.creationDate));

      const e = new Date(value.creationDate);
      e.setHours(0, 0, 0, 0);

      // console.log(((d.getTime() - e.getTime()) / (1000 * 60 * 60 * 24)));

      return ((d.getTime() - e.getTime()) / (1000 * 60 * 60 * 24)) <= 7;
    }).map((task) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);

      const e = new Date(task.creationDate);
      e.setHours(0, 0, 0, 0);

      // console.log(task.weekdays);

      return {
        ...task,
        difference: ((d.getTime() - e.getTime()) / (1000 * 60 * 60 * 24))
      };
    }).slice(0, 9);
  }

  getPassedTasks = () => {
    // this.passedtasks = this.alltasks.filter((value, index, array) => {
    //   const today = new Date();
    //   today.setHours(0, 0, 0, 0);

    //   const deadline = new Date(value.deadline);
    //   deadline.setHours(0, 0, 0, 0);

    //   return (deadline.getTime() - today.getTime()) < 0;
    // }).map((task) => {
    //   const deadline = new Date(task.deadline);
    //   let period = '';
    //   if (task.period === 'DAY') {
    //     period = 'Journalière';
    //   } else if (task.period === 'WEEK') {
    //     period = 'Hebdomadaire';
    //   } else if (task.period === 'MONTH') {
    //     period = 'Mensuelle';
    //   } else if (task.period === 'YEAR') {
    //     period = 'Année';
    //   }
    //   return { ...task, period, deadline };
    // }).slice(0, 9);
    this.auth.executions = this.executions;
  }

  cronjobprocessing(task: Task): string {
    let cronjob = '0 0 0 ';
    if (task.repeat === true) {
      if (task.period === 'DAY') {
        cronjob += '* * *';
      }
      else if (task.period === 'MONTH' && task.monthlyOption === 'STRAIGHTDATE') {
        cronjob += task.monthday.toString() + ' */' + task.every + ' *';
      }
      else if (task.period === 'MONTH' && task.monthlyOption === 'WEEKDAY') {
        const crondayorder = ['1-7', '8-14', '15-21', '22-28', '29-31'];
        cronjob += crondayorder[task.dayOrder - 1] + ' */' + task.every + ' ' + task.dayofweek;
      }
      else if (task.period === 'WEEK') {
        if (task.weekdays.length !== 6) {
          const wdays = task.weekdays.toString().substring(0, task.weekdays.toString().length).replace(/\s/g, '')
          cronjob += '* * ' + wdays;
        } else {
          cronjob += '* * *';
        }
      }
      else if (task.period === 'YEAR') {
        cronjob += '* * *';
      }
      // console.log(cronjob);
      if (cronjob !== '0 0 0 * * *') {
        cronjob = cronstrue.toString(cronjob).substr(13);
        // console.log(cronjob);
      }
      else {
        if (task.period === 'DAY') {
          cronjob = 'every ' + task.every + ' day(s) (including sunday)';
        } else if (task.period === 'YEAR') {
          cronjob = 'every ' + task.every + ' year(s)';
        } else if (task.period === 'WEEK' && task.weekdays.length === 6) {
          cronjob = 'every working day';
        }
        // console.log(cronjob);
      }
    }

    return cronjob;
  }

  getPerformance = () => {
    let performance = 0;
    this.executions.forEach(exec => {
      performance += exec.progress;
    });
    performance = (this.executions.length === 0) ? 0 : (performance / this.executions.length);
    this.performance = performance;
    // console.log(performance);
  }

  resetScheme() {
    this.repeatScheme = new Task({
      assignedTo: this.auth.user.id,
      assignedToName: this.auth.user.firstname + ' ' + this.auth.user.lastname,
      fonction: this.auth.user.fonction ?? 0,
      assignerId: '',
      assignerName: '',
      CreatedBy: this.auth.user.id,
      CreatedByName: this.auth.user.firstname + ' ' + this.auth.user.lastname,
      ApprovedBy: '',
      ApprovedByName: '',
      WorkedWith: '',
      WorkedWithName: ''
    });
  }

  toggleTaskStatus = (task: Task) => {

    this.auth.fadeOut = false;

    // task.completed = !task.completed;
    task.progress = task.progress === 100 ? 0 : 100;

    const limit = new Date(task.deadline);
    limit.setHours(22, 30, 0, 0);

    const currenttime = new Date();

    console.log(task.deadline);

    if (task.progress === 100) {
      if (currenttime.getTime() < limit.getTime()) {
        task.status = 'done';
      } else {
        task.status = 'late';
      }
    } else if (task.progress > 0) {
      if (currenttime.getTime() < limit.getTime()) {
        task.status = 'ongoing';
      } else {
        task.status = 'late';
      }
    } else {
      task.status = 'undone';
    }

    task.completed = task.progress === 100;
    task.subtasks.forEach((subtask) => {
      subtask.completed = task.completed;
    });

    console.log(task.completed + ' ' + task.progress + ': ' + task.status);

    task.subtasks.forEach((subtask) => {
      console.log(subtask.completed);
    });

    this.auth.updateTaskStatus(task.jsonTask())
      .then((response) => {
        console.log(response.message);
      })
      .catch((err) => {
        this._toastr.success(err.message, err.code, {
          timeOut: 2000
        });
      })
      .finally(() => {
        this.auth.fadeOut = true;
        this._toastr.success('Opération réussie', 'Succès', {
          timeOut: 1000
        });
      });
  }

  toggleSubtaskStatus(task: Task, i: number) {

    this.auth.fadeOut = false;

    task.subtasks[i].completed = !task.subtasks[i].completed;

    task.progress = 0;
    let progress = 0;
    task.completed = true;
    task.subtasks.forEach((subtask) => {
      progress = progress + (subtask.completed === true ? 100 : 0);
      task.completed = task.completed && subtask.completed;
    });
    task.progress = progress / task.subtasks.length;
    task.subtasksNumber = task.subtasks.length;

    const limit = new Date(task.deadline);
    limit.setHours(22, 30, 0, 0);

    const currenttime = new Date();

    if (task.progress === 100) {
      if (currenttime.getTime() < limit.getTime()) {
        task.status = 'done';
      } else {
        task.status = 'late';
      }
    } else if (task.progress > 0) {
      if (currenttime.getTime() < limit.getTime()) {
        task.status = 'ongoing';
      } else {
        task.status = 'late';
      }
    } else {
      task.status = 'undone';
    }



    // if (task.progress === 100) {
    //   task.status = 'done';
    // } else if (task.progress > 0) {
    //   task.status = 'ongoing';
    // } else {
    //   task.status = 'undone';
    // }

    // console.log(task.label + ' - ' + task.completed + ' - ' + task.progress + ' - ' + task.status);

    // task.subtasks.forEach((subtask) => {
    //   console.log(subtask.completed);
    // });

    const now = new Date();
    task.HourTime = now.getHours() + ':' + now.getMinutes();

    this.auth.updateTaskStatus(task.jsonTask())
      .then((response) => {
        console.log(response.message);
        this.auth.fadeOut = true;
        this._toastr.success('Opération réussie', 'Succès', {
          timeOut: 1000
        })
      })
      .catch((err) => {
        this._toastr.success(err.message, err.code, {
          timeOut: 2000
        });
      }).finally(() => {
        this.auth.fadeOut = true;
        this._toastr.success('Opération réussie', 'Succès', {
          timeOut: 1000
        })
      });;
  }

  deleteSubtask(task, i) {

    this.auth.fadeOut = false;
    task.subtasks.splice(i, 1);

    let progress = 0;
    task.completed = task.subtasks.length === 0 ? task.completed : true;
    task.subtasks.forEach((subtask) => {
      progress = progress + (subtask.completed === true ? 100 : 0);
      task.completed = task.completed && subtask.completed;
    });

    task.progress = task.subtasks.length === 0
      ? task.progress
      : progress / task.subtasks.length;

    task.subtasksNumber = task.subtasks.length;

    if (task.progress === 100) {
      task.status = 'done';
    } else if (task.progress > 0) {
      task.status = 'ongoing';
    } else {
      task.status = 'undone';
    }

    console.log(task.completed + ' ' + task.progress + ': ' + task.status);

    task.subtasks.forEach((subtask) => {
      console.log(subtask.completed);
    });

    this.auth.updateTaskStatus(task.jsonTask())
      .then((response) => {
        console.log(response.message);
        this.auth.fadeOut = true;
        this._toastr.success('Opération réussie', 'Succès', {
          timeOut: 1000
        })
      })
      .catch((err) => {
        this._toastr.success(err.message, err.code, {
          timeOut: 2000
        });
      }).finally(() => {
        this.auth.fadeOut = true;
        this._toastr.success('Opération réussie', 'Succès', {
          timeOut: 1000
        })
      });
  }

  saveInCookies = (id: string) => {

    // this.cookie.set('lastactive', id);

  }

  changeTaskStatus(task, status) {
    this.auth.fadeOut = false;
    task.status = status;
    if (status === 'suspended') { task.deadline = this.suspendeduntil; }
    // console.log(task.label + ' ' + task.status + ' ' + task.taskid + ' ' + task.subtasksNumber);
    this.auth.updateTaskStatus(task.jsonTask())
      .then((response) => {
        console.log(response.message);
        this.auth.fadeOut = true;
        this._toastr.success('Opération réussie', 'Succès', {
          timeOut: 1000
        })
      })
      .catch((err) => {
        this._toastr.success(err.message, err.code, {
          timeOut: 2000
        });
      }).finally(() => {
        this.auth.fadeOut = true;
        this._toastr.success('Opération réussie', 'Succès', {
          timeOut: 1000
        })
      });
  }

  setToDate(event) {
    console.log(event);
    return new Date(event);
  }

}
