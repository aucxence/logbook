import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  selector: 'app-tasks-dashboard-spontaneous',
  templateUrl: './tasks-dashboard-spontaneous.component.html',
  styleUrls: ['./tasks-dashboard-spontaneous.component.scss']
})
export class TasksDashboardSpontaneousComponent implements OnInit {

  alltasks: any[] = [];
  spontaneoustasks: any[] = [];

  constructor(private auth: AuthService) { }

  ngOnInit(): void {

    this.alltasks = this.auth.alltasks;
    this.getSpontaneousTasks();

  }

  getSpontaneousTasks = () => {
    this.spontaneoustasks = this.alltasks.filter((value, index, array) => {
      return !value.repeat;
    });
    // console.log(JSON.stringify(this.scheduledtasks));
  }

}
