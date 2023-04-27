import { TestBed } from '@angular/core/testing';

import { AuthNegationGuard } from './auth-negation.guard';

describe('AuthNegationGuard', () => {
  let guard: AuthNegationGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AuthNegationGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
