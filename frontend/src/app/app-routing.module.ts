import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//Guards
import { AuthGuard } from './guards/auth.guard';
import { AuthNegationGuard } from './guards/auth-negation.guard';
import { NeutralGuard } from './guards/neutral.guard';
import { AuthAdminGuard } from './guards/auth-admin.guard';

//Components
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { TicketsListComponent } from './components/tickets/tickets-list/tickets-list.component';
import { TicketsCreateComponent } from './components/tickets/ticket-create/ticket-create.component';
import { TicketsTicketComponent } from './components/tickets/ticket-ticket/ticket-ticket.component';
import { TicketsSearchComponent } from './components/tickets/tickets-search/tickets-search.component';
import { TicketsManualComponent } from './components/tickets/tickets-manual/tickets-manual.component';
import { PwbiHomeComponent } from './components/powerbi/pwbi-home/pwbi-home.component';
import { PwbiCategoryComponent } from './components/powerbi/pwbi-category/pwbi-category.component';
import { PwbiPublicationComponent } from './components/powerbi/pwbi-publication/pwbi-publication.component';
import { PwbiCategoryCreatePublicationComponent } from './components/powerbi/pwbi-category-create-publication/pwbi-category-create-publication.component';
import { UserSearchComponent } from './components/users/user-search/user-search.component';
import { UserSearchProfileComponent } from './components/users/user-search-profile/user-search-profile.component';
import { UserCreateComponent } from './components/users/user-create/user-create.component';

const routes: Routes = [
   { path: '', redirectTo: '/home', pathMatch: 'full'},
   { path: 'log-in', component: LoginComponent, canActivate: [AuthNegationGuard]},
   { path: 'home', component: HomeComponent, canActivate: [NeutralGuard]},
   { path: 'user-profile', component: UserProfileComponent, canActivate: [AuthGuard]},
   { path: 'tickets/list', component: TicketsListComponent, canActivate: [AuthGuard]},
   { path: 'tickets/create', component: TicketsCreateComponent, canActivate: [AuthGuard]},
   { path: 'tickets/ticket', component: TicketsTicketComponent, canActivate: [AuthGuard]},
   { path: 'tickets/search', component: TicketsSearchComponent, canActivate: [AuthGuard]},
   { path: 'tickets/manual', component: TicketsManualComponent, canActivate: [AuthGuard]},
   { path: 'pwbi/home', component: PwbiHomeComponent, canActivate: [AuthGuard]},
   { path: 'pwbi/category', component: PwbiCategoryComponent, canActivate: [AuthGuard]},
   { path: 'pwbi/publication', component: PwbiPublicationComponent, canActivate: [AuthGuard]},
   { path: 'pwbi/create', component: PwbiCategoryCreatePublicationComponent, canActivate: [AuthAdminGuard]},
   { path: 'users/search', component: UserSearchComponent, canActivate: [AuthGuard]},
   { path: 'users/search/profile', component: UserSearchProfileComponent, canActivate: [AuthGuard]},
   { path: 'users/create', component: UserCreateComponent, canActivate: [AuthAdminGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
