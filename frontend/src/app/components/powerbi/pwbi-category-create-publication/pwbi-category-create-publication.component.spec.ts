import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PwbiCategoryCreatePublicationComponent } from './pwbi-category-create-publication.component';

describe('PwbiCategoryCreatePublicationComponent', () => {
  let component: PwbiCategoryCreatePublicationComponent;
  let fixture: ComponentFixture<PwbiCategoryCreatePublicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PwbiCategoryCreatePublicationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PwbiCategoryCreatePublicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
