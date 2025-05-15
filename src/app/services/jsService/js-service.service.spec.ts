import { TestBed } from '@angular/core/testing';

import { JsServiceService } from './js-service.service';

describe('JsServiceService', () => {
  let service: JsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
