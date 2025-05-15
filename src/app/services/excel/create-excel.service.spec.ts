import { TestBed } from '@angular/core/testing';

import { CreateExcelService } from './create-excel.service';

describe('CreateExcelService', () => {
  let service: CreateExcelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreateExcelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
