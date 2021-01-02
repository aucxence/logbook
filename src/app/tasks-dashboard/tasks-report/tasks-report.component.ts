import { Component, OnInit } from '@angular/core';
import { Task } from 'src/app/models/task';
import { AuthService } from 'src/app/shared/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tasks-report',
  templateUrl: './tasks-report.component.html',
  styleUrls: ['./tasks-report.component.scss']
})
export class TasksReportComponent implements OnInit {

  executions: Task[] = [];

  splitexecs: Task[][] = [];

  days: Date[] = [];

  constructor(public auth: AuthService, private _toastr: ToastrService, private router: Router) { }

  ngOnInit(): void {
    this.executions = this.auth.executions;
    let i = 0;

    const basis = new Date();
    const date1 = new Date(basis.getFullYear(), basis.getMonth(), 1);
    const date2 = basis;

    const Difference_In_Days = (date2.getTime() - date1.getTime()) / (1000 * 3600 * 24);

    basis.setHours(0, 0, 0, 0);

    let temptable: Task[] = [];

    this.executions.forEach(exec => {
      const reldate = exec.creationDate;
      if(reldate.getTime() > basis.getTime()) {
        temptable.push(exec);
      } else {
        this.splitexecs.push(temptable);
        this.days.push(basis);
        temptable = [];
        basis.setDate(basis.getDate() - 1);
      }
    })
  }

}
