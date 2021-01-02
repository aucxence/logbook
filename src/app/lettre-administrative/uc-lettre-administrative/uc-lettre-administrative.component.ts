import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { FireService } from 'src/app/shared/fire.service';
import { Subject } from 'rxjs/internal/Subject';
import { AuthService } from 'src/app/shared/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Response, ResponseCode } from 'src/app/models/response';
import { Upload } from 'src/app/models/upload';
import { DocumentChangeAction } from '@angular/fire/firestore/interfaces';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { DataTableDirective } from 'angular-datatables';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FormUtils } from 'src/app/shared/form.utils';
import { Subscription } from 'rxjs';
import { NoteService } from 'src/app/models/note-service';
import { NoteDisciplinaire } from 'src/app/models/note-disciplinaire';
declare let $;

@Component({
  selector: 'app-uc-lettre-administrative',
  templateUrl: './uc-lettre-administrative.component.html',
  styleUrls: ['./uc-lettre-administrative.component.scss']
})
export class UcLettreAdministrativeComponent implements OnInit {

  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;

  @ViewChild('dataTable') table;
  dataTable: any;

  faCamera = faCamera;
  faplus = faPlus;

  dtOptions: DataTables.Settings = {};
  dtTrigger = new Subject();

  datereception: Date;
  nomemetteur: string = '';
  nomdocument: string = '';
  objet: string = '';
  reference: string = '';

  fadeout = true;

  url: string;

  public form: FormGroup;
  public formUtils: FormUtils;
  public submitted: boolean;
  public formErrors: Array<string>;

  public bdLink = 'uc-lettres-administratives';
  public storageLink = 'UCASH/LA/';
  public companytag = '/UCASH/';
  public doctype = '/LA';

  public deviationpage = '/dashboard/uccourriersortant';
  public actualcomp = '/dashboard/uclettreadministrative';

  public rows: Array<{
    id: string,
    index: number,
    date: string,
    nomdocument: string,
    nomemetteur: string
    objet: string,
    reference: string,
    avant: string,
    apres: string,
    url: string
  }> = [];

  files: FileList;
  currentUploadbefore: Upload;
  currentUploadafter: Upload;

  running: number;

  constructor(
    private firesv: FireService,
    private formBuilder: FormBuilder,
    private _auth: AuthService,
    private _toastr: ToastrService,
    public router: Router
  ) {
    this.setupForm();
    this.formUtils = new FormUtils(this.form);
    console.log('---------------');
    this.submitted = false;
    this.formErrors = null;
  }

  private setupForm() {
    this.form = this.formBuilder.group({
      datereception: [null, [Validators.required]],
      objet: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      nomemetteur: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      nomdocument: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      reference: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    });
  }

  lpad(value, padding) {
    const zeroes = new Array(padding + 1).join('0');
    return (zeroes + value).slice(-padding);
  }

  getInitials(nm: string) {
    const names = nm.split(' ');
    let initials = '';

    // tslint:disable-next-line: prefer-for-of
    for (let k = 0; k < names.length; k++) {
      initials = initials + names[k].substring(0, 1).toUpperCase();
    }

    return initials;
  }

  getRefComplete(lRow) {

    const ai = new Date(this.datereception);
    const dayr = ai.getDate();
    const monthr = ai.getMonth() + 1;
    const yearr = ai.getFullYear();

    const a = ai.toLocaleDateString();

    const docname = this.getInitials(this.nomdocument);
    const concerne = this.getInitials(this.nomemetteur);

    const f = this.objet;

    console.log(this.lpad(dayr, 2));

    this.reference = 'N°' + this.lpad(lRow, 4) + '/' + docname + '' + this.companytag + concerne +
      '/' + this.lpad(dayr, 2) + '' + this.lpad(monthr, 2) + '/' + yearr;

  }

  sbl: Subscription;

  ngOnInit(): void {

    this.fadeout = false;

    try {
      this.sbl = this.firesv.get(this.bdLink).subscribe((actions: DocumentChangeAction<unknown>[]) => {

        let i = 1;
        this.rows = [];

        actions.forEach((action) => {
          console.log('--------------------------------');
          const data = action.payload.doc.data() as NoteDisciplinaire;
          const id = action.payload.doc.id;
          const docdata = { id, ...data };

          this.rows.push({
            id: docdata.id,
            index: docdata.index,
            date: new Date(docdata.date.seconds * 1000).toLocaleDateString(),
            objet: docdata.objet,
            reference: docdata.reference,
            nomemetteur: docdata.nomemetteur,
            nomdocument: docdata.nomdocument,
            avant: docdata.avant.length > 0 ? docdata.avant : '',
            apres: docdata.apres.length > 0 ? docdata.apres : '',
            url: ''
          });

          i++;
        });

        this.dtTrigger.next();

        this.fadeout = true;

      }, (error) => {

        const err = new Response();
        err.code = ResponseCode.Error;
        err.message = error.message as string;

        this._auth.SingOut().then((e: Response) => {

          this.fadeout = true;
          this._toastr.error(err.code, err.message, {
            timeOut: 1000
          }).onHidden.subscribe(e => {
            this.router.navigate(['/login']);
          });
        }).catch((e: Response) => {
          this.fadeout = true;
          this._toastr.error(e.code, e.message, {
            timeOut: 5000
          });
        });
      });
    } catch (e) {
      this.fadeout = true;
      const error = new Response();
      error.code = ResponseCode.Error;
      error.message = e.message;

      this._toastr.error(error.code, error.message, {
        timeOut: 5000
      });
    } finally {
      this.fadeout = true;
    }

    this.dtOptions = {
      responsive: {
        details: {
          renderer: $.fn.dataTable.Responsive.renderer.listHiddenNodes()
        }
      },
      order: [[0, 'desc']],
      retrieve: true,
    };

  }

