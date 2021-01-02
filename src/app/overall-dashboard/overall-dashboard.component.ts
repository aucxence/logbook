import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/auth.service';
import { Response } from 'src/app/models/response';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BnNgIdleService } from 'bn-ng-idle';
import { User } from '../models/user';

@Component({
  selector: 'app-overall-dashboard',
  templateUrl: './overall-dashboard.component.html',
  styleUrls: ['./overall-dashboard.component.scss']
})
export class OverallDashboardComponent implements OnInit {

  constructor(
    private _auth: AuthService,
    private router: Router,
    private _toastr: ToastrService,
    private bnIdle: BnNgIdleService,
    private activeroute: ActivatedRoute) { }

  currentuser: firebase.User;

  activepage = 1;

  activecompany = 0;

  public companies = {
    biostar: 'bs',
    technomed: 'tm',
    kamsu: 'kte',
    unicash: 'ucash',
    muffa: 'muffa',
    itransfer: 'it'
  };

  useravailable = false;

  changecompany(k: number, route: string) {
    this.activecompany = k;
    this.activepage = k + 1;
    console.log(route);
    this.router.navigate([route],  { relativeTo: this.activeroute });
  }

  changepage(k: number) {
    this.activepage = k;
    // this.router.navigate(['offreservice'], {relativeTo: this.activeroute, state: {data: this.itstate}});
  }

  ngOnInit(): void {

    try {
      if (this._auth.currentUser.email) {
        this.currentuser = this._auth.currentUser;
        this.useravailable = true;
      } else {
        console.log('sign out from overall logbook dashboard');
        this.signOut();
      }
    } catch(e) {
      this.signOut();
    }

    this.bnIdle.startWatching(1500).subscribe((isTimedOut: boolean) => {
      if (isTimedOut) {
        console.log('session expired');
        this.signOut();
      }
    });

  }

  signOut() {
    this._auth.SingOut().then((e: Response) => {
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
