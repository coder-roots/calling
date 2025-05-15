import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverallBalanceReportComponent } from './overall-balance-report.component';

describe('OverallBalanceReportComponent', () => {
  let component: OverallBalanceReportComponent;
  let fixture: ComponentFixture<OverallBalanceReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OverallBalanceReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverallBalanceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
