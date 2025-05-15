import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { AdmissionService } from 'src/app/services/admission/admission.service';
import { CalculateFeeService } from 'src/app/services/calculateFee/calculate-fee.service';
import { CollegeService } from 'src/app/services/college/college.service';
import { CollegeCourseService } from 'src/app/services/collegeCourse/college-course.service';
import { CourseService } from 'src/app/services/course/course.service';
import { EmployeeService } from 'src/app/services/employee/employee.service';
import { StudentService } from 'src/app/services/student/student.service';
import { CollegeAddComponent } from '../../college/college-add/college-add.component';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';

@Component({
  selector: 'app-admission-add',
  templateUrl: './admission-add.component.html',
  styleUrls: ['./admission-add.component.css']
})
export class AdmissionAddComponent implements OnInit {

  type: string = "Add"
  id: any = ''
  isCourseSelected: boolean = false
  showSave: boolean = false
  months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(x => new Date(2000, x, 2));
  collegeCourseList:any = [];

  admissionForm = new FormGroup({

    isNewStudent: new FormControl(true, Validators.required),
    studentId: new FormControl(''),
    studentName: new FormControl('', Validators.required),
    email: new FormControl('', Validators.required),
    personalContact: new FormControl('', Validators.required),
    parentsContact: new FormControl(''),
    isOfficialTraining: new FormControl(true, Validators.required),
    trainingType: new FormControl(''),
    isPassout: new FormControl(false, Validators.required),
    college: new FormControl('', Validators.required),
    collegeCourse: new FormControl('', Validators.required),
    semester: new FormControl(''),
    admissionDate: new FormControl(new Date()),
    managementPersonId: new FormControl('', [Validators.required]),
    comments: new FormControl(''),
    company: new FormControl('',[Validators.required]),
    technologies: new FormArray([
      new FormGroup({
        course: new FormControl('', [Validators.required]),
        enquiryTakenBy: new FormControl('', [Validators.required]),
        duration: new FormControl('', [Validators.required]),
        installments: new FormControl('', [Validators.required]),
        fee: new FormControl('', [Validators.required]),
        minimumRegistrationFee: new FormControl('', [Validators.required]),
        discount: new FormControl(0)
      })
    ]),
    _id: new FormControl(''),
    totalFeesApplicable: new FormControl(0),
    discount: new FormControl(0, [Validators.required]),
    totalFeeToBePaid: new FormControl(0, [Validators.required]),

    totalRegistrationFee: new FormControl(0, Validators.required),
    registrationFeePaid: new FormControl(0, Validators.required),

    totalInstallments: new FormControl(0, Validators.required),
    courseStartDate: new FormControl(new Date(), Validators.required),
    paymentMethod: new FormControl('Cash', [Validators.required]),
    remarks: new FormControl(''),

    installments: new FormArray([
      // new FormGroup({
      //   installmentNo:new FormControl('',[Validators.required]),
      //   amountToBePaid:new FormControl('',[Validators.required])
      // })
    ]),
    receiptType: new FormControl(0),
    manualReceiptNumber: new FormControl(null),
    courseTaken: new FormControl(null),
    collectedBy: new FormControl(null)

  })

  collegeForm = new FormGroup({
    name: new FormControl('', Validators.required)
  })

