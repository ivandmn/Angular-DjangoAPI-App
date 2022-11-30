import { TestBed } from '@angular/core/testing';

import { PowerbiService } from './powerbi.service';

describe('PowerbiService', () => {
  let service: PowerbiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PowerbiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
