import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropReportComponent } from './drop-report.component';

describe('DropReportComponent', () => {
  let component: DropReportComponent;
  let fixture: ComponentFixture<DropReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DropReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DropReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
