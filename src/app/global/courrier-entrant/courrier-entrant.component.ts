import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { FireService } from 'src/app/shared/fire.service';
import { Subject } from 'rxjs/internal/Subject';
import { AuthService } from 'src/app/shared/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { Response, ResponseCode } from 'src/app/models/response';
import { Upload } from 'src/app/models/upload';
import { DocumentChangeAction, DocumentReference } from '@angular/fire/firestore/interfaces';
import { map } from 'rxjs/operators';
import { CourrierSortant } from 'src/app/models/courrier-sortant';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { DataTableDirective } from 'angular-datatables';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FormUtils } from 'src/app/shared/form.utils';
import { Subscription } from 'rxjs';
import { CourrierEntrant } from 'src/app/models/courrier-entrant';
declare let $;

@Component({
  selector: 'app-courrier-entrant',
  templateUrl: './courrier-entrant.component.html',
  styleUrls: ['./courrier-entrant.component.scss']
})
export class CourrierEntrantComponent implements OnInit {

  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;

  @ViewChild('dataTable') table;
  dataTable: any;

  faCamera = faCamera;
  faplus = faPlus;

  dtOptions: DataTables.Settings = {};
  dtTrigger = new Subject();

  public companies = {
    biostar: 'bs',
    technomed: 'tm',
    kamsu: 'kte',
    unicash: 'ucash',
    muffa: 'muffa',
    itransfer: 'it'
  };

  public companystate = {
    type: 'un Courrier Entrant',
    typepluriel: 'des Courriers Entrants',
    typeunique: 'le Courrier Entrant',
    doctype: '/CE/'
  }

  public relevantstate: {
    [k: string]: any
  };

  public state = {
    [this.companies.biostar]: {
      ...this.companystate,
      companyname: 'BioSTAR',
      bdLink: 'bs-courriers-entrants',
      storageLink: 'BS/CE/',
      companytag: '/BS/',
      deviationpage: '/dashboard/bscourriersortant',
      actualcomp: '/dashboard/courrierentrant/' + this.companies.biostar
    },
    [this.companies.technomed]: {
      ...this.companystate,
      companyname: 'Technologie Médicale',
      bdLink: 'tm-courriers-entrants',
      storageLink: 'TM/CE/',
      companytag: '/TMCO/',
      deviationpage: '/dashboard/tmcourriersortant',
      actualcomp: '/dashboard/courrierentrant/' + this.companies.technomed
    },
    [this.companies.kamsu]: {
      ...this.companystate,
      companyname: 'Kamsu Tankeu Eugénie',
      bdLink: 'kte-courriers-entrants',
      storageLink: 'KTE/CE/',
      companytag: '/KTE/',
      deviationpage: '/dashboard/ktecourriersortant',
      actualcomp: '/dashboard/courrierentrant/' + this.companies.kamsu
    },
    [this.companies.unicash]: {
      ...this.companystate,
      companyname: 'Universal Cash',
      bdLink: 'uc-courriers-entrants',
      storageLink: 'UCASH/CE/',
      companytag: '/UCASH/',
      deviationpage: '/dashboard/uccourriersortant',
      actualcomp: '/dashboard/courrierentrant/' + this.companies.unicash
    },
    [this.companies.muffa]: {
      ...this.companystate,
      companyname: 'Muffa MC2 Kye Ossi',
      bdLink: 'mc2-courriers-entrants',
      storageLink: 'MC2/CE/',
      companytag: '/MMKO/',
      deviationpage: '/dashboard/mc2courriersortant',
      actualcomp: '/dashboard/courrierentrant/' + this.companies.muffa
    },
    [this.companies.itransfer]: {
      ...this.companystate,
      companyname: 'Instant Transfer',
      bdLink: 'it-courriers-entrants',
      storageLink: 'IT/CE/',
      companytag: '/IT/',
      deviationpage: '/dashboard/itcourriersortant',
      actualcomp: '/dashboard/courrierentrant/' + this.companies.itransfer
    }
  };

