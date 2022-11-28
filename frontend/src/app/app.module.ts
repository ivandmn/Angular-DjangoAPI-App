//General
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './services/authconfig.interceptor';
import { AppRoutingModule } from './app-routing.module';
import { ToastrModule } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { NgxPaginationModule } from 'ngx-pagination';

//Pipes
import { DdMmYYYYDatePipe } from './date-pipes/dd-mm-yyyy-date.pipe';
import { DdMmYyyyHHMMDatePipe } from './date-pipes/dd-mm-yyyy-hh-mm-date.pipe';

//Components
import { AppComponent } from './app.component';
import { MainComponent } from './components/main/main.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { TicketsListComponent } from './components/tickets/tickets-list/tickets-list.component';
import { TicketsCreateComponent } from './components/tickets/ticket-create/ticket-create.component';
import { TicketsTicketComponent } from './components/tickets/ticket-ticket/ticket-ticket.component';
import { PwbiHomeComponent } from './components/powerbi/pwbi-home/pwbi-home.component';

//JQuery & Bootstrap
import * as $ from "jquery";
import * as bootstrap from 'bootstrap';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    LoginComponent,
    HomeComponent,
    UserProfileComponent,
    TicketsListComponent,
    TicketsCreateComponent,
    DdMmYYYYDatePipe,
    TicketsTicketComponent,
    DdMmYyyyHHMMDatePipe,
    PwbiHomeComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    NgxPaginationModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    CookieService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
