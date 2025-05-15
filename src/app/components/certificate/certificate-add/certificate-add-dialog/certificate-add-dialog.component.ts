import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CertificateService } from '../../../../services/certificate/certificate.service';

@Component({
  selector: 'app-certificate-add-dialog',
  templateUrl: './certificate-add-dialog.component.html',
  styleUrls: ['./certificate-add-dialog.component.css']
})
export class CertificateAddDialogComponent implements OnInit {

  admissonData: any ={}
  employeeList: any[]=[]
  certificateForm:any
  constructor(@Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<CertificateAddDialogComponent>,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private certificateService: CertificateService
    ) {

    this.admissonData = this.data.admissionData
    this.certificateForm = this.data.form

  }

  ngOnInit(): void {
    this.employeeList = JSON.parse(sessionStorage.getItem('employees')?? '')
    this.fillData()
  }

  fillData(){
    this.certificateForm.patchValue({
      name:this.admissonData?.studentId?.studentName,
      email:this.admissonData?.studentId?.email
    })
  }

  createRefNo(event:any){
    let d = new Date()
    let currentYear = d.getFullYear().toString().substr(-2)
    let refNo = "O7S/"+event.value+currentYear+"/"+this.admissonData.admissionAutoId
    this.certificateForm.patchValue({
      refNo:refNo
    })

    // console.log(refNo);

  }

  submit() {
    this.spinner.show()
    console.log(this.certificateForm.value);
      this.certificateService.addCertificate(this.certificateForm.value).subscribe({
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


  // this function is used to set the layout of the ceritficate without fill form

  // submitforCertificate(){
  //  let obj =  {
  //     "admissionId": "65814b6bb51b8e2cc0558382",
  //     "collectedBy": "Self",
  //     "givenBy": "655603e0916552202940cb75",
  //     "comments": "xx",
  //     "name": "Rishabh",
  //     "email": "rishabh@gmail.com",
  //     "coursename": "DIGITAL MARKETING WITH UI UX",
  //     "refNo": "O7S/6M24/42",
  //     "start": "12 January, 2024",
  //     "end": "12 August, 2024"
  // }
  // this.certificateService.addCertificate(obj).subscribe({
  //   next: (v: any) => {
  //     if (v.success) {
  //       this.toastr.success(v.message, 'Success')
  //     }
  //     else {
  //       this.toastr.error(v.message, 'Error')
  //     }
  //   },
  //   error: (e: any) => {
  //     this.spinner.hide()
  //     this.toastr.error(e.error.message, 'Error')
  //   },
  //   complete: () => { this.spinner.hide() }
  // })

  // }

}