  datereception = new Date().toISOString().substr(0, 10);

  dateenvoi = new Date().toISOString().substr(0, 10);
  nomemetteur: string = '';
  nomentreprise: string = '';
  nomdestinataire: string = '';
  objet: string = '';
  reference: string = '';

  fadeout = true;

  url: string;

  public form: FormGroup;
  public formUtils: FormUtils;
  public submitted: boolean;
  public formErrors: Array<string>;

  public rows: Array<{
    id: string,
    // ref: DocumentReference,
    index: number,
    datereception: string,
    dateenvoi: string,
    nomemetteur: string,
    nomdestinataire: string,
    entreprise: string,
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
    public router: Router,
    public route: ActivatedRoute
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
      dateenvoi: [null, [Validators.required]],
      nomemetteur: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      nomentreprise: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      nomdestinataire: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      objet: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
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

    const bi = new Date(this.dateenvoi);
    const daye = bi.getDate();
    const monthe = bi.getMonth() + 1;
    const yeare = bi.getFullYear();

    const c = this.nomemetteur;
    const d = this.nomentreprise;//destinataire
    const e = this.nomdestinataire;
    const f = this.objet;

    this.reference = 'N°' + this.lpad(lRow, 4) + this.relevantstate.doctype + this.getInitials(c) + '/' +
      this.getInitials(d) + this.relevantstate.companytag  + this.getInitials(e) + '/' + this.lpad(daye, 2) +
      '' + this.lpad(monthe, 2) + yeare + '/' + this.lpad(dayr, 2) +
      '' + this.lpad(monthr, 2) + yearr;

  }

  sbl: Subscription;
  sub: Subscription;

  ngOnInit(): void {

    this.fadeout = false;

    this.sub = this.route.params.subscribe(params => {
      console.log(params.companyid);
      this.relevantstate = this.state[params.companyid];

      try {
        this.sbl = this.firesv.get(this.relevantstate.bdLink).subscribe((actions: DocumentChangeAction<unknown>[]) => {

          let i = 1;
          this.rows = [];

          actions.forEach((action) => {
            const data = action.payload.doc.data() as CourrierEntrant;
            const id = action.payload.doc.id;
            const reference = action.payload.doc.ref;
            const docdata = { id, ...data };

            this.rows.push({
              id: docdata.id,
              // ref: reference,
              index: docdata.index,
              datereception: new Date(docdata.datereception.seconds * 1000).toLocaleDateString(),
              dateenvoi: new Date(docdata.dateenvoi.seconds * 1000).toLocaleDateString(),
              nomemetteur: docdata.nomemetteur,
              entreprise: docdata.entreprise,
              nomdestinataire: docdata.nomdestinataire,
              objet: docdata.objet,
              reference: docdata.reference,
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

    }, (err) => {
      this.fadeout = true;
      const error = new Response();
      error.code = ResponseCode.Error;
      error.message = err.message;

      this._toastr.error(error.code, error.message, {
        timeOut: 5000
      });
    });



  }

  submitITCE() {
    if (this.form.valid) {
      try {
        const k = {
          apres: '',
          avant: '',
          datereception: new Date(this.form.value.datereception),
          dateenvoi: new Date(this.form.value.dateenvoi),
          entreprise: this.form.value.nomentreprise,
          index: this.rows.length + 1,
          nomdestinataire: this.form.value.nomdestinataire,
          nomemetteur: this.form.value.nomemetteur,
          objet: this.form.value.objet,
          reference: this.form.value.reference
        };
        this.firesv.add(this.relevantstate.bdLink, k)
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
        this.firesv.pushUpload(this.relevantstate.bdLink, this.relevantstate.storageLink, this.currentUploadbefore, avant, id)
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
        this.firesv.pushUpload(this.relevantstate.bdLink, this.relevantstate.storageLink, this.currentUploadafter, avant, id)
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
    this.router.navigateByUrl(this.relevantstate.deviationpage, { skipLocationChange: true }).then((b) => {
      this.router.navigate([this.relevantstate.actualcomp]);
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