  submitITCE() {
    if (this.form.valid) {
      try {
        const k = {
          apres: '',
          avant: '',
          date: new Date(this.form.value.datereception),
          objet: this.form.value.objet,
          reference: this.form.value.reference,
          index: this.rows.length + 1,
          nomdocument: this.form.value.nomdocument,
          nomemetteur: this.form.value.nomemetteur
        };
        this.firesv.add(this.bdLink, k)
          .then((response) => {

            this._toastr.success(response.code, response.message, {
              timeOut: 1000
            }).onHidden.subscribe((e) => {
              this.rerender();
            });

          }).catch((error) => {
            this._toastr.error(error.code, error.message, {
              timeOut: 5000
            });
          }).finally(() => {
            this.form.reset();
          });
        return true;
      } catch (error) {
        this._toastr.error(ResponseCode.Error, error.message, {
          timeOut: 5000
        });
      }
    } else {
      this._toastr.error(ResponseCode.Error, 'S\'il vous plait, veuillez remplir chaque champ', {
        timeOut: 5000
      });
    }
  }

  uploadITCE($event, avant: boolean, id: string, index) {

    this.fadeout = false;

    this.running = index;

    console.log('-------------------   ' + this.running);

    this.files = $event.target.files;

    let file = this.files.item(0);

    try {
      if (avant === true) {
        this.currentUploadbefore = new Upload(file);
        this.firesv.pushUpload(this.bdLink, this.storageLink, this.currentUploadbefore, avant, id)
          .then((response) => {
            const msg = response.message.split(' ');
            this.currentUploadbefore.url = msg[msg.length - 1];
            this.rows[index - 1].url = msg[msg.length - 1];
            this.rows[index - 1].avant = msg[0];
            this.fadeout = true;
            this._toastr.success(response.code, response.message, {
              timeOut: 1000
            }).onHidden.subscribe((e) => {

              setTimeout(() => {
                this.rerender();
              }, 1000);
            });
          })
          .catch((error) => {
            this.fadeout = true;
            this._toastr.error(error.message, error.code, {
              timeOut: 5000
            });
          })
          .finally(() => {
            this.currentUploadbefore = null;
          });
      } else {
        this.currentUploadafter = new Upload(file);
        this.firesv.pushUpload(this.bdLink, this.storageLink, this.currentUploadafter, avant, id)
          .then((response) => {
            const msg = response.message.split(' ');
            this.currentUploadafter.url = msg[msg.length - 1];
            this.rows[index - 1].url = msg[msg.length - 1];
            this.rows[index - 1].apres = msg[0];
            this.fadeout = true;
            this._toastr.success(response.code, response.message, {
              timeOut: 1000
            }).onHidden.subscribe((e) => {
              setTimeout(() => {
                this.rerender();
              }, 1000);
            });
          })
          .catch((error) => {
            this.fadeout = true;
            this._toastr.error(error.message, error.code, {
              timeOut: 5000
            });
          })
          .finally(() => {
            this.currentUploadafter = null;
          });
      }
    } catch (e) {
      this.fadeout = true;
      const error = new Response();
      error.code = ResponseCode.Error;
      error.message = e.message;

      this._toastr.error(error.code, error.message, {
        timeOut: 5000
      });
    }
  }

  rerender(): void {
    this.router.navigateByUrl(this.deviationpage, { skipLocationChange: true }).then((b) => {
      this.router.navigate([this.actualcomp]);
    });
  }
  
  openfiles(i: number, avt: boolean) {
    this.fadeout = false;
    if (avt === true) {
      this.firesv.getUrl(this.rows[i].avant)
        .then((response) => {
          this.fadeout = true;
          this._toastr.success(response.code, response.message, {
            timeOut: 500
          }).onHidden.subscribe((e) => {
            let msg = response.message.split(' ');
            this.goToLink(msg[msg.length - 1]);
          });
        })
        .catch((error) => {
          this.fadeout = true;
          this._toastr.error(error.code, error.message, {
            timeOut: 5000
          });
        });
    } else {
      this.firesv.getUrl(this.rows[i].apres)
        .then((response) => {
          this.fadeout = true;
          this._toastr.success(response.code, response.message, {
            timeOut: 500
          }).onHidden.subscribe((e) => {
            const msg = response.message.split(' ');
            this.goToLink(msg[msg.length - 1]);
          });
        })
        .catch((error) => {
          this.fadeout = true;
          this._toastr.error(error.code, error.message, {
            timeOut: 5000
          });
        });
    }
  }

  private goToLink(url: string) {
    window.open(url, '_blank');
  }

  ngOnDestroy(): void {
    if (this.sbl) {
      this.sbl.unsubscribe();
    }
    if (this.dtTrigger) {
      // Do not forget to unsubscribe the event
      this.dtTrigger.unsubscribe();
    }
  }

  ngAfterViewInit(): void {

    window.addEventListener('load', () => {
      // Fetch all the forms we want to apply custom Bootstrap validation styles to
      const forms = document.getElementsByClassName('needs-validation');
      // Loop over them and prevent submission
      const validation = Array.prototype.filter.call(forms, (form) => {
        form.addEventListener('submit', (event) => {
          if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
          }
          form.classList.add('was-validated');
        }, true);
      });
    }, true);
  }

}
