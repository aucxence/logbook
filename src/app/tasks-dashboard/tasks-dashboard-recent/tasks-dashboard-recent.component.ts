import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  selector: 'app-tasks-dashboard-recent',
  templateUrl: './tasks-dashboard-recent.component.html',
  styleUrls: ['./tasks-dashboard-recent.component.scss']
})
export class TasksDashboardRecentComponent implements OnInit {

  alltasks: any[] = [];
  newlyaddedtasks: any[] = [];

  constructor(private auth: AuthService) { }

  ngOnInit(): void {

    this.alltasks = this.auth.alltasks;
    this.getNewlyAdded();

  }

  getNewlyAdded = () => {
    this.newlyaddedtasks = this.alltasks.filter((value, index, array) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);

      // console.log(new Date(value.creationDate._seconds * 1000));

      const e = new Date(value.creationDate._seconds * 1000);
      e.setHours(0, 0, 0, 0);

      // console.log(((d.getTime() - e.getTime()) / (1000 * 60 * 60 * 24)));

      return ((d.getTime() - e.getTime()) / (1000 * 60 * 60 * 24)) <= 7;
    }).map((task) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);

      const e = new Date(task.creationDate._seconds * 1000);
      e.setHours(0, 0, 0, 0);

      const deadline = new Date(task.deadline._seconds * 1000);

      return {
        ...task,
        difference: ((d.getTime() - e.getTime()) / (1000 * 60 * 60 * 24)),
        deadline
      };
    });
  }

}
