import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CalculateFeeService } from 'src/app/services/calculateFee/calculate-fee.service';
import { EnquiryService } from 'src/app/services/enquiry/enquiry.service';
import { EnquiryConfirmAdmissionComponent } from '../enquiry/enquiry-confirm-admission/enquiry-confirm-admission.component';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';

@Component({
  selector: 'app-calculate-fee',
  templateUrl: './calculate-fee.component.html',
  styleUrls: ['./calculate-fee.component.css']
})
export class CalculateFeeComponent implements OnInit {

  enquiryId: any
  displayedColumns: string[] = ['index', 'name', 'courseType', 'fee', 'minimumRegistrationFee', 'installments', 'courseDiscount', 'duration']
  dataSource = new MatTableDataSource<any>([]);
  type: string = ''
  feeData: any = {}
  months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(x => new Date(2000, x, 2))
  monthArray:any = [
    { monthIndex: 1, monthName: 'January' },
    { monthIndex: 2, monthName: 'February' },
    { monthIndex: 3, monthName: 'March' },
    { monthIndex: 4, monthName: 'April' },
    { monthIndex: 5, monthName: 'May' },
    { monthIndex: 6, monthName: 'June' },
    { monthIndex: 7, monthName: 'July' },
    { monthIndex: 8, monthName: 'August' },
    { monthIndex: 9, monthName: 'September' },
    { monthIndex: 10, monthName: 'October' },
    { monthIndex: 11, monthName: 'November' },
    { monthIndex: 12, monthName: 'December' }
  ]
  showSave: boolean = false

  feeForm = new FormGroup({
    _id: new FormControl(''),
    enquiryId: new FormControl(true, Validators.required),
    totalFeesApplicable: new FormControl(0),
    discount: new FormControl(0, [Validators.required]),
    totalFeeToBePaid: new FormControl(0, [Validators.required]),

    totalRegistrationFee: new FormControl(0, Validators.required),
    registrationFeePaid: new FormControl(0, Validators.required),

    totalInstallments: new FormControl(0, Validators.required),
    courseStartDate: new FormControl(new Date(), Validators.required),
    installments: new FormArray([
      // new FormGroup({
      //   month:new FormControl('',[Validators.required]),
      //   amountToBePaid:new FormControl('',[Validators.required])
      // })
    ])
  })

  get installments(): FormArray {
    return this.feeForm.get('installments') as FormArray;
  }


  addInstallment(obj: any) {
    // event.target.disabled = true
    // this.lastDisabled = event
    const installment = this.formBuilder.group({
      installmentNo: new FormControl('', [Validators.required]),
      amountToBePaid: new FormControl('', [Validators.required]),
      installmentMonth: new FormControl('',[Validators.required])
    })
    this.installments.push(installment);
    // console.log(this.installments.value);
  }

  removeInstallment(index: number) {
    this.installments.removeAt(index);
    // this.lastDisabled.target.disabled = false
  }
  constructor(
    private enquiryService: EnquiryService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private formBuilder: FormBuilder,
    private calculateFeeService: CalculateFeeService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.enquiryId = this.activatedRoute.snapshot.paramMap.get('id')
    this.getSingleEnquiry(this.enquiryId)
    this.dataSource.data = [];
    let registrationFeePayMonth = moment().add(30,'days');
    console.log(registrationFeePayMonth.format('M'));
  }

  enquiryData: any
  technologies: any[] = []

