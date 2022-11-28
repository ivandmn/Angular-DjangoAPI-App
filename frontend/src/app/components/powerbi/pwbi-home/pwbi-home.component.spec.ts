import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PwbiHomeComponent } from './pwbi-home.component';

describe('PwbiHomeComponent', () => {
  let component: PwbiHomeComponent;
  let fixture: ComponentFixture<PwbiHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PwbiHomeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PwbiHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
