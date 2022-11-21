import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketsTicketComponent } from './ticket-ticket.component';

describe('TicketsTicketComponent', () => {
  let component: TicketsTicketComponent;
  let fixture: ComponentFixture<TicketsTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicketsTicketComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketsTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
