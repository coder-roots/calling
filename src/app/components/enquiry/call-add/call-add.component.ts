import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallService } from '../../../services/call/call.service';
import { UserDataService } from '../../../services/userData/user-data.service';

@Component({
  selector: 'app-call-add',
  templateUrl: './call-add.component.html',
  styleUrls: ['./call-add.component.css']
})
export class CallAddComponent implements OnInit {

  
  type: string = ""

  callForm:any
  constructor(@Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<CallAddComponent>,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private callService: CallService,
    private userDataService:UserDataService) {

    this.type = this.data.type 
    this.callForm = this.data.form
    
    
  }

  ngOnInit(): void {
    this.callForm.patchValue({callDate:new Date(), callerName:this.userDataService.getData().data?.name, isEnquiryCall:true})
  }

  submit() {
    this.spinner.show()
    if (this.type == 'Add') {
      // console.log(this.callForm.value);
      this.callService.addCall(this.callForm.value).subscribe({
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
      this.callService.updateCall(this.callForm.value).subscribe({
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
