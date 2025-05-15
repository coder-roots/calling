import { TestBed } from '@angular/core/testing';

import { SessionYearService } from './session-year.service';

describe('SessionYearService', () => {
  let service: SessionYearService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionYearService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
