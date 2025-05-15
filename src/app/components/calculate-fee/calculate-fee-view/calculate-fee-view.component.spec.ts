import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculateFeeViewComponent } from './calculate-fee-view.component';

describe('CalculateFeeViewComponent', () => {
  let component: CalculateFeeViewComponent;
  let fixture: ComponentFixture<CalculateFeeViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalculateFeeViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculateFeeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
