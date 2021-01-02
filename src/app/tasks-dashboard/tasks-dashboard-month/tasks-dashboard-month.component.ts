import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  selector: 'app-tasks-dashboard-month',
  templateUrl: './tasks-dashboard-month.component.html',
  styleUrls: ['./tasks-dashboard-month.component.scss']
})
export class TasksDashboardMonthComponent implements OnInit {

  alltasks: any[] = [];
  monthlytasks: any[] = [];

  constructor(private auth: AuthService) { }

  ngOnInit(): void {

    this.alltasks = this.auth.alltasks;
    this.getMonthlyTasks();

  }

  getMonthlyTasks = () => {
    this.monthlytasks = this.alltasks.filter((value, index, array) => {
      console.log(value.period);
      return value.period === 'MONTH' || value.period === 'Mensuelle';
    });
    // .map((task) => {
    //   const deadline = new Date(task.deadline._seconds * 1000);
    //   const period = 'Mensuelle';
    //   return {...task, deadline, period};
    // });
    // console.log(JSON.stringify(this.scheduledtasks));
  }

}
