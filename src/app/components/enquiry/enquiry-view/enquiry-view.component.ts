import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AdmissionService } from 'src/app/services/admission/admission.service';
import { CallService } from 'src/app/services/call/call.service';
import { EnquiryService } from 'src/app/services/enquiry/enquiry.service';
import { CallAddComponent } from '../call-add/call-add.component';
import { MatDialog } from '@angular/material/dialog';
import { EnquiryConfirmAdmissionComponent } from '../enquiry-confirm-admission/enquiry-confirm-admission.component';

@Component({
  selector: 'app-enquiry-view',
  templateUrl: './enquiry-view.component.html',
  styleUrls: ['./enquiry-view.component.css']
})
export class EnquiryViewComponent implements OnInit {

  callForm= new FormGroup({
    _id: new FormControl('', Validators.required),
    enquiryId: new FormControl('', Validators.required),
    callerName: new FormControl('', Validators.required),
    callDate: new FormControl('', Validators.required),
    callStatus: new FormControl('', Validators.required),
    isEnquiryCall:new FormControl(true)
  })

  dropReason = new FormControl(null);

  enquiryId:any
  constructor(
    private enquiryService:EnquiryService,
    private activatedRoute:ActivatedRoute,
    private toastr:ToastrService,
    private spinner:NgxSpinnerService,
    private router:Router,
    private admissionService:AdmissionService,
    private callService:CallService,
    private dialog: MatDialog,
    ) { }

  ngOnInit(): void {
    this.enquiryId = this.activatedRoute.snapshot.paramMap.get('id')
    this.getSingleEnquiry(this.enquiryId)
    this.getCalls(this.enquiryId)
  }

  enquiryData: any
  calls:any[]=[]

  getSingleEnquiry(id:any) {
    this.spinner.show()
    this.enquiryService.singleEnquiry({ _id: id }).subscribe({
      next: (v: any) => {
        var result = v
        if (result.success) {
          this.enquiryData = v.data
          // console.log(this.enquiryData);
        }
        else {
          this.toastr.error(v.message, 'Error')
        }
        this.spinner.hide()
      },
      error: (e) => {
        this.spinner.hide()
        this.toastr.error(e.error.message)
      },
      complete: () => { this.spinner.hide() }
    })
  }

  confirmAdmissionForm = new FormGroup({
    _id:new FormControl('', [Validators.required]),
    paymentMethod:new FormControl('Cash', [Validators.required]),
    collectedOn:new FormControl(new Date(), [Validators.required]),
    collectedBy:new FormControl('', [Validators.required]),
    remarks:new FormControl('')
  })

  openConfirmAdmissionDialog(enquiryId:any){
    this.confirmAdmissionForm.patchValue({_id:enquiryId})
      const dialogRef = this.dialog.open(EnquiryConfirmAdmissionComponent, { disableClose: false, autoFocus: true, width: '40%', data: { type: "Add", form:this.confirmAdmissionForm } })
            dialogRef.afterClosed().subscribe((confirmed: boolean) => {
              if (confirmed) {
                // this.router.navigateByUrl('/admin/admissions')
              }
            });
  }

  getCalls(id:any){
    this.callService.getAllCall({ enquiryId: id, isEnquiryCall:true }).subscribe({
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

  openDialog(data: any) {
    var type = 'Add'
    if (data == "") {
      type = 'Add'
      this.callForm.reset()
      this.callForm.patchValue({ _id: undefined, enquiryId:this.enquiryId })
    }
    else {
      type = 'Update'
      this.callForm.patchValue({
        enquiryId: data?.enquiryId,
        callerName: data?.callerName,
        callDate: data?.callDate,
        callStatus: data?.callStatus,
        _id: data?._id
      })
    }
    const dialogRef = this.dialog.open(CallAddComponent, { disableClose: false, autoFocus: true, width: '40%', data: { type: type, form: this.callForm } })
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.getCalls(this.enquiryId)
      }
    });
  }


  dropEnquiry() {
    let data:any = {
      _id: this.enquiryId,
      dropReason: this.dropReason.value
    }
    this.spinner.show();
    this.enquiryService.dropEnquiry(data).subscribe({
      next: (v: any) => {
        this.spinner.hide();
        if (v.success) {
          this.toastr.success(v.message);
          this.getSingleEnquiry(this.enquiryId);
        }
        else {
          this.toastr.error(v.message, 'Error')
        }
        this.spinner.hide()
      },
      error: (e:any) => {
        this.spinner.hide()
        this.toastr.error(e.error.message)
      },
      complete: () => { this.spinner.hide() }
    })
  }
}
