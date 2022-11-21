import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './services/auth.guard';
import { AuthNegationGuard } from './services/auth-negation.guard';

import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { TicketsListComponent } from './components/tickets/tickets-list/tickets-list.component';
import { TicketsCreateComponent } from './components/tickets/ticket-create/ticket-create.component';
import { TicketsTicketComponent } from './components/tickets/ticket-ticket/ticket-ticket.component';

const routes: Routes = [
   { path: '', redirectTo: '/home', pathMatch: 'full' },
   { path: 'log-in', component: LoginComponent, canActivate: [AuthNegationGuard]},
   { path: 'home', component: HomeComponent},
   { path: 'user-profile', component: UserProfileComponent, canActivate: [AuthGuard]},
   { path: 'tickets/list', component: TicketsListComponent, canActivate: [AuthGuard]},
   { path: 'tickets/create', component: TicketsCreateComponent, canActivate: [AuthGuard]},
   { path: 'tickets/ticket', component: TicketsTicketComponent, canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
