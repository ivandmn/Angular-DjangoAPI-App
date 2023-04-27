import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PwbiPublicationComponent } from './pwbi-publication.component';

describe('PwbiPublicationComponent', () => {
  let component: PwbiPublicationComponent;
  let fixture: ComponentFixture<PwbiPublicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PwbiPublicationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PwbiPublicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
