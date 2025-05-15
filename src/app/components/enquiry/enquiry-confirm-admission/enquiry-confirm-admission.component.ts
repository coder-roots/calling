import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AdmissionService } from 'src/app/services/admission/admission.service';
import { CalculateFeeService } from 'src/app/services/calculateFee/calculate-fee.service';

@Component({
  selector: 'app-enquiry-confirm-admission',
  templateUrl: './enquiry-confirm-admission.component.html',
  styleUrls: ['./enquiry-confirm-admission.component.css']
})
export class EnquiryConfirmAdmissionComponent implements OnInit {

  confirmAdmissionForm:any
  amountPaid:any
  employeeList:any[] = []
  constructor(
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private admissionService:AdmissionService,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<EnquiryConfirmAdmissionComponent>,
    private calculateFeeService:CalculateFeeService,
    private router:Router
  ) { 
    this.confirmAdmissionForm = data.form
    // console.log(this.confirmAdmissionForm.value);
    
    this.amountPaid = data.amountPaid
  }

  ngOnInit(): void {
    this.employeeList = JSON.parse(sessionStorage.getItem('employees')??'')
    this.getAmount()
  }

  getAmount(){
    this.calculateFeeService.fetchCalculatedFee({enquiryId:this.confirmAdmissionForm.value._id}).subscribe({
      next: (v: any) => {
        if (v.success) {
          // this.toastr.success(v.message, 'Success')
          // this.router.navigateByUrl('/admin/enquiries')
          this.amountPaid = v?.data?.registrationFeePaid
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

  submit(){
    this.admissionService.confirmAdmission(this.confirmAdmissionForm.value).subscribe({
      next: (result) => {
        this.spinner.hide()
        if (result.success) {
          this.toastr.success(result.message, 'Success')
          this.dialogRef.close(true)
          this.router.navigate(['/admin/admission/viewFee/', result.data?._id])
        }
        else{
          this.spinner.hide()
          this.toastr.error(result.message)
        }
      },
      error: (e) => {
        this.spinner.hide()
        this.toastr.error(e)

      },
      complete: () => {
        this.spinner.hide()
      }
    })
  }
}
