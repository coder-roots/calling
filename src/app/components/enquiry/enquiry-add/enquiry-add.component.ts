import { Component, OnInit, ViewChild, ElementRef, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { CollegeService } from 'src/app/services/college/college.service';
import { CollegeCourseService } from 'src/app/services/collegeCourse/college-course.service';
import { CourseService } from 'src/app/services/course/course.service';
import { EmployeeService } from 'src/app/services/employee/employee.service';
import { EnquiryService } from 'src/app/services/enquiry/enquiry.service';
import { StudentService } from 'src/app/services/student/student.service';
import { CollegeAddComponent } from '../../college/college-add/college-add.component';
import { MatDialog } from '@angular/material/dialog';
import { CollegeCourseAddComponent } from '../../college-course/college-course-add/college-course-add.component';

@Component({
  selector: 'app-enquiry-add',
  templateUrl: './enquiry-add.component.html',
  styleUrls: ['./enquiry-add.component.css']
})
export class EnquiryAddComponent implements OnInit {
  type: string = "Add"
  id: any = ''

  step = 0;

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }


  enquiryForm = new FormGroup({

    isNewStudent: new FormControl(true, Validators.required),
    studentId: new FormControl(''),
    studentName: new FormControl('', Validators.required),
    email: new FormControl('', Validators.required),
    personalContact: new FormControl('', Validators.required),
    parentsContact: new FormControl(''),
    isOfficialTraining: new FormControl(true, Validators.required),
    trainingType: new FormControl(''),
    isPassout: new FormControl(false, Validators.required),
    college: new FormControl('', Validators.required), // id
    collegeCourseId: new FormControl('', Validators.required),
    semester: new FormControl(''),
    enquiryDate: new FormControl(new Date()), // date
    managementPersonId: new FormControl('', [Validators.required]), //id
    comments: new FormControl(''),
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
    company: new FormControl('', [Validators.required])
  })

  collegeForm = new FormGroup({
    name: new FormControl('', Validators.required)
  })

  get technologies(): FormArray {
    return this.enquiryForm.get('technologies') as FormArray
  }


  lastDisabled: any
  addTechnology(event: any): void {
      // event.target.disabled = true


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


    // console.log("courses",this.technologies.value);

  }

  removeTechnology(index: number) {
    if (index != 0) {
      this.technologies.removeAt(index);
      this.lastDisabled.target.disabled = false
    }
    // console.log("courses",this.technologies.value);
  }

  studentList: any = []
  collegeList: any = []
  collegeCourseList: any = []
  // collegeCourseList: any = []
  courseList: any = []
  employeeList: any = []

  selectFormControl = new FormControl();
  searchTextboxControl = new FormControl();
  selectedValues: any = [];

  filteredOptions: Observable<any[]> | undefined;
  @ViewChild('search') searchTextBox: ElementRef = {} as ElementRef;
  companies:any = [];


  data: any[] = [
    { 'name': '' }
  ]

  _id: any
  enquiryData: any

  constructor(private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private enquiryService: EnquiryService,
    private collegeService: CollegeService,
    private collegeCourseService: CollegeCourseService,
    private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private studentService: StudentService,
    private dialog: MatDialog,
  ) {
  }

  ngOnInit(): void {
    this.getStudents()

    this.collegeList = JSON.parse(sessionStorage.getItem('colleges') ?? '')
    this.collegeCourseList = JSON.parse(sessionStorage.getItem('collegeCourses') ?? '')
    this.courseList = JSON.parse(sessionStorage.getItem('courses') ?? '')
    this.employeeList = JSON.parse(sessionStorage.getItem('employees') ?? '')
    this.route.paramMap.subscribe(param => {
      this.id = param.get('id') ?? ""
      this.type = this.id == "" ? 'Add' : 'Update'
      if (this.type == 'Update') {
        this.getSingleEnquiry()
      }
    })

    let companies = JSON.parse(sessionStorage.getItem('companies')??'');
    if(companies.length==1) {
        this.enquiryForm.patchValue({company: companies[0]})
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
          // console.log(this.studentList);

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
    this.enquiryForm.patchValue({
      studentName: student[0].studentName,
      email: student[0].email,
      personalContact: student[0].personalContact,
      parentsContact: student[0].parentsContact
    })
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
  }

  freeCourse(index: number, event: any) {
    // console.log("index of course", index, "event", event.checked);
    if (event.checked) {
      this.technologies.at(index).patchValue({ fee: 0 })
      this.technologies.at(index).patchValue({ minimumRegistrationFee: 0 })
      this.technologies.at(index).patchValue({ installments: 0 })
    } else {
      // console.log("Course", this.technologies.at(index).value.course);

      let selected = this.courseList.filter((e: any) => {
        return e._id == this.technologies.at(index).value.course
      })

      this.technologies.at(index).patchValue({ fee: selected[0].fee })
      this.technologies.at(index).patchValue({ minimumRegistrationFee: selected[0].minimumRegistrationFee })
      this.technologies.at(index).patchValue({ installments: selected[0].duration.installments })
    }
    // console.log("courses",this.technologies.value);

  }

  checkFreeCourseDisabled(index: number) {
    if (!!this.technologies.at(index).value.course)
      return false
    else return true
  }

  getSingleEnquiry() {
    this.enquiryService.singleEnquiry({ _id: this.id }).subscribe({
      next: (v: any) => {
        var result = v
        if (result.success) {
          this.enquiryData = v.data
          this.enquiryForm.patchValue({
            _id: v.data?._id,
            isNewStudent: v.data?.isNewStudent,
            studentName: v.data?.studentName,
            studentId: v.data?.studentId,
            email: v.data?.email,
            personalContact: v.data?.personalContact,
            parentsContact: v.data?.parentsContact,
            isOfficialTraining: v.data?.isOfficialTraining,
            trainingType: v.data?.trainingType,
            isPassout: v.data?.isPassout,
            college: v.data?.college._id,
            collegeCourseId: v.data?.collegeCourseId._id,
            semester: v.data?.semester,
            managementPersonId: v.data?.managementPersonId._id,
            enquiryDate: v.data?.enquiryDate,
            comments: v.data?.comments,
            technologies: v.data?.technologies,
            company: v.data?.company,
          })
          let techarray = v.data?.technologies
          this.technologies.clear()
          for (let i in techarray) {
            // console.log("i",i);
            const technology = this.formBuilder.group({
              course: new FormControl(techarray[i].course._id, [Validators.required]),
              enquiryTakenBy: new FormControl(techarray[i].enquiryTakenBy._id, [Validators.required]),
              duration: new FormControl(techarray[i].duration, [Validators.required]),
              installments: new FormControl(techarray[i].installments, [Validators.required]),
              fee: new FormControl(techarray[i].fee, [Validators.required]),
              discount: new FormControl(techarray[i].discount, [Validators.required]),
              minimumRegistrationFee: new FormControl(techarray[i].minimumRegistrationFee, [Validators.required])
            })
            this.technologies.push(technology);

            // this.enquiryForm.controls['technologies'].at(parseInt(i)).patchValue({
            //   course:techarray[i].course._id,
            //   enquiryTakenBy:techarray[i].enquiryTakenBy._id,
            //   duration:techarray[i].duration,
            //   installments:techarray[i].installments,
            //   fee:techarray[i].fee,
            //   minimumRegistrationFee:techarray[i].minimumRegistrationFee
            // })
          }

        }
        else {
          this.toastr.error(v.message, 'Error')
        }
      },
      error: (e: any) => {
        this.spinner.hide()
        this.toastr.error(e.error.message)
      },
      complete: () => { this.spinner.hide() }
    })
  }

  submit() {
    this.spinner.show()
    if (this.type == 'Add') {
      this.enquiryService.addEnquiry(this.enquiryForm.value).subscribe({
        next: (v: any) => {
          if (v.success) {
            this.toastr.success(v.message, 'Success')
            this.router.navigate(['/admin/enquiry/view', v?.data?._id])
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
      this.enquiryService.updateEnquiry(this.enquiryForm.value).subscribe({
        next: (v: any) => {
          if (v.success) {
            this.toastr.success(v.message, 'Success')
            this.router.navigate(['/admin/enquiry/view', this.enquiryForm.value._id])

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

  ifCheck(index: number) {
    if (this.technologies.at(index).value.fee == 0)
      return true
    else return false
  }

  openDialog(data: any) {
    var type = 'Add'
    this.collegeForm.reset()
    if (data == 'College') {


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
    else {
      const dialogRef = this.dialog.open(CollegeCourseAddComponent, { disableClose: false, autoFocus: true, width: '40%', data: { type: type, form: this.collegeForm } })
      dialogRef.afterClosed().subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.collegeCourseService.getAllCollegeCourse(data).subscribe({
            next: (result: any) => {
              this.spinner.hide()
              if (result.success) {
                this.collegeCourseList = result.data
                sessionStorage.setItem("collegeCourses", JSON.stringify(this.collegeList))
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


  isNewStudentChange(evt:any){
    if(evt.checked){
      this.enquiryForm.patchValue({
        studentId:"",
        studentName:"",
        email:"",
        personalContact:"",
        parentsContact:""
      })
    }
  }

  isPassoutStudentChange(evt:any){
    if(evt.checked){
      this.enquiryForm.patchValue({
        semester:""
      })
    }
  }

  isOfficialTrainingChange(evt:any){
    if(evt.checked){
      this.enquiryForm.patchValue({
        isPassout:false
      })
    }
    else{
      this.enquiryForm.patchValue({
        trainingType:""
      })
    }
  }



}
