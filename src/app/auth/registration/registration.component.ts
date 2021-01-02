import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormUtils } from 'src/app/shared/form.utils';
import { ToastrService } from 'ngx-toastr';

import { Response } from 'src/app/models/response';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  fadeout = false;

  user = new User();

  public form: FormGroup;
  public formUtils: FormUtils;
  public submitted: boolean;
  public formErrors: Array<string>;

  public grades = [];

  constructor(public _auth: AuthService, private formBuilder: FormBuilder, private router: Router, private _toastr: ToastrService) {
    this.setupForm();
    this.formUtils = new FormUtils(this.form);
    this.submitted = false;
    this.formErrors = null;
  }

  public passwordConfirmationValidator(form: FormGroup) {
    if (form.get('password').dirty && form.get('password').value === form.get('passwordConfirmation').value) {
      form.get('passwordConfirmation').setErrors(null);
    }
    else {
      form.get('passwordConfirmation').setErrors({ 'mismatch': true });
    }
  }

  changeinput() {
    const arrStr = this.form.get('surname').value.toLowerCase().split(' ');
    const titleCaseStr = arrStr.reduce((accumulatedStr, currentStr) => {
      const spaceBetweenWords = (accumulatedStr ? ' ' : '');
      return accumulatedStr += spaceBetweenWords + (currentStr.charAt(0).toUpperCase() + currentStr.slice(1));
    }, '');

    this.form.get('surname').setValue(titleCaseStr);
  }

  registerFormSubmit() {

    // this._auth.SingUp(this.user).then(e => {
    //   if (e.uid) {
    //     this._route.navigate(["/"]);
    //   }
    // })

    this.fadeout = false;

    this.user = {
      email: this.form.get('email').value,
      firstname: this.form.get('surname').value,
      lastname: this.form.get('name').value,
      fonction: this.form.get('fonction').value,
      password: this.form.get('password').value,
      status: true,
      projects: []
    };

    console.log(this.user);

    this._auth.register(this.user).then((e: Response) => {
      // console.log(e);
      this.fadeout = true;
      this._toastr.success(e.code, e.message, {
        timeOut: 5000
      }).onHidden.subscribe(e => {
        // console.log(e);
        this.fadeout = true;
        this.router.navigate(['/login']);
      })
    }).catch((err: Response) => {
      this.fadeout = true;
      this._toastr.error(err.code, err.message, {
        timeOut: 3000
      })
    });


  }

  private setupForm() {
    this.form = this.formBuilder.group({
      name: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      surname: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      email: [null, [Validators.required, Validators.email]],
      fonction: [null],
      password: [null, [Validators.required, Validators.minLength(6)]],
      passwordConfirmation: [null, [Validators.required]]
    }, { validator: this.passwordConfirmationValidator });
  }

  ngOnInit(): void {
    this._auth.getGrades().subscribe((grades) => {
      grades.forEach((grade) => {
        this.grades.push(grade.data());
      })
      this.grades.sort((grade1, grade2) => {
        if (grade1.level > grade2.level) {
          return 1;
        }

        if (grade1.level < grade2.level) {
          return -1;
        }

        return 0;
      });
    })
    this.fade();
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fade(): Promise<void> {
    // Do something before delay
    console.log('before delay');

    await this.delay(1000);

    this.fadeout = true;
    // Do something after
    console.log('after delay');
  }

}
