import { Component, OnInit, Inject } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinner, NgxSpinnerService } from 'ngx-spinner';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { AdmissionService } from 'src/app/services/admission/admission.service';
import { CalculateFeeService } from 'src/app/services/calculateFee/calculate-fee.service';
import { DeleteDialogComponent } from '../../delete-dialog/delete-dialog.component';
import { FixedSizeVirtualScrollStrategy } from '@angular/cdk/scrolling';
import * as moment from 'moment';

@Component({
  selector: 'app-change-course-dialog',
  templateUrl: './change-course-dialog.component.html',
  styleUrls: ['./change-course-dialog.component.css']
})
export class ChangeCourseComponent implements OnInit {

  id: any
  admissionData: any
  feeData: any
  showSave: boolean = false
  displayedColumns: string[] = ['index', 'name', 'fee', 'minimumRegistrationFee', 'discount', 'action']
  dataSource = new MatTableDataSource<any>([]);
  changeCourseForm = new FormGroup({
    admissionId: new FormControl('', [Validators.required]),
    technologies: new FormArray([
      new FormGroup({
        course: new FormControl('', [Validators.required]),
        enquiryTakenBy: new FormControl(null),
        duration: new FormControl('', [Validators.required]),
        installments: new FormControl(0, [Validators.required]),
        fee: new FormControl(0, [Validators.required]),
        minimumRegistrationFee: new FormControl(0, [Validators.required])
      })
    ]),
    totalFeesApplicable: new FormControl(0),
    discount: new FormControl(0, [Validators.required]),
    totalFeeToBePaid: new FormControl(0, [Validators.required]),
    totalFeePaid: new FormControl(0, [Validators.required]),
    totalBalance: new FormControl(0, [Validators.required]),
    extra: new FormControl(0, [Validators.required]),

    isRegistrationFeePending: new FormControl(),
    registrationFeePayable: new FormControl(0, Validators.required),
    registrationFeePaid: new FormControl(0, Validators.required),
    registrationFeePending: new FormControl(0, Validators.required),

    totalInstallments: new FormControl(0, Validators.required),
    installments: new FormArray([]),
    isCourseChanged: new FormControl(true)
  })

  get technologies(): FormArray {
    return this.changeCourseForm.get('technologies') as FormArray;
  }

  get installments(): FormArray {
    return this.changeCourseForm.get('installments') as FormArray;
  }

  courseList: any[] = []
  employeeList: any[] = []
  constructor(
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private admissionService: AdmissionService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private calculateFeeService: CalculateFeeService,
    private dialog: MatDialog
  ) {

  }


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


  ngOnInit(): void {
    this.courseList = JSON.parse(sessionStorage.getItem('courses') ?? '')
    this.employeeList = JSON.parse(sessionStorage.getItem('employees') ?? '')
    this.route.paramMap.subscribe(param => {
      this.id = param.get('id') ?? ""

      this.getSingleAdmission()

    })
  }

  updateTable(array: any) {
    this.dataSource.data = (array || []);
    // console.log("dataSource",this.dataSource.data);
    this.getTotal()
  }

