import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallSheetAddComponent } from './call-sheet-add.component';

describe('CallSheetAddComponent', () => {
  let component: CallSheetAddComponent;
  let fixture: ComponentFixture<CallSheetAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CallSheetAddComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CallSheetAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