  get technologies(): FormArray {
    return this.admissionForm.get('technologies') as FormArray
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



  lastDisabled: any
  addTechnology(event: any): void {
    event.target.disabled = true
    this.lastDisabled = event
    const technology = this.formBuilder.group({
      course: new FormControl('', [Validators.required]),
      enquiryTakenBy: new FormControl('', [Validators.required]),
      duration: new FormControl('', [Validators.required]),
      installments: new FormControl('', [Validators.required]),
      fee: new FormControl('', [Validators.required]),
      minimumRegistrationFee: new FormControl('', [Validators.required]),
      discount: new FormControl(0)
    })
    this.technologies.push(technology);
    console.log(this.technologies.value);

  }

  removeTechnology(index: number) {
    if (index != 0) {
      this.technologies.removeAt(index);
      this.lastDisabled.target.disabled = false
      this.getTotal()
    }
  }


  get installments(): FormArray {
    return this.admissionForm.get('installments') as FormArray;
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

  studentList: any = []
  collegeList: any = []
  courseList: any = []
  employeeList: any = []

  selectFormControl = new FormControl();
  searchTextboxControl = new FormControl();
  selectedValues: any = [];

  filteredOptions: Observable<any[]> | undefined;
  @ViewChild('search') searchTextBox: ElementRef = {} as ElementRef;


  data: any[] = [
    { 'name': '' }
  ]

  _id: any
  admissionData: any
  feeData: any

  constructor(private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private admissionService: AdmissionService,
    private collegeService: CollegeService,
    private courseService: CourseService,
    private employeeService: EmployeeService,
    private studentService: StudentService,
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private calculateFeeService: CalculateFeeService
  ) {

  }

  ngOnInit(): void {
    this.getStudents()
    this.collegeList = JSON.parse(sessionStorage.getItem('colleges') ?? '')
    this.courseList = JSON.parse(sessionStorage.getItem('courses') ?? '')
    this.employeeList = JSON.parse(sessionStorage.getItem('employees') ?? '')
    this.collegeCourseList = JSON.parse(sessionStorage.getItem('collegeCourses') ?? '')
    this.route.paramMap.subscribe(param => {
      this.id = param.get('id') ?? ""
      this.type = this.id == "" ? 'Add' : 'Update'
      if (this.type == 'Update') {
        this.getSingleAdmission()
      }
    })


    let companies = JSON.parse(sessionStorage.getItem('companies')??'');
    if(companies.length==1) {
        this.admissionForm.patchValue({company: companies[0]})
    }
    this.companies = companies;
  }

  getStudents() {
    this.spinner.show()
    this.studentService.getAllStudent(null).subscribe({
      next: (result) => {
        this.spinner.hide()
        if (result.success) {
          this.studentList = result.data
          // console.log("Student List",this.studentList);

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




  selectStudent(evt: any) {
    let student = this.studentList.filter((ele: any) => {
      return ele._id == evt
    })
    this.admissionForm.patchValue({
      studentName: student[0].studentName,
      email: student[0].email,
      personalContact: student[0].personalContact,
    })

    if(!!student[0].parentsContact) this.admissionForm.patchValue({parentsContact:student[0].parentsContact})
    if(!!student[0].college) this.admissionForm.patchValue({college:student[0].college})
    if(!!student[0].collegeCourse) this.admissionForm.patchValue({collegeCourse:student[0].collegeCourse})
  }

  courseChange(event: any, index: number) {
    // console.log("course event value", event);

    let selected = this.courseList.filter((e: any) => {
      return e._id == event
    })
    // console.log("selected course",selected);

    this.technologies.at(index).patchValue({ fee: selected[0].fee })
    this.technologies.at(index).patchValue({ minimumRegistrationFee: selected[0].minimumRegistrationFee })
    this.technologies.at(index).patchValue({ duration: selected[0].duration.duration })
    this.technologies.at(index).patchValue({ installments: selected[0].duration.installments })
    this.technologies.at(index).patchValue({ discount: 0 })

    this.getTotal()

  }

  getTotal() {
    this.isCourseSelected = true
    // console.log(this.technologies.value);
    let totalFee = 0
    let totalRegistrationFee = 0
    let totalDiscount = 0
    for (let i = 0; i < this.technologies.value.length; i++) {
      const element = this.technologies.value[i];
      totalFee += element.fee
      totalRegistrationFee += element.minimumRegistrationFee
      totalDiscount += element.discount
    }
    this.admissionForm.patchValue({ totalFeesApplicable: totalFee })
    this.admissionForm.patchValue({ totalRegistrationFee: totalRegistrationFee })
    this.admissionForm.patchValue({ discount: totalDiscount })
    this.checkRegistration()
  }

  getSingleAdmission() {
    this.admissionService.singleAdmission({ _id: this.id }).subscribe({
      next: (v: any) => {
        var result = v
        if (result.success) {
          this.admissionData = v.data
          this.admissionForm.patchValue({
            _id: v.data?._id,
            isNewStudent: v.data?.isNewStudent,
            studentName: v.data?.studentId?.studentName,
            studentId: v.data?.studentId._id,
            email: v.data?.studentId.email,
            personalContact: v.data?.studentId?.personalContact,
            parentsContact: v.data?.studentId?.parentsContact,
            isOfficialTraining: v.data?.isOfficialTraining,
            trainingType: v.data?.trainingType,
            isPassout: v.data?.isPassout,
            college: v.data?.college._id,
            collegeCourse: v.data?.collegeCourse,
            semester: v.data?.semester,
            managementPersonId: v.data?.managementPersonId._id,
            admissionDate: v.data?.admissionDate,
            comments: v.data?.comments,
          })
          let techarray = v.data?.technologies
          // console.log("techarray",techarray);

          for (let i in techarray) {
            const technology = this.formBuilder.group({
              course: new FormControl(techarray[i].course._id, [Validators.required]),
              enquiryTakenBy: new FormControl(techarray[i].enquiryTakenBy._id, [Validators.required]),
              duration: new FormControl(techarray[i].duration, [Validators.required]),
              installments: new FormControl(techarray[i].installments, [Validators.required]),
              fee: new FormControl(techarray[i].fee, [Validators.required]),
              minimumRegistrationFee: new FormControl(techarray[i].minimumRegistrationFee, [Validators.required])
            })
            this.technologies.push(technology);

          }
          this.isCourseSelected = true
          this.technologies.removeAt(0);
          // console.log("form", this.admissionForm.value);

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

  getFeeData(admissionId: any) {
    this.calculateFeeService.fetchAdmissionCalculatedFee({ admissionId: admissionId }).subscribe({
      next: (v: any) => {
        if (v.success) {
          // this.toastr.success(v.message, 'Success')
          // this.router.navigateByUrl('/admin/enquiries')
          this.feeData = v.data
          // console.log(this.feeData);
          this.getTotal()
          this.admissionForm.patchValue({
            totalFeesApplicable: this.feeData?.totalFeesApplicable,
            discount: this.feeData?.discount,
            totalFeeToBePaid: this.feeData?.totalFeeToBePaid,
            registrationFeePaid: this.feeData?.registrationFeePaid,
            totalInstallments: this.feeData?.totalInstallments,
            courseStartDate: this.feeData?.courseStartDate
          })
          for (let i = 0; i < this.feeData.totalInstallments; i++) {

            const installment = this.formBuilder.group({
              installmentNo: new FormControl(this.feeData.installments[i].installmentNo, [Validators.required]),
              amountToBePaid: new FormControl(this.feeData.installments[i].amountToBePaid, [Validators.required]),
              installmentMonth: new FormControl('',[Validators.required])
            })

            this.installments.push(installment)
          }

          this.showSave = true
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

  freeCourse(index: number, event: any) {
    // console.log("index of course", index, "event", event.checked);
    if (event.checked) {
      this.technologies.at(index).patchValue({ fee: 0 })
      this.technologies.at(index).patchValue({ minimumRegistrationFee: 0 })
      this.technologies.at(index).patchValue({ installments: 0 })
      this.technologies.at(index).patchValue({ discount: 0 })
    } else {
      // console.log("Course", this.technologies.at(index).value.course);

      let selected = this.courseList.filter((e: any) => {
        return e._id == this.technologies.at(index).value.course
      })

      this.technologies.at(index).patchValue({ fee: selected[0].fee })
      this.technologies.at(index).patchValue({ minimumRegistrationFee: selected[0].minimumRegistrationFee })
      this.technologies.at(index).patchValue({ installments: selected[0].duration.installments })
      this.technologies.at(index).patchValue({ discount: 0 })
    }
    // console.log("courses",this.technologies.value);
    this.getTotal()
  }

  checkFreeCourseDisabled(index: number) {
    if (!!this.technologies.at(index).value.course)
      return false
    else return true
  }

  calculateFee() {
    // console.log("Calculate Fee Called");

    let totalFeesApplicable = this.admissionForm.value.totalFeesApplicable ?? 0
    let discount = this.admissionForm.value.discount ?? 0
    let totalFeeToBePaid = totalFeesApplicable - discount
    let registrationFeePaid = this.admissionForm.value.registrationFeePaid ?? 0
    let totalRegistrationFee = this.admissionForm.value.totalRegistrationFee ?? 0
    let totalInstallments = this.admissionForm.value.totalInstallments ?? 0
    let courseStartDate = new Date(this.admissionForm.value.courseStartDate ?? '') ?? new Date

    if(registrationFeePaid == 0 || (totalInstallments == 0 && registrationFeePaid < totalFeeToBePaid)){
      let message  = ""
      if(registrationFeePaid == 0)
        message += "Admission Cannot be added without registration payment. "
      if(totalInstallments == 0 && registrationFeePaid < totalFeeToBePaid)
        message+= "Installments cannot be zero."

      this.toastr.error(message)
      return
    }


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

      for (let i = 0; i < totalInstallments; i++) {
        const installment = this.formBuilder.group({
          installmentNo: new FormControl(i + 1, [Validators.required]),
          amountToBePaid: new FormControl(installments[i], [Validators.required]),
          installmentMonth: new FormControl('',[Validators.required])
        })
        this.installments.push(installment)
      }
      this.admissionForm.patchValue({
        totalFeeToBePaid: totalFeeToBePaid,
      })
      this.showSave = true // button to add admission enabled

    }
    else if (registrationFeePaid == totalFeeToBePaid) {
      this.admissionForm.patchValue({ installments: [] })
      this.admissionForm.patchValue({
        totalFeeToBePaid: totalFeeToBePaid,
        totalInstallments: 0
      })
      this.showSave = true // button to add admission enabled

    }

    // console.log(this.admissionForm.value);
  }

  changeInstallment(event: any, index: number) {

  }




  companies:any = [];

  submit() {
    if ((this.admissionForm.value.receiptType == 1) && (!!this.admissionForm.value.manualReceiptNumber == false)) {
      this.toastr.warning('Kindly Fill Manual Receipt Reference No.');
      return;
    }

    var courseTaken: any = [];
    console.log(this.admissionForm.value)


    // let data.technologies.forEach((element: any) => {
    //   courseTaken.push(element?.course?.name);
    // });



    // let courseTakenArray: any = courseTaken.join(',');
    this.spinner.show()
    if (this.type == 'Add') {
      this.admissionService.addAdmission(this.admissionForm.value).subscribe({
        next: (v: any) => {
          if (v.success) {
            this.toastr.success(v.message, 'Success')
            this.router.navigate(['/admin/admission/view', v?.data?._id])
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
      this.admissionService.updateAdmission(this.admissionForm.value).subscribe({
        next: (v: any) => {
          if (v.success) {
            this.toastr.success(v.message, 'Success')
            this.router.navigate(['/admin/admission/view', this.admissionForm.value._id])

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

  checkRegistration() {
    let feePaid = (this.admissionForm.value.totalFeesApplicable ?? 0) - (this.admissionForm.value.discount ?? 0)
    // console.log("Fee Paid", feePaid);

    if ((this.admissionForm.value.registrationFeePaid ?? 0) > feePaid) {
      // console.log("This Works");

      this.admissionForm.patchValue({ registrationFeePaid: 0 })
      this.toastr.error("Discount or registration fee cannot exceed total fee. ")
      this.admissionForm.patchValue({ totalInstallments: 0 })
    }
  }


  openDialog(data: any) {
    var type = 'Add'


    this.collegeForm.reset()

    const dialogRef = this.dialog.open(CollegeAddComponent, { disableClose: false, autoFocus: true, width: '40%', data: { type: type, form: this.collegeForm } })
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.collegeService.getAllCollege(data).subscribe({
          next: (result: any) => {
            this.spinner.hide()
            if (result.success) {
              this.collegeList = result.data
              sessionStorage.setItem("colleges", JSON.stringify(this.collegeList))
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
    });


  }
}
