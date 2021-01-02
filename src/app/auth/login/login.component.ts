import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { FormUtils } from 'src/app/shared/form.utils';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/auth.service';
import { Response } from 'src/app/models/response';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  [x: string]: any;

  fadeout = false;
  user = new User();

  public form: FormGroup;
  public formUtils: FormUtils;
  public submitted: boolean;
  public formErrors: Array<string>;

  // tslint:disable-next-line: variable-name
  constructor(private _auth: AuthService, private formBuilder: FormBuilder, private router: Router, private _toastr: ToastrService) {
    this.setupForm();
    this.formUtils = new FormUtils(this.form);
    this.submitted = false;
    this.formErrors = null;
  }

  loginFormFormSubmit() {

    this.fadeout = false;

    this.user = this.form.value;

    // console.log(this.user);

    this._auth.SignIn(this.user).then((e: Response) => {
      // console.log(e);
      this.fadeout = true;
      this._toastr.success(e.code, e.message, {
        timeOut: 1000
      }).onHidden.subscribe(e => {
        // console.log(e);
        this.router.navigate(['/dashboard']);
      })
    }).catch((err: Response) => {
      this.fadeout = true;
      console.log(err.message);
      return this._toastr.error(err.code, err.message, {
        timeOut: 5000
      });
    });
  }

  private setupForm(){
    this.form = this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.fade();
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fade(): Promise<void> {
    // Do something before delay
    // console.log('before delay');

    await this.delay(1000);

    this.fadeout = true;
    // Do something after
    // console.log('after delay');
  }

}
