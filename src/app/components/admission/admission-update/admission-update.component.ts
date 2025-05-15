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
  selector: 'app-admission-update',
  templateUrl: './admission-update.component.html',
  styleUrls: ['./admission-update.component.css']
})
export class AdmissionUpdateComponent implements OnInit {

 
  type: string = "Add"
  id: any = ''
  isCourseSelected: boolean = false
  showSave: boolean = false
  months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(x => new Date(2000, x, 2))

  
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
    collegeCourse: new FormControl('',),
    semester: new FormControl(''),
    admissionDate: new FormControl(new Date()),
    managementPersonId: new FormControl('', [Validators.required]),
    company: new FormControl(''),
    _id: new FormControl(''),
   
  })

  collegeForm = new FormGroup({
    name: new FormControl('', Validators.required)
  })

  
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


  ngOnInit(): void {
    this.getStudents()
    this.collegeList = JSON.parse(sessionStorage.getItem('colleges') ?? '')
    this.courseList = JSON.parse(sessionStorage.getItem('courses') ?? '')
    this.employeeList = JSON.parse(sessionStorage.getItem('employees') ?? '')
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
            company: v.data?.company,
         
          })
          let techarray = v.data?.technologies
          // console.log("techarray",techarray);

         
          this.isCourseSelected = true
        
          // console.log("form", this.admissionForm.value);

          

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

  // getFeeData(admissionId: any) {
  //   this.calculateFeeService.fetchAdmissionCalculatedFee({ admissionId: admissionId }).subscribe({
  //     next: (v: any) => {
  //       if (v.success) {
  //         // this.toastr.success(v.message, 'Success')
  //         // this.router.navigateByUrl('/admin/enquiries')
  //         this.feeData = v.data
  //         // console.log(this.feeData);
  //         this.getTotal()
  //         this.admissionForm.patchValue({
  //           totalFeesApplicable: this.feeData?.totalFeesApplicable,
  //           discount: this.feeData?.discount,
  //           totalFeeToBePaid: this.feeData?.totalFeeToBePaid,
  //           registrationFeePaid: this.feeData?.registrationFeePaid,
  //           totalInstallments: this.feeData?.totalInstallments,
  //           courseStartDate: this.feeData?.courseStartDate
  //         })
  //         for (let i = 0; i < this.feeData.totalInstallments; i++) {

  //           const installment = this.formBuilder.group({
  //             installmentNo: new FormControl(this.feeData.installments[i].installmentNo, [Validators.required]),
  //             amountToBePaid: new FormControl(this.feeData.installments[i].amountToBePaid, [Validators.required]),
  //             installmentMonth: new FormControl('',[Validators.required])
  //           })

  //           this.installments.push(installment)
  //         }

  //         this.showSave = true
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






  companies:any = [];

  submit() {
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
      this.admissionService.updateAdmissionDetails(this.admissionForm.value).subscribe({
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
