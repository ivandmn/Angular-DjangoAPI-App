import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketsCreateComponent } from './ticket-create.component';



describe('TicketsCreateComponent', () => {
  let component: TicketsCreateComponent;
  let fixture: ComponentFixture<TicketsCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicketsCreateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketsCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
