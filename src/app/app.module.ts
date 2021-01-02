import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { IconsModule } from './icons/icons.module';
import { OverallDashboardComponent } from './overall-dashboard/overall-dashboard.component';
import { ItCourrierEntrantComponent } from './courrier-entrant/it-courrier-entrant/it-courrier-entrant.component';
import { ItCourrierSortantComponent } from './courrier-sortant/it-courrier-sortant/it-courrier-sortant.component';
import { TmCourrierEntrantComponent } from './courrier-entrant/tm-courrier-entrant/tm-courrier-entrant.component';
import { TmCourrierSortantComponent } from './courrier-sortant/tm-courrier-sortant/tm-courrier-sortant.component';
import { ItDechargeComponent } from './decharge/it-decharge/it-decharge.component';
import { TmDechargeComponent } from './decharge/tm-decharge/tm-decharge.component';
import { UcDechargeComponent } from './decharge/uc-decharge/uc-decharge.component';
import { BsDechargeComponent } from './decharge/bs-decharge/bs-decharge.component';
import { KteDechargeComponent } from './decharge/kte-decharge/kte-decharge.component';
import { UcCourrierSortantComponent } from './courrier-sortant/uc-courrier-sortant/uc-courrier-sortant.component';
import { BsCourrierSortantComponent } from './courrier-sortant/bs-courrier-sortant/bs-courrier-sortant.component';
import { KteCourrierSortantComponent } from './courrier-sortant/kte-courrier-sortant/kte-courrier-sortant.component';
import { UcCourrierEntrantComponent } from './courrier-entrant/uc-courrier-entrant/uc-courrier-entrant.component';
import { BsCourrierEntrantComponent } from './courrier-entrant/bs-courrier-entrant/bs-courrier-entrant.component';
import { KteCourrierEntrantComponent } from './courrier-entrant/kte-courrier-entrant/kte-courrier-entrant.component';
import { LoginComponent } from './auth/login/login.component';
import { RegistrationComponent } from './auth/registration/registration.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from 'src/environments/environment';
import { AngularFireDatabaseModule } from '@angular/fire/database';

import { RouterModule } from '@angular/router';

import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { BnNgIdleService } from 'bn-ng-idle';

import { BackButtonDisableModule } from 'angular-disable-browser-back-button';

