import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OverallDashboardComponent } from './overall-dashboard/overall-dashboard.component';
import { ItCourrierSortantComponent } from './courrier-sortant/it-courrier-sortant/it-courrier-sortant.component';
import { ItCourrierEntrantComponent } from './courrier-entrant/it-courrier-entrant/it-courrier-entrant.component';
import { ItDechargeComponent } from './decharge/it-decharge/it-decharge.component';
import { TmCourrierSortantComponent } from './courrier-sortant/tm-courrier-sortant/tm-courrier-sortant.component';
import { TmCourrierEntrantComponent } from './courrier-entrant/tm-courrier-entrant/tm-courrier-entrant.component';
import { TmDechargeComponent } from './decharge/tm-decharge/tm-decharge.component';
import { BsDechargeComponent } from './decharge/bs-decharge/bs-decharge.component';
import { UcDechargeComponent } from './decharge/uc-decharge/uc-decharge.component';
import { KteDechargeComponent } from './decharge/kte-decharge/kte-decharge.component';
import { BsCourrierSortantComponent } from './courrier-sortant/bs-courrier-sortant/bs-courrier-sortant.component';
import { BsCourrierEntrantComponent } from './courrier-entrant/bs-courrier-entrant/bs-courrier-entrant.component';
import { UcCourrierSortantComponent } from './courrier-sortant/uc-courrier-sortant/uc-courrier-sortant.component';
import { UcCourrierEntrantComponent } from './courrier-entrant/uc-courrier-entrant/uc-courrier-entrant.component';
import { KteCourrierSortantComponent } from './courrier-sortant/kte-courrier-sortant/kte-courrier-sortant.component';
import { KteCourrierEntrantComponent } from './courrier-entrant/kte-courrier-entrant/kte-courrier-entrant.component';
import { LoginComponent } from './auth/login/login.component';
import { RegistrationComponent } from './auth/registration/registration.component';
import { AuthGuard } from './shared/auth.guard';
import { ItNoteServiceComponent } from './noteservice/it-note-service/it-note-service.component';
import { TmNoteServiceComponent } from './noteservice/tm-note-service/tm-note-service.component';
import { BsNoteServiceComponent } from './noteservice/bs-note-service/bs-note-service.component';
import { UcNoteServiceComponent } from './noteservice/uc-note-service/uc-note-service.component';
import { KteNoteServiceComponent } from './noteservice/kte-note-service/kte-note-service.component';
import { BsNoteDisciplinaireComponent } from './note-disciplinaire/bs-note-disciplinaire/bs-note-disciplinaire.component';
import { TmNoteDisciplinaireComponent } from './note-disciplinaire/tm-note-disciplinaire/tm-note-disciplinaire.component';
import { UcNoteDisciplinaireComponent } from './note-disciplinaire/uc-note-disciplinaire/uc-note-disciplinaire.component';
import { KteNoteDisciplinaireComponent } from './note-disciplinaire/kte-note-disciplinaire/kte-note-disciplinaire.component';
import { ItNoteDisciplinaireComponent } from './note-disciplinaire/it-note-disciplinaire/it-note-disciplinaire.component';
import { ItLettreAdministrativeComponent } from './lettre-administrative/it-lettre-administrative/it-lettre-administrative.component';
import { TmLettreAdministrativeComponent } from './lettre-administrative/tm-lettre-administrative/tm-lettre-administrative.component';
import { BsLettreAdministrativeComponent } from './lettre-administrative/bs-lettre-administrative/bs-lettre-administrative.component';
import { UcLettreAdministrativeComponent } from './lettre-administrative/uc-lettre-administrative/uc-lettre-administrative.component';
import { KteLettreAdministrativeComponent } from './lettre-administrative/kte-lettre-administrative/kte-lettre-administrative.component';
import { ItFactureDefinitiveComponent } from './facture-definitive/it-facture-definitive/it-facture-definitive.component';
import { TmFactureDefinitiveComponent } from './facture-definitive/tm-facture-definitive/tm-facture-definitive.component';
import { BsFactureDefinitiveComponent } from './facture-definitive/bs-facture-definitive/bs-facture-definitive.component';
import { UcFactureDefinitiveComponent } from './facture-definitive/uc-facture-definitive/uc-facture-definitive.component';
import { KteFactureDefinitiveComponent } from './facture-definitive/kte-facture-definitive/kte-facture-definitive.component';
import { BsProFormatComponent } from './pro-format/bs-pro-format/bs-pro-format.component';
import { BsBordereauLivraisonComponent } from './bordereau-livraison/bs-bordereau-livraison/bs-bordereau-livraison.component';
import { TmProFormatComponent } from './pro-format/tm-pro-format/tm-pro-format.component';
import { TmBordereauLivraisonComponent } from './bordereau-livraison/tm-bordereau-livraison/tm-bordereau-livraison.component';
import { DashboardComponent } from './dashboard/dashboard.component';
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
import { TasksDashboardHomeComponent } from './tasks-dashboard/tasks-dashboard-home/tasks-dashboard-home.component';
import { TasksDashboardScheduledComponent } from './tasks-dashboard/tasks-dashboard-scheduled/tasks-dashboard-scheduled.component';
import { TasksDashboardSpontaneousComponent } from './tasks-dashboard/tasks-dashboard-spontaneous/tasks-dashboard-spontaneous.component';
import { TasksDashboardUndoneComponent } from './tasks-dashboard/tasks-dashboard-undone/tasks-dashboard-undone.component';
import { TasksDashboardDoneComponent } from './tasks-dashboard/tasks-dashboard-done/tasks-dashboard-done.component';
import { TasksDashboardMonthComponent } from './tasks-dashboard/tasks-dashboard-month/tasks-dashboard-month.component';
import { TasksDashboardAllComponent } from './tasks-dashboard/tasks-dashboard-all/tasks-dashboard-all.component';
import { TasksDashboardRecentComponent } from './tasks-dashboard/tasks-dashboard-recent/tasks-dashboard-recent.component';
import { HabilitationsComponent } from './habilitations/habilitations.component';
import { TasksReportComponent } from './tasks-dashboard/tasks-report/tasks-report.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegistrationComponent
  },
  {
    path: 'global-dashboard',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: DashboardComponent,
    children: [
      {path: 'tasksdashboard', component: TasksDashboardComponent},
    ]
  },
  {
    path: 'tasksdashboard',
    component: TasksDashboardComponent,
    canActivateChild: [AuthGuard],
    canActivate: [AuthGuard],
    children: [
      {path: '', redirectTo: 'home', pathMatch: 'full'},
      {path: 'home', component: TasksDashboardHomeComponent},
      {path: 'scheduled', component: TasksDashboardScheduledComponent},
      {path: 'spontaneous', component: TasksDashboardSpontaneousComponent},
      {path: 'undone', component: TasksDashboardUndoneComponent},
      {path: 'done', component: TasksDashboardDoneComponent},
      {path: 'monthly', component: TasksDashboardMonthComponent},
      {path: 'all', component: TasksDashboardAllComponent},
      {path: 'recent', component: TasksDashboardRecentComponent},
      {path: 'habilitations', component: HabilitationsComponent},
      {path: 'report', component: TasksReportComponent},
    ]
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: OverallDashboardComponent,
    children: [
      {path: '', redirectTo: 'courriersortant/it', pathMatch: 'full'},
      // {path: '**', redirectTo: 'itcourriersortant', pathMatch: 'full'},
      {path: 'itcourriersortant', component: ItCourrierSortantComponent},
      {path: 'itcourrierentrant', component: ItCourrierEntrantComponent},
      {path: 'itdecharge', component: ItDechargeComponent},
      {path: 'itnoteservice', component: ItNoteServiceComponent},
      {path: 'itnotedisciplinaire', component: ItNoteDisciplinaireComponent},
      {path: 'itlettreadministrative', component: ItLettreAdministrativeComponent},
      {path: 'itfacturedefinitive', component: ItFactureDefinitiveComponent},

      {path: 'tmcourriersortant', component: TmCourrierSortantComponent},
      {path: 'tmcourrierentrant', component: TmCourrierEntrantComponent},
      {path: 'tmdecharge', component: TmDechargeComponent},
      {path: 'tmnoteservice', component: TmNoteServiceComponent},
      {path: 'tmnotedisciplinaire', component: TmNoteDisciplinaireComponent},
      {path: 'tmlettreadministrative', component: TmLettreAdministrativeComponent},
      {path: 'tmfacturedefinitive', component: TmFactureDefinitiveComponent},
      {path: 'tmproformat', component: TmProFormatComponent},
      {path: 'tmlivraison', component: TmBordereauLivraisonComponent},

      {path: 'bscourriersortant', component: BsCourrierSortantComponent},
      {path: 'bscourrierentrant', component: BsCourrierEntrantComponent},
      {path: 'bsdecharge', component: BsDechargeComponent},
      {path: 'bsnoteservice', component: BsNoteServiceComponent},
      {path: 'bsnotedisciplinaire', component: BsNoteDisciplinaireComponent},
      {path: 'bslettreadministrative', component: BsLettreAdministrativeComponent},
      {path: 'bsfacturedefinitive', component: BsFactureDefinitiveComponent},
      {path: 'bsproformat', component: BsProFormatComponent},
      {path: 'bslivraison', component: BsBordereauLivraisonComponent},

      {path: 'uccourriersortant', component: UcCourrierSortantComponent},
      {path: 'uccourrierentrant', component: UcCourrierEntrantComponent},
      {path: 'ucdecharge', component: UcDechargeComponent},
      {path: 'ucnoteservice', component: UcNoteServiceComponent},
      {path: 'ucnotedisciplinaire', component: UcNoteDisciplinaireComponent},
      {path: 'uclettreadministrative', component: UcLettreAdministrativeComponent},
      {path: 'ucfacturedefinitive', component: UcFactureDefinitiveComponent},

      {path: 'ktecourriersortant', component: KteCourrierSortantComponent},
      {path: 'ktecourrierentrant', component: KteCourrierEntrantComponent},
      {path: 'ktedecharge', component: KteDechargeComponent},
      {path: 'ktenoteservice', component: KteNoteServiceComponent},
      {path: 'ktenotedisciplinaire', component: KteNoteDisciplinaireComponent},
      {path: 'ktelettreadministrative', component: KteLettreAdministrativeComponent},
      {path: 'ktefacturedefinitive', component: KteFactureDefinitiveComponent},

      {path: 'mc2courriersortant', component: Mc2CourrierSortantComponent},
      {path: 'mc2courrierentrant', component: Mc2CourrierEntrantComponent},
      {path: 'mc2decharge', component: Mc2DechargeComponent},
      {path: 'mc2noteservice', component: Mc2NoteServiceComponent},
      {path: 'mc2notedisciplinaire', component: Mc2NoteDisciplinaireComponent},
      {path: 'mc2lettreadministrative', component: Mc2LettreAdministrativeComponent},
      {path: 'mc2facturedefinitive', component: Mc2FactureDefinitiveComponent},

      {path: 'offreservice/:companyid', component: GlobalOffreServiceComponent},
      {path: 'contratpartenariat/:companyid', component: ContratPartenariatComponent},
      {path: 'ordremission/:companyid', component: OrdreMissionComponent},
      {path: 'dechargecc/:companyid', component: DechargeComponent},
      {path: 'dechargemtrl/:companyid', component: DechargemtrlComponent},
      {path: 'noteservice/:companyid', component: NoteServiceComponent},
      {path: 'facturedefinitive/:companyid', component: FactureDefinitiveComponent},
      {path: 'notedisciplinaire/:companyid', component: NoteDisciplinaireComponent},
      {path: 'lettreadministrative/:companyid', component: LettreAdministrativeComponent},
      {path: 'factureproformat/:companyid', component: FactureProformatComponent},
      {path: 'bordereaulivraison/:companyid', component: BordereauLivraisonComponent},
      {path: 'courrierentrant/:companyid', component: CourrierEntrantComponent},
      {path: 'courriersortant/:companyid', component: CourrierSortantComponent},
      {path: 'procedure/:companyid', component: ProcedureComponent},
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