  techarray: any[] = []
  getSingleAdmission() {
    this.admissionService.singleAdmission({ _id: this.id }).subscribe({
      next: (v: any) => {
        var result = v
        if (result.success) {
          this.admissionData = v.data

          this.changeCourseForm.patchValue({
            admissionId: v.data?._id,
          })
          this.techarray = v.data?.technologies
          // console.log("techarray",this.techarray);

          for (let i in this.techarray) {
            const technology = this.formBuilder.group({
              course: new FormControl(this.techarray[i].course._id, [Validators.required]),
              enquiryTakenBy: new FormControl(null, [Validators.required]),
              duration: new FormControl(this.techarray[i].duration, [Validators.required]),
              installments: new FormControl(this.techarray[i].installments, [Validators.required]),
              fee: new FormControl(this.techarray[i].fee, [Validators.required]),
              minimumRegistrationFee: new FormControl(this.techarray[i].minimumRegistrationFee, [Validators.required]),
              discount: new FormControl(this.techarray[i].discount, [Validators.required]),
            })
            this.technologies.push(technology);
          }

          this.technologies.removeAt(0);
          this.updateTable(this.changeCourseForm.value.technologies)

          this.getFeeData(this.admissionData._id)

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

  currentInstallments: any[] = []
  getFeeData(admissionId: any) {
    this.calculateFeeService.fetchAdmissionCalculatedFee({ admissionId: admissionId }).subscribe({
      next: (v: any) => {
        if (v.success) {
          // this.toastr.success(v.message, 'Success')
          // this.router.navigateByUrl('/admin/enquiries')
          this.feeData = v.data
          // console.log(this.feeData);
          // this.getTotal()
          this.changeCourseForm.patchValue({
            totalFeesApplicable: this.feeData?.totalFeesApplicable,
            discount: this.feeData?.discount,
            totalFeeToBePaid: this.feeData?.totalFeeToBePaid,
            totalFeePaid: this.feeData?.totalFeePaid,
            totalBalance: this.feeData?.totalBalance,
            isRegistrationFeePending: this.feeData?.isRegistrationFeePending,
            registrationFeePayable: this.feeData?.registrationFeePayable,
            registrationFeePaid: this.feeData?.registrationFeePaid,
            registrationFeePending: this.feeData?.registrationFeePending,
            totalInstallments: this.feeData?.totalInstallments
          })

          // if(this.feeData.registrationFeePending > this.feeData.registrationFeePayable)
          //   this.changeCourseForm.patchValue({registrationFeePending: this.feeData?.registrationFeePayable})
          // else this.changeCourseForm.patchValue({registrationFeePending:this.feeData.registrationFeePending})

          if (this.feeData.registrationFeePaid > this.feeData.registrationFeePayable)
            this.changeCourseForm.patchValue({ registrationFeePaid: this.feeData?.registrationFeePayable })
          else this.changeCourseForm.patchValue({ registrationFeePaid: this.feeData.registrationFeePaid })

          this.currentInstallments = this.feeData.installments
          for (let i = 0; i < this.feeData.totalInstallments; i++) {
            let obj = this.feeData.installments[i]
            let paidAmount = 0
            if (obj.paidAmount != 0)
              paidAmount = obj.amountToBePaid - obj.balance
            const installment = this.formBuilder.group({
              installmentNo: new FormControl(obj.installmentNo, [Validators.required]),
              amountToBePaid: new FormControl(obj.amountToBePaid, [Validators.required]),
              paidAmount: new FormControl(paidAmount, [Validators.required]),
              installmentMonth: new FormControl(obj.installmentMonth,[Validators.required])
            })

            this.installments.push(installment)
            this.patchPayMonth()
          }


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

  getTotal() {
    // this.isCourseSelected = true
    // console.log(this.technologies.value);
    let totalFee = 0
    let registrationFeePayable = 0
    for (let i = 0; i < this.technologies.value.length; i++) {
      const element = this.technologies.value[i];
      totalFee += element.fee
      registrationFeePayable += element.minimumRegistrationFee
    }
    this.changeCourseForm.patchValue({ totalFeesApplicable: totalFee })
    this.changeCourseForm.patchValue({ registrationFeePayable: registrationFeePayable })

    this.calculate()
  }

  calculate() {
    this.showSave = false
    let totalFeesApplicable = this.changeCourseForm.value.totalFeesApplicable ?? 0
    let discount = this.changeCourseForm.value.discount ?? 0
    let totalFeeToBePaid = totalFeesApplicable - discount
    let totalFeePaid = this.changeCourseForm.value.totalFeePaid ?? 0
    let totalBalance = totalFeeToBePaid - totalFeePaid

    let isRegistrationFeePending = this.changeCourseForm.value.isRegistrationFeePending
    let registrationFeePayable = this.changeCourseForm.value.registrationFeePayable ?? 0
    let registrationFeePending = this.changeCourseForm.value.registrationFeePending ?? 0


    let totalInstallmentAmount = 0

    if (totalFeePaid > registrationFeePayable) {
      totalInstallmentAmount = totalFeePaid - registrationFeePayable
    }
    else {
      if (isRegistrationFeePending)
        registrationFeePending = registrationFeePayable - totalFeePaid
    }

    if (totalFeePaid > totalFeeToBePaid) {
      totalBalance = 0
      this.changeCourseForm.patchValue({
        extra: totalFeePaid - totalFeeToBePaid,
        totalInstallments: 0
      })
      this.showSave = true
    } else {
      this.changeCourseForm.patchValue({
        extra: 0,
        totalInstallments: this.feeData?.totalInstallments
      })
    }


    this.changeCourseForm.patchValue({
      totalFeeToBePaid: totalFeeToBePaid,
      totalBalance: totalBalance,
      registrationFeePending: registrationFeePending
    })

  }

  checkToCalculateInstallments() {
    let discount = this.changeCourseForm.value.discount ?? 0
    let totalFeesApplicable = this.changeCourseForm.value.totalFeesApplicable ?? 0
    let totalFeeToBePaid = totalFeesApplicable - discount
    let totalFeePaid = this.changeCourseForm.value.totalFeePaid ?? 0
    let totalBalance = totalFeeToBePaid - totalFeePaid
    if (discount > totalBalance) {
      const dialogRef = this.dialog.open(DeleteDialogComponent, { disableClose: false, data: { 'message': ' Discount exceeds balance. Are you sure to continue?' } })
      dialogRef.afterClosed().subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.calculateInstallments()
        }
        else {
          this.techarray = []
          this.installments.clear()
          this.getSingleAdmission()

          // this.changeCourseForm.patchValue({ discount: this.feeData.discount })
          return
        }
      });
    }
    else this.calculateInstallments()
  }

  calculateInstallments() {

    this.installments.clear()
    let discount = this.changeCourseForm.value.discount ?? 0
    let isRegistrationFeePending = this.changeCourseForm.value.isRegistrationFeePending
    let totalInstallments = this.changeCourseForm.value.totalInstallments ?? 0
    let registrationFeePaid = this.changeCourseForm.value.registrationFeePaid ?? 0
    let registrationFeePayable = this.changeCourseForm.value.registrationFeePayable ?? 0
    let totalFeesApplicable = this.changeCourseForm.value.totalFeesApplicable ?? 0
    let totalFeeToBePaid = totalFeesApplicable - discount
    let totalFeePaid = this.changeCourseForm.value.totalFeePaid ?? 0
    let totalBalance = totalFeeToBePaid - totalFeePaid
    let installmentFee = 0

    if (totalInstallments < this.feeData.nextInstallment) {
      this.toastr.error("Total Installments cannot be less than paid installments")
      this.changeCourseForm.patchValue({ totalInstallments: this.feeData.totalInstallments })
      return
    }



    // this.toastr.error("Discount cannot exceeds total balance.")


    // if( totalInstallments!=0 && registrationFeePaid < totalFeeToBePaid )
    if (!isRegistrationFeePending)
      installmentFee = totalFeeToBePaid - registrationFeePaid
    else
      installmentFee = totalFeeToBePaid - registrationFeePayable
    // console.log("installment fee", installmentFee);


    // let installments:any[] = []


    // for fully paid installments
    for (let i = 1; i <= this.feeData.nextInstallment; i++) {

      let obj = this.feeData.installments[i - 1]
      if (obj.paidAmount != 0) { // to check if the installment is paid either fully of partially

        let paidAmount = 0
        paidAmount = obj.paidAmount
        for (let i of obj.balancePayments) paidAmount += i.paidAmount || 0

        let amountToBePaid = obj.amountToBePaid
        if (totalInstallments == 1) amountToBePaid = installmentFee


        const installment = this.formBuilder.group({
          installmentNo: new FormControl(obj.installmentNo, [Validators.required]),
          amountToBePaid: new FormControl(amountToBePaid, [Validators.required]),
          paidAmount: new FormControl(paidAmount, [Validators.required]),
          installmentMonth: new FormControl(undefined,[Validators.required])
        })
        this.installments.push(installment)
        installmentFee -= amountToBePaid
        totalInstallments -= 1

      }
    }
    // for fully paid installments



    console.log("instllmnet after deduction", installmentFee);
    console.log("totalInstallments", totalInstallments);


    if (totalInstallments >= this.feeData.nextInstallment - 1 && totalInstallments != 0) {

      let installmentFeePerMonth = installmentFee / totalInstallments

      console.log("per month", installmentFeePerMonth);


      // for round off installments
      let roundOffInstallments: any = []
      if (installmentFeePerMonth % 100 != 0 && totalInstallments != 1) {
        // console.log(1);
        installmentFeePerMonth /= 100
        let first = Math.ceil(installmentFeePerMonth) * 100
        roundOffInstallments.push(first)

        for (let i = 1; i < totalInstallments; i++) {
          // console.log(1.1);

          let sum = 0
          for (let x of roundOffInstallments) { sum += x }
          let leftCount = totalInstallments - i
          let leftFee = installmentFee - sum
          let next = leftFee / leftCount
          // console.log("at", i, next);
          if (next % 100 != 0) {
            // console.log(1.11);
            roundOffInstallments.push(Math.ceil(next / 100) * 100)


          }
          else {
            // console.log(1.12);
            roundOffInstallments.push(next)
          }
        }
        console.log("roundOffInstallments", roundOffInstallments);
      }
      else {
        // console.log(2);
        for (let i = 0; i < totalInstallments; i++) {
          roundOffInstallments.push(installmentFeePerMonth)
        }
      }


      // assigned total installments again after deduction
      totalInstallments = this.changeCourseForm.value.totalInstallments ?? 0
      if (this.feeData.nextInstallment == 0) this.feeData.nextInstallment = 1

      let count = 0
      for (let i = this.feeData.nextInstallment - 1; i < totalInstallments; i++) {
        let obj = this.feeData.installments[i]
        console.log("test for paid amount", obj);


        if (obj?.installmentNo != undefined) {
          if (obj.paidAmount == 0) {
            const installment = this.formBuilder.group({
              installmentNo: new FormControl(obj.installmentNo, [Validators.required]),
              amountToBePaid: new FormControl(roundOffInstallments[count], [Validators.required]),
              paidAmount: new FormControl(0, [Validators.required]),
              installmentMonth: new FormControl(undefined,[Validators.required])
            })
            this.installments.push(installment)
            count++

          }
        }
        else {
          const installment = this.formBuilder.group({
            installmentNo: new FormControl(i + 1, [Validators.required]),
            amountToBePaid: new FormControl(roundOffInstallments[count], [Validators.required]),
            paidAmount: new FormControl(0, [Validators.required]),
            installmentMonth: new FormControl(undefined,[Validators.required])
          })
          this.installments.push(installment)
          count++

        }


      }
      this.showSave = true
    }
    else {
      // this.toastr.error("Installments cannot be decreased further")
    }

    this.showSave = true

    this.patchPayMonth()
  }

  refresh(index: any) {
    console.log("refresh");

    if (this.admissionData.technologies.length > index) {
      let obj: any = this.admissionData.technologies[index]
      const technology = this.formBuilder.group({
        course: new FormControl(obj.course?._id, [Validators.required]),
        enquiryTakenBy: new FormControl(obj.enquiryTakenBy._id, [Validators.required]),
        duration: new FormControl(obj.duration, [Validators.required]),
        installments: new FormControl(obj.installments, [Validators.required]),
        fee: new FormControl(obj.fee, [Validators.required]),
        minimumRegistrationFee: new FormControl(obj.minimumRegistrationFee, [Validators.required]),
        discount: new FormControl(obj.discount, [Validators.required])
      })
      this.technologies.value.splice(index, 1, technology.value)
    }
    else {
      this.technologies.removeAt(index)
    }

    this.updateTable(this.technologies.value)
  }

  addCourse() {
    const technology = this.formBuilder.group({
      course: new FormControl(null, [Validators.required]),
      enquiryTakenBy: new FormControl(null, [Validators.required]),
      duration: new FormControl('', [Validators.required]),
      installments: new FormControl(0, [Validators.required]),
      fee: new FormControl(0, [Validators.required]),
      minimumRegistrationFee: new FormControl('', [Validators.required])
    })
    this.technologies.push(technology)
    this.dataSource.data = (this.technologies.value || [])
  }

  changeCourse(currentCourse: any, index: any) {

    let newCourse: any = this.courseList.filter((x: any) => { return x._id == currentCourse })[0]
    // console.log("new course", newCourse);
    let check: any = -1;    // to check same courses cannot be added two times
    for (let i in this.technologies.value) {
      let x = this.technologies.value[i]
      if (x.course == newCourse._id && index != i)
        check = i
      console.log("check", check);

    }

    let check1: any = -1;        // to check the course exists in prev tech array
    for (let i in this.techarray) {
      let x = this.techarray[i]
      if (x.course._id == newCourse._id)
        check1 = i
      console.log("check1", check1);

    }
    // console.log("check1",check1);


    if (check == -1) {

      if (check1 == -1) {
        const technology = this.formBuilder.group({
          course: new FormControl(newCourse._id, [Validators.required]),
          enquiryTakenBy: new FormControl(null, [Validators.required]),
          duration: new FormControl(newCourse.duration?.duration, [Validators.required]),
          installments: new FormControl(newCourse.duration?.installments, [Validators.required]),
          fee: new FormControl(newCourse.fee, [Validators.required]),
          minimumRegistrationFee: new FormControl(newCourse.minimumRegistrationFee, [Validators.required])
        })
        this.technologies.value.splice(index, 1, technology.value)

      }
      else {
        // console.log(this.techarray[check1]);

        const technology = this.formBuilder.group({
          course: new FormControl(this.techarray[check1].course._id, [Validators.required]),
          enquiryTakenBy: new FormControl(null, [Validators.required]),
          duration: new FormControl(this.techarray[check1].duration, [Validators.required]),
          installments: new FormControl(this.techarray[check1].installments, [Validators.required]),
          fee: new FormControl(this.techarray[check1].fee, [Validators.required]),
          minimumRegistrationFee: new FormControl(this.techarray[check1].minimumRegistrationFee, [Validators.required]),
          discount: new FormControl(this.techarray[check1].discount, [Validators.required])
        })
        this.technologies.value.splice(index, 1, technology.value)

      }

      this.updateTable(this.technologies.value)
    }
    else {
      if (check == -1) {
        this.refresh(index)
      }
      else {
        for (let i in this.techarray) this.refresh(i)
      }
      this.toastr.error("One course cannot be assigned two times")
    }
  }

  deleteCourse(index: any) {
    console.log("Index", index);

    let arr = this.technologies.value
    if (arr.length > 1) {
      this.technologies.setValue(
        arr.slice(0, index).concat(
          arr.slice(index + 1),
        ).concat(arr[index]),
      );

      this.technologies.removeAt(arr.length - 1)
    }
    else { this.toastr.error("Single Course Cannot be deleted") }

    console.log("after deletion", this.technologies.value);
    this.updateTable(this.technologies.value)
  }

  submit() {
    // console.log("before",this.techarray);

    // console.log("after",this.technologies.value);
    let a1 = this.techarray.map((x: any) => { return x.course._id })
    let a2 = this.technologies.value.map((x: any) => { return x.course })
    // console.log(a1, a2);
    let changed: any[] = []
    if (a1.length == a2.length) {
      changed = a1.filter(item => { return a2.indexOf(item) < 0 })
      if (changed.length == 0) {
        this.changeCourseForm.patchValue({ isCourseChanged: false })
      }
      else this.changeCourseForm.patchValue({ isCourseChanged: true })
    }
    // console.log("Result",changed,this.changeCourseForm.value.isCourseChanged);
    this.spinner.show()
    this.admissionService.changeCourse(this.changeCourseForm.value).subscribe({
      next: (v: any) => {
        var result = v
        if (result.success) {
          this.toastr.success(v.message, 'Success')
          this.spinner.hide()
          this.router.navigate(['/admin/admission/viewFee', v.data._id])
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


  patchPayMonth(){
    let installmentStartMonth = this.feeData.installments[0]?.installmentMonth??moment().add(1,'month');
    let month = moment(installmentStartMonth, 'M');

    this.installments.controls.forEach((control, index) => {
      control.patchValue({ installmentMonth: month.format('M') });
      month.add(1, 'month');
    });

  }

}


