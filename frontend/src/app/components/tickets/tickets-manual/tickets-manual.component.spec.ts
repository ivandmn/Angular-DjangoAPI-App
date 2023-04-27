import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketsManualComponent } from './tickets-manual.component';

describe('TicketsManualComponent', () => {
  let component: TicketsManualComponent;
  let fixture: ComponentFixture<TicketsManualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicketsManualComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketsManualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
