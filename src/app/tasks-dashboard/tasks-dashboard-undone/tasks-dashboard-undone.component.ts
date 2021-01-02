import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  selector: 'app-tasks-dashboard-undone',
  templateUrl: './tasks-dashboard-undone.component.html',
  styleUrls: ['./tasks-dashboard-undone.component.scss']
})
export class TasksDashboardUndoneComponent implements OnInit {

  alltasks: any[] = [];
  donetasks: any[] = [];

  constructor(private auth: AuthService) { }

  ngOnInit(): void {

    this.alltasks = this.auth.alltasks;
    this.getDoneTasks();

  }

  getDoneTasks = () => {
    this.donetasks = this.alltasks.filter((value, index, array) => {
      return value.status !== 'done';
    });
    // map((task) => {
    //   const deadline = new Date(task.deadline._seconds * 1000);
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
    //   return {...task, deadline, period};
    // });
  }

}
