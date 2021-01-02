import { Component, OnInit, Input } from '@angular/core';
import { CompleterData, CompleterService, CompleterItem } from 'ng2-completer';
import { AuthService } from 'src/app/shared/auth.service';
import { Task } from 'src/app/models/task';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';
import { User } from 'src/app/models/user';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-add-task-dialog',
  templateUrl: './add-task-dialog.component.html',
  styleUrls: ['./add-task-dialog.component.scss']
})
export class AddTaskDialogComponent implements OnInit {

  @Input() repeatScheme: Task;
  @Input() type: string;
  currentsubtask = '';

  showdetails = false;
  
  @Input() assignedAppear: boolean;
  @Input() assignedAppear2: boolean;

  @Input()approvedAppear: boolean;
  @Input()workedwith: boolean;

  days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  years = [
    new Date().getFullYear(), new Date().getFullYear() + 1,
    new Date().getFullYear() + 2, new Date().getFullYear() + 3,
    new Date().getFullYear() + 4, new Date().getFullYear() + 5];

  nextOccurrence = '';
  today = new Date().toISOString().slice(0, 10);

  dataService: CompleterData;

  localauth: AuthService;

  localallusers: any[] = []

  constructor(private auth: AuthService,
    private completerService: CompleterService,
    // tslint:disable-next-line: variable-name
    private _toastr: ToastrService) {
    const usrlist: User[] = [];

    this.localauth = auth;

    this.auth.GetAllUsers().then((changes) => {
      changes.pipe((take(1))).subscribe(userlist => {
        this.localallusers = userlist.map(user => {
          // console.log(user.payload.doc.data());
          const usr = user.payload.doc.data() as User;
          return usr;
        });

        this.localallusers = this.localallusers.map(user => {
          return {
            ...user,
            fullname: user.firstname + ' ' + user.lastname
          };
        });

        // console.log('~~~~' + newlist.length);
        // console.log(this.localallusers);

        this.dataService = this.completerService.local(this.localallusers, 'firstname,lastname,email', 'fullname');

        this.localallusers = this.localallusers.map((user) => {
          return user.id;
        });

        console.log(this.localallusers);

      });
    });
  }

  ngOnInit(): void {
    this.currentsubtask = '';
    this.resetScheme();
    this.reschedule();
  }

  showNewTask = () => {
    this.showdetails = !this.showdetails;
  }

  updateRepeatMode = () => {
    this.repeatScheme.repeat = !this.repeatScheme.repeat;
  }

  updateAssignedAppear = () => {
    if (this.assignedAppear === false) {
      this.assignedAppear = true;
    } else {
      if (this.repeatScheme.assignedToName.replace(/\s/g, '') === ''
        || this.repeatScheme.assignedToName.replace(/\s/g, '') === (this.auth.user.firstname + ' ' + this.auth.user.lastname).replace(/\s/g, '')) {
        this.assignedAppear = false;
        this.repeatScheme.assignerName = '';
        this.repeatScheme.assignerId = '';
        this.repeatScheme.assignedTo = this.auth.user.id;
        this.repeatScheme.assignedToName = this.auth.user.firstname + ' ' + this.auth.user.lastname;
      } else {
        this.repeatScheme.assignerId = this.auth.user.id;
        this.repeatScheme.assignerName = this.auth.user.firstname + ' ' + this.auth.user.lastname;
        this.updateAssignedAppear2();
      }
    }
  }

  updateAssignedAppear2 = () => {
    if (this.assignedAppear2 === false) {
      this.assignedAppear2 = true;
    } else {
      if (
        (this.repeatScheme.assignerName.replace(/\s/g, '') !== (this.auth.user.firstname + ' ' + this.auth.user.lastname).replace(/\s/g, '')
          && this.repeatScheme.assignedToName.replace(/\s/g, '') !== (this.auth.user.firstname + ' ' + this.auth.user.lastname).replace(/\s/g, ''))
        ||
        (this.repeatScheme.assignerName.replace(/\s/g, '') === this.repeatScheme.assignedToName.replace(/\s/g, ''))
        ||
        (this.repeatScheme.assignerName.replace(/\s/g, '') === '')
      ) {
        this.assignedAppear2 = false;
        this.repeatScheme.assignerName = '';
        this.repeatScheme.assignerId = '';
        this.repeatScheme.assignedTo = this.auth.user.id;
        this.repeatScheme.assignedToName = this.auth.user.firstname + ' ' + this.auth.user.lastname;
      }
    }
  }

  updateApprovedAppear = () => {
    if (this.approvedAppear === false) {
      this.approvedAppear = true;
    } else {
      if (
        (this.repeatScheme.ApprovedByName.replace(/\s/g, '') === (this.auth.user.firstname + ' ' + this.auth.user.lastname).replace(/\s/g, ''))
        ||
        (this.repeatScheme.ApprovedByName.replace(/\s/g, '') === '')
      ) {
        this.approvedAppear = false;
        this.repeatScheme.ApprovedBy = '';
        this.repeatScheme.ApprovedByName = '';
      }
    }
  }

