import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { User } from '../models/user';

@Component({
  selector: 'app-habilitations',
  templateUrl: './habilitations.component.html',
  styleUrls: ['./habilitations.component.scss']
})
export class HabilitationsComponent implements OnInit {

  localallusers: User[];

  constructor(public auth: AuthService, private _toastr: ToastrService, private router: Router) { }

  ngOnInit(): void {

    this.auth.GetAllUsers().then((changes) => {
      changes.subscribe(userlist => {
        this.localallusers = userlist.map(user => {
          // console.log(user.payload.doc.data());
          const usr = user.payload.doc.data() as User;
          return usr;
        });

      });
    });
  }

  updateHabilitations(i: number, habilitation: string) {
    if(this.localallusers[i].modules.indexOf(habilitation) > -1) {
      this.localallusers[i].modules.splice(this.localallusers[i].modules.indexOf(habilitation), 1);
      this.auth.updateUserHabilitations(this.localallusers[i].id, this.localallusers[i].modules);
    } else {
      this.localallusers[i].modules.push(habilitation);
      this.auth.updateUserHabilitations(this.localallusers[i].id, this.localallusers[i].modules);
    }
  }

}