import { DataTablesModule } from 'angular-datatables';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ItNoteServiceComponent } from './noteservice/it-note-service/it-note-service.component';
import { UcNoteServiceComponent } from './noteservice/uc-note-service/uc-note-service.component';
import { BsNoteServiceComponent } from './noteservice/bs-note-service/bs-note-service.component';
import { KteNoteServiceComponent } from './noteservice/kte-note-service/kte-note-service.component';
import { TmNoteServiceComponent } from './noteservice/tm-note-service/tm-note-service.component';
import { LbCourrierEntrantComponent } from './courrier-entrant/lb-courrier-entrant/lb-courrier-entrant.component';
import { LbCourrierSortantComponent } from './courrier-sortant/lb-courrier-sortant/lb-courrier-sortant.component';
import { LbDechargeComponent } from './decharge/lb-decharge/lb-decharge.component';
import { LbNoteServiceComponent } from './noteservice/lb-note-service/lb-note-service.component';
import { ItNoteDisciplinaireComponent } from './note-disciplinaire/it-note-disciplinaire/it-note-disciplinaire.component';
import { BsNoteDisciplinaireComponent } from './note-disciplinaire/bs-note-disciplinaire/bs-note-disciplinaire.component';
import { UcNoteDisciplinaireComponent } from './note-disciplinaire/uc-note-disciplinaire/uc-note-disciplinaire.component';
import { KteNoteDisciplinaireComponent } from './note-disciplinaire/kte-note-disciplinaire/kte-note-disciplinaire.component';
import { TmNoteDisciplinaireComponent } from './note-disciplinaire/tm-note-disciplinaire/tm-note-disciplinaire.component';
import { ItLettreAdministrativeComponent } from './lettre-administrative/it-lettre-administrative/it-lettre-administrative.component';
import { BsLettreAdministrativeComponent } from './lettre-administrative/bs-lettre-administrative/bs-lettre-administrative.component';
import { KteLettreAdministrativeComponent } from './lettre-administrative/kte-lettre-administrative/kte-lettre-administrative.component';
import { TmLettreAdministrativeComponent } from './lettre-administrative/tm-lettre-administrative/tm-lettre-administrative.component';
import { UcLettreAdministrativeComponent } from './lettre-administrative/uc-lettre-administrative/uc-lettre-administrative.component';
import { ItFactureDefinitiveComponent } from './facture-definitive/it-facture-definitive/it-facture-definitive.component';
import { TmFactureDefinitiveComponent } from './facture-definitive/tm-facture-definitive/tm-facture-definitive.component';
import { BsFactureDefinitiveComponent } from './facture-definitive/bs-facture-definitive/bs-facture-definitive.component';
import { UcFactureDefinitiveComponent } from './facture-definitive/uc-facture-definitive/uc-facture-definitive.component';
import { KteFactureDefinitiveComponent } from './facture-definitive/kte-facture-definitive/kte-facture-definitive.component';
import { TmProFormatComponent } from './pro-format/tm-pro-format/tm-pro-format.component';
import { BsProFormatComponent } from './pro-format/bs-pro-format/bs-pro-format.component';
import { TmBordereauLivraisonComponent } from './bordereau-livraison/tm-bordereau-livraison/tm-bordereau-livraison.component';
import { BsBordereauLivraisonComponent } from './bordereau-livraison/bs-bordereau-livraison/bs-bordereau-livraison.component';
import { DashboardCardComponent } from './helpers/dashboard-card/dashboard-card.component';
import { TasksDashboardComponent } from './tasks-dashboard/tasks-dashboard.component';
import { Mc2CourrierSortantComponent } from './courrier-sortant/mc2-courrier-sortant/mc2-courrier-sortant.component';
import { Mc2CourrierEntrantComponent } from './courrier-entrant/mc2-courrier-entrant/mc2-courrier-entrant.component';
import { Mc2DechargeComponent } from './decharge/mc2-decharge/mc2-decharge.component';
import { Mc2NoteServiceComponent } from './noteservice/mc2-note-service/mc2-note-service.component';
import { Mc2NoteDisciplinaireComponent } from './note-disciplinaire/mc2-note-disciplinaire/mc2-note-disciplinaire.component';
import { Mc2LettreAdministrativeComponent } from './lettre-administrative/mc2-lettre-administrative/mc2-lettre-administrative.component';
import { Mc2FactureDefinitiveComponent } from './facture-definitive/mc2-facture-definitive/mc2-facture-definitive.component';
import { GlobalOffreServiceComponent } from './global/global-offre-service/global-offre-service.component';
import { ContratPartenariatComponent } from './global/contrat-partenariat/contrat-partenariat.component';
import { OrdreMissionComponent } from './global/ordre-mission/ordre-mission.component';
import { DechargeComponent } from './global/decharge/decharge.component';
import { DechargemtrlComponent } from './global/dechargemtrl/dechargemtrl.component';
import { NoteServiceComponent } from './global/note-service/note-service.component';
import { FactureDefinitiveComponent } from './global/facture-definitive/facture-definitive.component';
import { NoteDisciplinaireComponent } from './global/note-disciplinaire/note-disciplinaire.component';
import { LettreAdministrativeComponent } from './global/lettre-administrative/lettre-administrative.component';
import { FactureProformatComponent } from './global/facture-proformat/facture-proformat.component';
import { BordereauLivraisonComponent } from './global/bordereau-livraison/bordereau-livraison.component';
import { CourrierEntrantComponent } from './global/courrier-entrant/courrier-entrant.component';
import { CourrierSortantComponent } from './global/courrier-sortant/courrier-sortant.component';
import { ProcedureComponent } from './global/procedure/procedure.component';
import * as firebase from 'firebase';
import { TasksDashboardHomeComponent } from './tasks-dashboard/tasks-dashboard-home/tasks-dashboard-home.component';
import { TasksDashboardScheduledComponent } from './tasks-dashboard/tasks-dashboard-scheduled/tasks-dashboard-scheduled.component';
import { TasksDashboardSpontaneousComponent } from './tasks-dashboard/tasks-dashboard-spontaneous/tasks-dashboard-spontaneous.component';
import { TasksDashboardDoneComponent } from './tasks-dashboard/tasks-dashboard-done/tasks-dashboard-done.component';
import { TasksDashboardUndoneComponent } from './tasks-dashboard/tasks-dashboard-undone/tasks-dashboard-undone.component';
import { TasksDashboardRecentComponent } from './tasks-dashboard/tasks-dashboard-recent/tasks-dashboard-recent.component';
import { TasksDashboardMonthComponent } from './tasks-dashboard/tasks-dashboard-month/tasks-dashboard-month.component';
import { TasksDashboardAllComponent } from './tasks-dashboard/tasks-dashboard-all/tasks-dashboard-all.component';
import { DayBoxComponent } from './helpers/day-box/day-box.component';
import { Ng2CompleterModule } from 'ng2-completer';
import { HttpClientModule } from '@angular/common/http';
import { AddTaskDialogComponent } from './dialogs/add-task-dialog/add-task-dialog.component';

