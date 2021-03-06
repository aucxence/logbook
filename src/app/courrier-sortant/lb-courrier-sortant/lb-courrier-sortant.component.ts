import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { FireService } from 'src/app/shared/fire.service';
import { Subject } from 'rxjs/internal/Subject';
import { AuthService } from 'src/app/shared/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
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
declare let $;

@Component({
  selector: 'app-lb-courrier-sortant',
  templateUrl: './lb-courrier-sortant.component.html',
  styleUrls: ['./lb-courrier-sortant.component.scss']
})
export class LbCourrierSortantComponent implements OnInit {

  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;

  @ViewChild('dataTable') table;
  dataTable: any;

  sbl: Subscription;

  faCamera = faCamera;
  faplus = faPlus;

  dtOptions: DataTables.Settings = {};
  dtTrigger = new Subject();

  datesortant: Date;
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
    datesortie: string,
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
    public router: Router
  ) {
    this.setupForm();
    this.formUtils = new FormUtils(this.form);
    this.submitted = false;
    this.formErrors = null;
  }

  private setupForm() {
    this.form = this.formBuilder.group({
      datesortant: [null, [Validators.required]],
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

    for (let k = 0; k < names.length; k++) {
      initials = initials + names[k].substring(0, 1).toUpperCase();
    }

    return initials;
  }




  getRefComplete(lRow) {

    const ai = new Date(this.datesortant);
    const day = ai.getDate();
    const month = ai.getMonth() + 1;
    const year = ai.getFullYear();

    const a = ai.toLocaleDateString();

    const b = this.nomemetteur;
    const c = this.nomentreprise;
    const d = this.nomdestinataire;
    const e = this.objet;

    this.reference = 'N°' + this.lpad(lRow, 4) + '/CS/' + this.getInitials(b) + '/LB/' +
      this.getInitials(d) + '/' + this.getInitials(c) + '/' + this.lpad(day, 2) +
      '' + this.lpad(month, 2) + '/' + year;

  }

  initialize() {
    this.fadeout = false;

    try {
      this.firesv.get('lb-courriers-sortants').forEach((actions: DocumentChangeAction<unknown>[]) => {

        const dataSet: string[][] = [];
        let i = 1;
        this.rows = [];

        actions.forEach((action) => {
          const data = action.payload.doc.data() as CourrierSortant;
          const id = action.payload.doc.id;
          const reference = action.payload.doc.ref;
          const docdata = { id, ...data };

          this.rows.push({
            id: docdata.id,
            // ref: reference,
            index: docdata.index,
            datesortie: new Date(docdata.datesortie.seconds * 1000).toLocaleDateString(),
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
      // Use this attribute to enable the responsive extension
      responsive: {
        details: {
          renderer: $.fn.dataTable.Responsive.renderer.listHiddenNodes()
        }
      },
      order: [[0, 'desc']],
      retrieve: true
    };
  }

  ngOnInit(): void {

    this.fadeout = false;

    try {
      this.sbl = this.firesv.get('lb-courriers-sortants').subscribe((actions: DocumentChangeAction<unknown>[]) => {

        let i = 1;
        this.rows = [];

        actions.forEach((action) => {
          const data = action.payload.doc.data() as CourrierSortant;
          const id = action.payload.doc.id;
          const reference = action.payload.doc.ref;
          const docdata = { id, ...data };

          this.rows.push({
            id: docdata.id,
            // ref: reference,
            index: docdata.index,
            datesortie: new Date(docdata.datesortie.seconds * 1000).toLocaleDateString(),
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
      // Use this attribute to enable the responsive extension
      responsive: {
        details: {
          renderer: $.fn.dataTable.Responsive.renderer.listHiddenNodes()
        }
      },
      order: [[0, 'desc']],
      retrieve: true,
    };

    // this.initialize();

  }

  submitBSCS() {
    if (this.form.valid) {
      try {
        const k = {
          apres: '',
          avant: '',
          datesortie: new Date(this.form.value.datesortant),
          entreprise: this.form.value.nomentreprise,
          index: this.rows.length + 1,
          nomdestinataire: this.form.value.nomdestinataire,
          nomemetteur: this.form.value.nomemetteur,
          objet: this.form.value.objet,
          reference: this.form.value.reference
        };
        this.firesv.add('lb-courriers-sortants', k)
          .then((response) => {
            // const idt: string = response.message.split(' ')[0];

            // this.rows.push({
            //   id: idt,
            //   // ref: reference,
            //   // ...k,
            //   index: k.index,
            //   datesortie: k.datesortie.toLocaleDateString(),
            //   nomemetteur: k.nomemetteur,
            //   entreprise: k.entreprise,
            //   nomdestinataire: k.nomdestinataire,
            //   objet: k.objet,
            //   reference: k.reference,
            //   avant: k.avant.length > 0 ? k.avant : '',
            //   apres: k.apres.length > 0 ? k.apres : '',
            //   url: ''
            // });




            this._toastr.success(response.code, response.message, {
              timeOut: 1000
            }).onHidden.subscribe((e) => {
              this.router.navigateByUrl('/dashboard/lbcourrierentrant', { skipLocationChange: true }).then((b) => {
                this.router.navigate(['/dashboard/lbcourriersortant']);
              });
              // this.rerender();
              // this.ngOnInit();
              // window.location.reload()
              // this.dataTable = $(this.table.nativeElement);
              // let x = this.dataTable.DataTable(this.dtOptions);

              // x.row.add([
              //   k.index,
              //   k.reference,
              //   k.avant.length > 0 ? k.avant : '',
              //   k.apres.length > 0 ? k.apres : '',
              //   k.datesortie.toLocaleDateString(),
              //   k.nomemetteur,
              //   k.entreprise,
              //   k.nomdestinataire,
              //   k.objet,

              // ])
              //   .draw();

              // this.rerender();



              // this.router.navigateByUrl("/dashboard/bscourriersortant", { skipLocationChange: true });

              // setTimeout(() => {

              // }, 500);
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



  uploadBSCS($event, avant: boolean, id: string, index) {

    this.fadeout = false;

    this.running = index;

    console.log('-------------------   ' + this.running);

    this.files = $event.target.files;

    let file = this.files.item(0);

    try {
      if (avant === true) {
        this.currentUploadbefore = new Upload(file);
        this.firesv.pushUpload('lb-courriers-sortants', 'LB/CS/', this.currentUploadbefore, avant, id)
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
                this.router.navigateByUrl('/dashboard/lbcourrierentrant', { skipLocationChange: true }).then((b) => {
                  this.router.navigate(['/dashboard/lbcourriersortant']);
                });
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
            // setTimeout(() => {
            //   this.rerender();
            
            // }, 500);

            this.currentUploadbefore = null;
          });
      } else {
        this.currentUploadafter = new Upload(file);
        this.firesv.pushUpload('lb-courriers-sortants', 'LB/CS/', this.currentUploadafter, avant, id)
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
                this.router.navigateByUrl('/dashboard/lbcourrierentrant', { skipLocationChange: true }).then((b) => {
                  this.router.navigate(['/dashboard/lbcourriersortant']);
                });
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
            // setTimeout(() => {
            //   this.rerender();
            
            // }, 500);
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
    // this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
    //   // Destroy the table first
    //   dtInstance.destroy();

    //   this.dtOptions = {
    //     // Use this attribute to enable the responsive extension
    //     responsive: {
    //       details: {
    //         renderer: $.fn.dataTable.Responsive.renderer.listHiddenNodes()
    //       }
    //     },
    //     order: [[0, 'desc']],
    //     retrieve: true,
    //     // destroy: true,
    //     // data: this.rows
    //   };

    //   this.dtTrigger.next();

    //   // $('#id1').click(() => this.openfiles(0));

    //   $('body').on('click', '.apres-button, .avant-button', (event) => {
    //     const $target = $(event.currentTarget);
    //     const i = $target.data('rownumber');
    //     const avt: boolean = $target.data('avant');

    //     this.openfiles(i, avt);
    //   });

    // });

    this.router.navigateByUrl('/dashboard/lbcourrierentrant', { skipLocationChange: true }).then((b) => {
      this.router.navigate(['/dashboard/lbcourriersortant']);
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

