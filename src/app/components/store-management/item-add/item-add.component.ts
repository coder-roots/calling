import { Component, OnInit, Inject } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { StoreItemService } from '../../../services/storeItem/store-item.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EmployeeService } from 'src/app/services/employee/employee.service';
import { LabService } from 'src/app/services/lab/lab.service';

@Component({
  selector: 'app-item-add',
  templateUrl: './item-add.component.html',
  styleUrls: ['./item-add.component.css']
})
export class ItemAddComponent implements OnInit {

  type: string = ""
  employeeList:any[]=[]
  labList:any[]=[]
  storeItemForm:any
  constructor(@Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<ItemAddComponent>,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private storeItemService: StoreItemService,
    private employeeService:EmployeeService,
    private labService:LabService
    ) {

    this.type = this.data.type
    this.storeItemForm = this.data.form
    
  }

  ngOnInit(): void {
    this.labList = JSON.parse(sessionStorage.getItem('labs') ?? '')
    this.employeeList = JSON.parse(sessionStorage.getItem('employees') ?? '')
  }

  

 
  submit() {
    this.storeItemForm.patchValue({inUse:this.storeItemForm.value.inUse.toString()})
    this.spinner.show()
    if (this.type == 'Add') {
      // console.log(this.storeItemForm.value);
      this.storeItemService.addStoreItem(this.storeItemForm.value).subscribe({
        next: (v: any) => {
          if (v.success) {
            this.toastr.success(v.message, 'Success')
            this.dialogRef.close(true)
          }
          else {
            this.toastr.error(v.message, 'Error')
          }
        },
        error: (e: any) => {
          this.spinner.hide()
          this.toastr.error(e.error.message, 'Error')
        },
        complete: () => { this.spinner.hide() }
      })
    }
    else {
      this.storeItemService.updateStoreItem(this.storeItemForm.value).subscribe({
        next: (v: any) => {
          if (v.success) {
            this.toastr.success(v.message, 'Success')
            this.dialogRef.close(true)
          }
          else {
            this.toastr.error(v.message, 'Error')
          }
        },
        error: (e: any) => {
          this.spinner.hide()
          this.toastr.error(e.error.message, 'Error')
        },
        complete: () => { this.spinner.hide() }
      })
    }
  }
}
