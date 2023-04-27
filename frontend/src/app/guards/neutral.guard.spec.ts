import { TestBed } from '@angular/core/testing';

import { NeutralGuard } from './neutral.guard';

describe('NeutralGuard', () => {
  let guard: NeutralGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(NeutralGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
