import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSearchProfileComponent } from './user-search-profile.component';

describe('UserSearchProfileComponent', () => {
  let component: UserSearchProfileComponent;
  let fixture: ComponentFixture<UserSearchProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserSearchProfileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserSearchProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
