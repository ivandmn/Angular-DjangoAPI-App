import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PwbiCategoryComponent } from './pwbi-category.component';

describe('PwbiCategoryComponent', () => {
  let component: PwbiCategoryComponent;
  let fixture: ComponentFixture<PwbiCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PwbiCategoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PwbiCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
