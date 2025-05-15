import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CalculateFeeService } from 'src/app/services/calculateFee/calculate-fee.service';
import { EnquiryService } from 'src/app/services/enquiry/enquiry.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EnquiryConfirmAdmissionComponent } from '../../enquiry/enquiry-confirm-admission/enquiry-confirm-admission.component';

@Component({
  selector: 'app-calculate-fee-view',
  templateUrl: './calculate-fee-view.component.html',
  styleUrls: ['./calculate-fee-view.component.css']
})
export class CalculateFeeViewComponent implements OnInit {
  enquiryId:any
  displayedColumns: string[] = ['index','name','courseType', 'fee', 'minimumRegistrationFee', 'duration']
  dataSource = new MatTableDataSource<any>([]);
  feeData:any = {}
  months=['January','February','March','April','May','June','July','August','September','October','November','December']
  constructor(
    private enquiryService:EnquiryService,
    private calculateFeeService:CalculateFeeService,
    private activatedRoute:ActivatedRoute,
    private toastr:ToastrService,
    private spinner:NgxSpinnerService,
    private router:Router,
    private dialog: MatDialog
    ) { }

  ngOnInit(): void {
    this.enquiryId = this.activatedRoute.snapshot.paramMap.get('id')
    this.getSingleEnquiry(this.enquiryId)
    this.getFeeData(this.enquiryId)
    this.dataSource.data = []

  }

  enquiryData: any

  getSingleEnquiry(id:any) {
    this.enquiryService.singleEnquiry({ _id: id }).subscribe({
      next: (v: any) => {
        var result = v
        if (result.success) {
          this.enquiryData = v.data
          // console.log(this.enquiryData)
          this.dataSource.data = [...this.dataSource.data, ...(this.enquiryData.technologies || [])];
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

  getFeeData(enquiryId:any){
    this.calculateFeeService.fetchCalculatedFee({enquiryId:enquiryId}).subscribe({
      next: (v: any) => {
        if (v.success) {
          // this.toastr.success(v.message, 'Success')
          // this.router.navigateByUrl('/admin/enquiries')
          this.feeData= v.data
          // console.log(this.feeData);

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



  printDetail(){
    window.print()
  }
  confirmAdmissionForm = new FormGroup({
    _id:new FormControl('', [Validators.required]),
    paymentMethod:new FormControl('Cash', [Validators.required]),
    collectedOn:new FormControl(new Date(), [Validators.required]),
    collectedBy:new FormControl('', [Validators.required]),
    remarks:new FormControl('')
  })


  openDialog(enquiryId:any){
    this.confirmAdmissionForm.patchValue({_id:enquiryId})
      const dialogRef = this.dialog.open(EnquiryConfirmAdmissionComponent, { disableClose: false, autoFocus: true, width: '40%', data: { type: "Add", form:this.confirmAdmissionForm } })
            dialogRef.afterClosed().subscribe((confirmed: boolean) => {
              if (confirmed) {
                // this.router.navigateByUrl('/admin/admissions')
              }
            });
  }

  

}