  updateWorkedwithAppear = () => {
    if (this.workedwith === false) {
      this.workedwith = true;
    } else {
      if (
        (this.repeatScheme.WorkedWithName.replace(/\s/g, '') === (this.auth.user.firstname + ' ' + this.auth.user.lastname).replace(/\s/g, ''))
        ||
        (this.repeatScheme.WorkedWithName.replace(/\s/g, '') === '')
      ) {
        this.workedwith = false;
        this.repeatScheme.WorkedWith = '';
        this.repeatScheme.WorkedWithName = '';
      }
    }
  }

  public updateAssignerAssignee(selectedItem: CompleterItem) {
    if (selectedItem) {
      this.repeatScheme.assignedTo = selectedItem.originalObject.id;
      this.repeatScheme.assignedToName = selectedItem.originalObject.fullname;
      this.repeatScheme.assignerId = this.auth.user.id;
      this.repeatScheme.assignerName = this.auth.user.firstname + ' ' + this.auth.user.lastname;
    }
  }

  public updateAssignerAssignee2(selectedItem: CompleterItem) {
    if (selectedItem) {
      this.repeatScheme.assignerId = selectedItem.originalObject.id;
      this.repeatScheme.assignerName = selectedItem.originalObject.fullname;
      this.repeatScheme.assignedTo = this.auth.user.id;
      this.repeatScheme.assignedToName = this.auth.user.firstname + ' ' + this.auth.user.lastname;
    }
  }

  public updateApprovedBy(selectedItem: CompleterItem) {
    if (selectedItem) {
      this.repeatScheme.ApprovedBy = selectedItem.originalObject.id;
      this.repeatScheme.ApprovedByName = selectedItem.originalObject.fullname;
    }
  }

  public updateWorkedWith(selectedItem: CompleterItem) {
    if (selectedItem) {
      this.repeatScheme.WorkedWith = selectedItem.originalObject.id;
      this.repeatScheme.WorkedWithName = selectedItem.originalObject.fullname;
    }
  }

  reschedule = () => {
    // console.log(this.repeatScheme.monthlyOption);
    this.nextOccurrence = this.repeatScheme.reschedule();
  }

  resetScheme() {
    this.currentsubtask = '';
    // this.assignedAppear = false;
    // this.assignedAppear2 = false;
    // this.approvedAppear = false;
    // this.workedwith = false;

    console.log('=> ' + this.assignedAppear);
    console.log('=> ' + this.assignedAppear2);
    console.log('=> ' + this.approvedAppear);
    console.log('=> ' + this.workedwith);
    // this.repeatScheme = new Task();
  }

  addSubTask() {
    this.currentsubtask = this.repeatScheme.addSubTask(this.currentsubtask);
  }

  updateTask = () => {
    console.log(this.repeatScheme.jsonTask());
    this.saveTask();
  }

  setToDate(event) {
    console.log(event);
    return new Date(event);
  }

  lpad = (value, padString, length) => {
    let str = value;
    while (str.length < length) { str = padString + str; }
    return str;
  }

  saveTask() {
    const thetask = this.repeatScheme.jsonTask();

    console.log('==> ' + thetask.CreatedBy);

    thetask.CreatedBy = this.auth.user.id;
    thetask.CreatedByName = this.auth.user.firstname + ' ' + this.auth.user.lastname;
    thetask.assignedTo = (thetask.assignedTo.length === 0) ? this.auth.user.id : thetask.assignedTo;
    const now = new Date();
    thetask.HourTime = this.lpad(now.getHours(), '0', '2') + ':' + this.lpad(now.getMinutes(), '0', '2');

    thetask.toShowTo = this.localallusers;

    console.log(thetask);
    this.auth.saveTask(thetask).then((response) => {
      if (this.repeatScheme.WorkedWith.length > 0) {
        const duplicata = thetask;
        duplicata.assignedTo = this.repeatScheme.WorkedWith;
        duplicata.assignedToName = this.repeatScheme.WorkedWithName;
        duplicata.WorkedWith = this.auth.user.id;
        duplicata.WorkedWithName = this.auth.user.firstname + ' ' + this.auth.user.lastname;
        duplicata.taskid = uuidv4();
        this.auth.saveTask(duplicata).then((secondresponse) => {
          this.resetScheme();
          this._toastr.success(secondresponse.message, secondresponse.code, {
            timeOut: 500
          });
        }).catch((error) => {
          this._toastr.error(error.message, error.code, {
            timeOut: 3000
          });
        });
      } else {
        this.resetScheme();
        this._toastr.success(response.message, response.code, {
          timeOut: 500
        });
      }
    }).catch((error) => {
      this._toastr.error(error.message, error.code, {
        timeOut: 3000
      });
    });

  }

  spontaneousUpdate(value) {
    // console.log(value);
    this.repeatScheme.deadline = new Date(value);
    const nextschedulingday = new Date(value);
    this.nextOccurrence = this.days[nextschedulingday.getDay()]
      + ' ' + nextschedulingday.getDate() + ' ' + this.months[nextschedulingday.getMonth()]
      + ' ' + nextschedulingday.getFullYear();
    // console.log(this.nextOccurrence);
  }

  updateWeekDay(x) {
    if (this.repeatScheme.weekdays.includes(x)) {
      const index = this.repeatScheme.weekdays.indexOf(x, 0);
      if (index > -1) {
        this.repeatScheme.weekdays.splice(index, 1);
      }
    } else {
      this.repeatScheme.weekdays.push(x);
    }
    this.reschedule();
  }

}
