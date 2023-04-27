//General
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AppRoutingModule } from './app-routing.module';
import { ToastrModule } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { YouTubePlayerModule } from '@angular/youtube-player';

//Date Pipes
import { DdMmYYYYDatePipe } from './pipes/dd-mm-yyyy-date.pipe';
import { DdMmYyyyHHMMDatePipe } from './pipes/dd-mm-yyyy-hh-mm-date.pipe';
import { HhMmDatePipe } from './pipes/hh-mm-date.pipe';

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
import { TicketsSearchComponent } from './components/tickets/tickets-search/tickets-search.component';
import { TicketsManualComponent } from './components/tickets/tickets-manual/tickets-manual.component';
import { PwbiCategoryComponent } from './components/powerbi/pwbi-category/pwbi-category.component';
import { PwbiCategoryCreatePublicationComponent } from './components/powerbi/pwbi-category-create-publication/pwbi-category-create-publication.component';
import { PwbiPublicationComponent } from './components/powerbi/pwbi-publication/pwbi-publication.component';
import { UserSearchComponent } from './components/users/user-search/user-search.component';
import { UserSearchProfileComponent } from './components/users/user-search-profile/user-search-profile.component';
import { UserCreateComponent } from './components/users/user-create/user-create.component';

//JQuery & Bootstrap
import * as $ from "jquery";
import * as bootstrap from 'bootstrap';
import * as moment from 'moment';

//Angular Material
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { OnCreateDirective } from './directives/on-create.directive';
import { SafeUrlPipe } from './pipes/safe-url.pipe';


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
    TicketsSearchComponent,
    TicketsManualComponent,
    PwbiCategoryComponent,
    PwbiCategoryCreatePublicationComponent,
    PwbiPublicationComponent,
    UserSearchComponent,
    UserSearchProfileComponent,
    HhMmDatePipe,
    UserCreateComponent,
    OnCreateDirective,
    SafeUrlPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    NgxPaginationModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    YouTubePlayerModule,
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
