import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  selector: 'app-tasks-dashboard-scheduled',
  templateUrl: './tasks-dashboard-scheduled.component.html',
  styleUrls: ['./tasks-dashboard-scheduled.component.scss']
})
export class TasksDashboardScheduledComponent implements OnInit {

  alltasks: any[] = [];
  scheduledtasks: any[] = [];

  constructor(private auth: AuthService) { }

  ngOnInit(): void {

    this.alltasks = this.auth.alltasks;
    this.getScheduledTasks();

  }

  getScheduledTasks = () => {
    this.scheduledtasks = this.alltasks.filter((value, index, array) => {
      return value.repeat;
    });
    // console.log(JSON.stringify(this.scheduledtasks));
  }

}