  getSingleEnquiry(id: any) {
    this.enquiryService.singleEnquiry({ _id: id }).subscribe({
      next: (v: any) => {
        var result = v
        if (result.success) {
          this.enquiryData = v.data
          // console.log(this.enquiryData);
          this.feeForm.patchValue({ enquiryId: id })
          // this.feeForm.patchValue({totalInstallments:this.enquiryData})
          this.technologies = this.enquiryData.technologies.map((x: any) => {
            x.checked = true
            return x
          })
          this.dataSource.data = this.technologies;
          this.getTotal()


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

  getTotal() {
    let totalFee = 0
    let totalRegistrationFee = 0
    let totalDiscount = 0
    // console.log("technologies", this.technologies);

    for (let i = 0; i < this.technologies.length; i++) {
      const element = this.technologies[i];
      if (element.checked) {
        totalFee += element?.course?.fee
        totalRegistrationFee += element?.course?.minimumRegistrationFee
        totalDiscount += element.discount
      }
    }
    // console.log("totalFee", totalFee);
    // console.log("totalRegistrationFee", totalRegistrationFee);



    this.feeForm.patchValue({ totalFeesApplicable: totalFee })
    this.feeForm.patchValue({ totalFeeToBePaid: totalFee - totalDiscount })
    this.feeForm.patchValue({ totalRegistrationFee: totalRegistrationFee })
    this.feeForm.patchValue({ discount: totalDiscount })

    let installmentsArray = this.technologies.map((x)=>{return x.installments})
    console.log(installmentsArray);

    let totalInstallment = 0
    for( let i of installmentsArray){
      if(i>totalInstallment) totalInstallment = i
    }
    this.feeForm.patchValue({ totalInstallments: totalInstallment })

    if (this.enquiryData?.isFeeCalculated) this.getFeeData(this.enquiryId)
  }

  getFeeData(enquiryId: any) {
    this.calculateFeeService.fetchCalculatedFee({ enquiryId: enquiryId }).subscribe({
      next: (v: any) => {
        if (v.success) {
          // this.toastr.success(v.message, 'Success')
          // this.router.navigateByUrl('/admin/enquiries')
          this.feeData = v.data
          // console.log(this.feeData);
          // if(this.enquiryData.isFeeCalculated){
          this.feeForm.patchValue({ discount: this.feeData.discount })
          this.feeForm.patchValue({ registrationFeePaid: this.feeData.registrationFeePaid })
          this.feeForm.patchValue({ totalInstallments: this.feeData.totalInstallments })
          this.installments.clear()
          for (let i = 0; i < this.feeData.totalInstallments; i++) {
            let obj = this.feeData.installments[i]
            const installment = this.formBuilder.group({
              installmentNo: new FormControl(obj.installmentNo, [Validators.required]),
              amountToBePaid: new FormControl(obj.amountToBePaid, [Validators.required]),
              installmentMonth:new FormControl(obj.installmentMonth, [Validators.required]),
            })

            this.installments.push(installment)
          }
          // }

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

  calculate() {
    let totalFeesApplicable = this.feeForm.value.totalFeesApplicable ?? 0
    let discount = this.feeForm.value.discount ?? 0
    let totalFeeToBePaid = totalFeesApplicable - discount
    let registrationFeePaid = this.feeForm.value.registrationFeePaid ?? 0
    let totalRegistrationFee = this.feeForm.value.totalRegistrationFee ?? 0
    let totalInstallments = this.feeForm.value.totalInstallments ?? 0
    let courseStartDate = new Date(this.feeForm.value.courseStartDate ?? '') ?? new Date

    if (totalInstallments != 0 && registrationFeePaid < totalFeeToBePaid) {
      let installmentFee = 0
      if (registrationFeePaid > totalRegistrationFee)
        installmentFee = totalFeeToBePaid - registrationFeePaid
      else
        installmentFee = totalFeeToBePaid - totalRegistrationFee
      let installmentFeePerMonth = installmentFee / totalInstallments

      let installments: any = []

      if (installmentFeePerMonth % 100 != 0 && totalInstallments != 1) {
        // console.log(1);
        installmentFeePerMonth /= 100
        let first = Math.ceil(installmentFeePerMonth) * 100
        installments.push(first)

        for (let i = 1; i < totalInstallments; i++) {
          // console.log(1.1);

          let sum = 0
          for (let x of installments) { sum += x }
          let leftCount = totalInstallments - i
          let leftFee = installmentFee - sum
          let next = leftFee / leftCount
          // console.log("at", i, next);
          if (next % 100 != 0) {
            // console.log(1.11);
            installments.push(Math.ceil(next / 100) * 100)
            // console.log("installments",installments);

          }
          else {
            // console.log(1.12);
            installments.push(next)
          }
        }
      }
      else {
        console.log(2);
        for (let i = 0; i < totalInstallments; i++) {
          installments.push(installmentFeePerMonth)
        }
      }

      this.installments.clear()
      // registration month
      let registrationFeePayMonth = moment().add(30,'days');
      for (let i = 0; i < totalInstallments; i++) {
        let monthNo:any = null;
        monthNo = registrationFeePayMonth.clone().add(i+1,'months').format('M');
        const installment = this.formBuilder.group({
          installmentNo: new FormControl(i + 1, [Validators.required]),
          amountToBePaid: new FormControl(installments[i], [Validators.required]),
          installmentMonth: new FormControl(monthNo),
        })
        this.installments.push(installment)
      }
      this.feeForm.patchValue({
        totalFeeToBePaid: totalFeeToBePaid,
      })
      this.showSave = true // button to add fee enabled

    }
    else if (registrationFeePaid == totalFeeToBePaid) {
      this.feeForm.patchValue({ installments: [] })
      this.feeForm.patchValue({
        totalFeeToBePaid: totalFeeToBePaid,
        totalInstallments: 0
      })
      this.showSave = true // button to add fee enabled

    }

  }



  changeInDiscount(evt: any) {
    let total = this.feeForm.value.totalFeesApplicable ?? 0
    let discount = Number(evt.target.value)
    // console.log(evt);
    if (discount > total) {
      this.feeForm.patchValue({discount:0})
      this.toastr.error("Discount Cannot Exceed Total Applicable Fee")
    }
    else {
      this.feeForm.patchValue({
        totalFeeToBePaid: total - discount
      })
    }
  }

  changeInPendingRegistration(){
    let total = this.feeForm.value.totalRegistrationFee ?? 0
    let paid = this.feeForm.value.registrationFeePaid ?? 0

    if(total>paid)
    return total - paid
    else {
      return 0
    }

  }

  installmentFee:number = 0
  calcInstallmentFee(){
    let totalFeesApplicable = this.feeForm.value.totalFeesApplicable ?? 0
    let discount = this.feeForm.value.discount ?? 0
    let totalFeeToBePaid = totalFeesApplicable - discount
    let registrationFeePaid = this.feeForm.value.registrationFeePaid ?? 0
    let totalRegistrationFee = this.feeForm.value.totalRegistrationFee ?? 0

    if (registrationFeePaid > totalRegistrationFee)
      this.installmentFee = totalFeeToBePaid - registrationFeePaid
    else
      this.installmentFee = totalFeeToBePaid - totalRegistrationFee

    return this.installmentFee
  }

  submit() {
    this.spinner.show()


    // console.log(this.feeForm.value);
    // this.spinner.hide()
    // return
    // if (this.type == '') {
    this.calculateFeeService.calculateFee(this.feeForm.value).subscribe({
      next: (v: any) => {
        if (v.success) {
          this.toastr.success(v.message, 'Success')
          // this.router.navigate(['/admin/enquiry/viewFee', this.enquiryId])
          this.openDialog(this.enquiryId)
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


    // }
    // else {
    //   this.feeForm.patchValue({_id:this.feeData._id})
    //   this.enquiryService.recalculateFee(this.feeForm.value).subscribe({
    //     next: (v: any) => {
    //       if (v.success) {
    //         this.toastr.success(v.message, 'Success')
    //         // this.router.navigateByUrl('/admin/enquiries')
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
  }

  checkRegistration() {
    let feePaid = (this.feeForm.value.totalFeesApplicable ?? 0) - (this.feeForm.value.discount ?? 0)
    // console.log("Fee Paid", feePaid);

    if ((this.feeForm.value.registrationFeePaid ?? 0) > feePaid) {
      // console.log("This Works");

      this.feeForm.patchValue({ registrationFeePaid: 0 })
      this.toastr.error("Registration Fee Should not be greater that total fee")
      this.feeForm.patchValue({ totalInstallments: 0 })
    }
  }


  allComplete: boolean = true
  someComplete(): boolean {
    if (this.dataSource.data == null) {
      return false;
    }
    return this.dataSource.data.filter(t => t.checked).length > 0 && !this.allComplete;
  }

  setAll(bool: any) {
    this.allComplete = bool;
    this.dataSource.data.forEach(t => (t.checked = bool));
  }

  updateAllComplete(index: any) {
    this.allComplete = this.dataSource.data != null && this.dataSource.data.every(t => t.checked);
    // console.log("Updated Technologies", this.technologies);
    this.getTotal()
  }


  confirmAdmissionForm = new FormGroup({
    _id: new FormControl('', [Validators.required]),
    paymentMethod: new FormControl('Cash', [Validators.required]),
    collectedOn: new FormControl(new Date(), [Validators.required]),
    collectedBy: new FormControl('', [Validators.required]),
    remarks: new FormControl(''),
    technologies: new FormControl(),
    receiptType: new FormControl(0),
    manualReceiptNumber : new FormControl(null)
  })


  openDialog(enquiryId: any) {
    this.technologies = this.technologies.filter((x: any) => { return x.checked })
    this.confirmAdmissionForm.patchValue({ _id: enquiryId, technologies: this.technologies })
    const dialogRef = this.dialog.open(EnquiryConfirmAdmissionComponent, { disableClose: false, autoFocus: true, width: '40%', data: { type: "Add", form: this.confirmAdmissionForm } })
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        // this.router.navigateByUrl('/admin/admissions')
      }
    });
  }

}
