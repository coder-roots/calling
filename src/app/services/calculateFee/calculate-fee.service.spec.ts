import { TestBed } from '@angular/core/testing';

import { CalculateFeeService } from './calculate-fee.service';

describe('CalculateFeeService', () => {
  let service: CalculateFeeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalculateFeeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
