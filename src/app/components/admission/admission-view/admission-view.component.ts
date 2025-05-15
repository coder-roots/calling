import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AdmissionService } from 'src/app/services/admission/admission.service';
import { CalculateFeeService } from 'src/app/services/calculateFee/calculate-fee.service';
import { BatchService } from 'src/app/services/batch/batch.service';
import { MatDialog } from '@angular/material/dialog';
import { FormArray, FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { CallService } from 'src/app/services/call/call.service';
import { BASE_IMAGE_URL } from '../../../endpoints';
import { CertificateService } from '../../../services/certificate/certificate.service';

@Component({
  selector: 'app-admission-view',
  templateUrl: './admission-view.component.html',
  styleUrls: ['./admission-view.component.css']
})
export class AdmissionViewComponent implements OnInit {

  admissionId: any
  batchId: any
  feeData: any = {}
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  dropReason = new FormControl(undefined);

  constructor(
    private callService: CallService,
    private admissionService: AdmissionService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private calculateFeeService: CalculateFeeService,
    private batchService: BatchService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private certificateService: CertificateService,
  ) { }

  ngOnInit(): void {
    this.admissionId = this.activatedRoute.snapshot.paramMap.get('id')
    this.getSingleAdmission(this.admissionId)
    this.getCalls(this.admissionId)
    this.getAllCertificate(this.admissionId)
  }

  admissionData: any

  getSingleAdmission(id: any) {
    this.spinner.show()
    this.admissionService.singleAdmission({ _id: id }).subscribe({
      next: (v: any) => {
        var result = v
        if (result.success) {
          this.admissionData = v.data
          this.spinner.hide()
          // console.log(this.admissionData);
          // this.getFeeData(this.admissionData._id)
        }
        else {
          this.spinner.hide()
          this.toastr.error(v.message, 'Error')
        }
      },
      error: (e) => {
        this.spinner.hide()
        this.toastr.error(e.error.message)
      },
      complete: () => { this.spinner.hide() }
    })
  }

  addToBatchForm = new FormGroup({
    prevBatchId: new FormControl('', [Validators.required]),
    admissionId: new FormControl('', [Validators.required]),
    batchId: new FormControl('', [Validators.required])
  })

  openDialog(data: any) {
    var type = 'Add'
    if (data == "") {
      type = 'Add'
      this.addToBatchForm.reset()
      this.addToBatchForm.patchValue({ prevBatchId: undefined, admissionId: this.admissionId })
    }
    else {
      type = 'Shuffle'
      this.addToBatchForm.patchValue({
        admissionId: this.admissionId,
        prevBatchId: data
      })
    }
    
  }

  // getFeeData(admissionId:any){
  //   this.calculateFeeService.fetchCalculatedFee({admissionId:admissionId}).subscribe({
  //     next: (v: any) => {
  //       if (v.success) {
  //         // this.toastr.success(v.message, 'Success')
  //         // this.router.navigateByUrl('/admin/enquiries')
  //         this.feeData= v.data
  //         console.log(this.feeData);

  //       }
  //       else {
  //         this.toastr.error(v.message, 'Error')
  //       }
  //     },
  //     error: (e: any) => {
  //       this.spinner.hide()
  //       this.toastr.error(e.error.message, 'Error')
  //     },
  //     complete: () => { this.spinner.hide() }
  //   })
  // }

  getMonth(index: number) {
    return this.months[index];

  }

  // printDetail(){
  //   window.print()
  // }

  calls: any[] = []
  getCalls(id: any) {
    this.callService.getAllCall({ admissionId: id, isEnquiryCall: false, removeSession: 'true' }).subscribe({
      next: (v: any) => {
        var result = v
        if (result.success) {
          this.calls = v.data
          // console.log(this.enquiryData);
        }
        else {
          this.toastr.error(v.message, 'Error')
        }
      },
      error: (e) => {
        this.spinner.hide()
        this.toastr.error(e.error.message)
      },
      complete: () => { this.spinner.hide() }
    })
  }


  changeCourseForm = new FormGroup({
    admissionId: new FormControl('', [Validators.required]),
    courseArray: new FormArray([
      // new FormGroup({
      //   currentCourse:new FormControl(''),
      //   isDeleted:new FormControl(false, [Validators.required]),
      //   isChanged:new FormControl(false, [Validators.required]),
      //   newCourse:new FormControl('')
      // })
    ])
  })

  // get courseArray():FormArray{
  //   return this.changeCourseForm.get('courseArray') as FormArray;
  // }

  // changeCourseDialog(){
  //   this.changeCourseForm.patchValue({
  //     admissionId:this.admissionId,
  //   })

  //   this.courseArray.clear()

  //   for(let x of this.admissionData.technologies){

  //     const course = this.formBuilder.group({
  //       currentCourse:new FormControl(x.course?._id, [Validators.required]),
  //       isDeleted:new FormControl(false, [Validators.required]),
  //       isChanged:new FormControl(false, [Validators.required]),
  //       newCourse:new FormControl(x.course?._id)
  //     })

  //     this.courseArray.push(course)
  //   }
  //   // console.log(this.courseArray);

  //   const dialogRef = this.dialog.open(ChangeCourseDialogComponent, { disableClose: false, autoFocus: true, width: '40%', data:  {form:this.changeCourseForm} })
  //   dialogRef.afterClosed().subscribe((confirmed: boolean) => {
  //     if (confirmed) {
  //       this.getSingleAdmission(this.admissionId)
  //     }
  //   });
  // }

  downloadFormat(data: any) {
    window.open(BASE_IMAGE_URL + data)
  }
  certificates: any[] = []
  getAllCertificate(id: any) {
    this.spinner.show()
    this.certificateService.getAllCertificate({ admissionId: id, removeSession: 'true' }).subscribe({
      next: (result) => {
        this.spinner.hide()
        if (result.success) {
          this.certificates = result.data
        }
        else {
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

  drop(){
    let data:any = {};
    data.admissionId = this.admissionId;
    data.dropReason = this.dropReason.value;
    this.spinner.show();
    this.admissionService.dropAdmission(data).subscribe({
      next: (v: any) => {
        var result = v
        this.spinner.hide()
        if (result.success) {
          this.toastr.success(result.message);
          this.router.navigate(['/admin/admissions']);
        }
        else {
          this.toastr.error(v.message, 'Error')
        }
      },
      error: (e) => {
        this.spinner.hide()
        this.toastr.error(e.error.message)
      },
      complete: () => { this.spinner.hide() }
    })
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

}