import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

import { CookieService } from 'ngx-cookie-service';
import { HabilitationsComponent } from './habilitations/habilitations.component';
import { TasksReportComponent } from './tasks-dashboard/tasks-report/tasks-report.component';

// the second parameter 'fr' is optional
registerLocaleData(localeFr, 'fr');

firebase.initializeApp(environment.firebaseConfig);

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    OverallDashboardComponent,
    ItCourrierEntrantComponent,
    ItCourrierSortantComponent,
    TmCourrierEntrantComponent,
    TmCourrierSortantComponent,
    ItDechargeComponent,
    TmDechargeComponent,
    UcDechargeComponent,
    BsDechargeComponent,
    KteDechargeComponent,
    UcCourrierSortantComponent,
    BsCourrierSortantComponent,
    KteCourrierSortantComponent,
    UcCourrierEntrantComponent,
    BsCourrierEntrantComponent,
    KteCourrierEntrantComponent,
    LoginComponent,
    RegistrationComponent,
    ItNoteServiceComponent,
    UcNoteServiceComponent,
    BsNoteServiceComponent,
    KteNoteServiceComponent,
    TmNoteServiceComponent,
    LbCourrierEntrantComponent,
    LbCourrierSortantComponent,
    LbDechargeComponent,
    LbNoteServiceComponent,
    ItNoteDisciplinaireComponent,
    BsNoteDisciplinaireComponent,
    UcNoteDisciplinaireComponent,
    KteNoteDisciplinaireComponent,
    TmNoteDisciplinaireComponent,
    ItLettreAdministrativeComponent,
    BsLettreAdministrativeComponent,
    KteLettreAdministrativeComponent,
    TmLettreAdministrativeComponent,
    UcLettreAdministrativeComponent,
    ItFactureDefinitiveComponent,
    TmFactureDefinitiveComponent,
    BsFactureDefinitiveComponent,
    UcFactureDefinitiveComponent,
    KteFactureDefinitiveComponent,
    TmProFormatComponent,
    BsProFormatComponent,
    TmBordereauLivraisonComponent,
    BsBordereauLivraisonComponent,
    DashboardCardComponent,
    TasksDashboardComponent,
    Mc2CourrierSortantComponent,
    Mc2CourrierEntrantComponent,
    Mc2DechargeComponent,
    Mc2NoteServiceComponent,
    Mc2NoteDisciplinaireComponent,
    Mc2LettreAdministrativeComponent,
    Mc2FactureDefinitiveComponent,
    GlobalOffreServiceComponent,
    ContratPartenariatComponent,
    OrdreMissionComponent,
    DechargeComponent,
    DechargemtrlComponent,
    NoteServiceComponent,
    FactureDefinitiveComponent,
    NoteDisciplinaireComponent,
    LettreAdministrativeComponent,
    FactureProformatComponent,
    BordereauLivraisonComponent,
    CourrierEntrantComponent,
    CourrierSortantComponent,
    ProcedureComponent,
    TasksDashboardHomeComponent,
    TasksDashboardScheduledComponent,
    TasksDashboardSpontaneousComponent,
    TasksDashboardDoneComponent,
    TasksDashboardUndoneComponent,
    TasksDashboardRecentComponent,
    TasksDashboardMonthComponent,
    TasksDashboardAllComponent,
    DayBoxComponent,
    AddTaskDialogComponent,
    HabilitationsComponent,
    TasksReportComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    IconsModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireDatabaseModule,
    AngularFirestoreModule,
    AngularFireAuthModule,
    RouterModule,
    ToastrModule.forRoot({
      timeOut: 1000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
      progressAnimation: "increasing",
      progressBar: true,
      easing: "ease-in-out-quad"
    }),
    BrowserAnimationsModule,
    BackButtonDisableModule.forRoot({
      preserveScrollPosition: true
    }),
    DataTablesModule,
    FontAwesomeModule,
    Ng2CompleterModule,
    HttpClientModule,
  ],
  providers: [
    BnNgIdleService,
    { provide: LOCALE_ID, useValue: 'fr' },
    CookieService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
