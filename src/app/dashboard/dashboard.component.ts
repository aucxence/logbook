import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BnNgIdleService } from 'bn-ng-idle';
import { Response } from 'src/app/models/response';
import { User } from '../models/user';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {


  dashboardcards = [
    {
      titre: 'Courriers - Décharges', 
      image: 'assets/images/mail.png', 
      description: 'Ayez la maitrise de vos courriers et décharges', 
      route: '/dashboard',
      dbkey: 'mails'
    },
    { 
      titre: 'Gestion des tâches', 
      image: 'assets/images/tasks.png', 
      description: 'Plannifiez vos tâches spontanées et régulières avec cet outil', 
      route: '/tasksdashboard',
      dbkey: 'tasks'
    }
  ];

  currentuser: firebase.User;
  user: User;

  useravailable = false;

  constructor(public auth: AuthService, private router: Router, private _toastr: ToastrService, private bnIdle: BnNgIdleService) { 

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
   }

  ngOnInit(): void {
    this.bnIdle.startWatching(1500).subscribe((isTimedOut: boolean) => {
      if (isTimedOut) {
        console.log('session expired');
        this.signOut();
      }
    });
  }

  clicked(route: string) {
    this.router.navigate([route]);
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

}
