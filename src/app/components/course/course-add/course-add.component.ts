import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { CourseService } from 'src/app/services/course/course.service';
import { DurationService } from 'src/app/services/duration/duration.service';
@Component({
  selector: 'app-course-add',
  templateUrl: './course-add.component.html',
  styleUrls: ['./course-add.component.css']
})
export class CourseAddComponent implements OnInit {

  fileName:any = ''
  type: string = "Add"
  id: any = ''

  courseForm = new FormGroup({
    name: new FormControl('', Validators.required),
    duration: new FormControl('', [Validators.required]),
    fee: new FormControl("", [Validators.required]),
    minimumRegistrationFee: new FormControl('',[Validators.required]),
    courseType: new FormControl('', [Validators.required]),
    course_image: new FormControl(null),
    detail: new FormControl(''),
    _id: new FormControl(''),
  })

  durationList: any = []

  selectFormControl = new FormControl();
  searchTextboxControl = new FormControl();
  selectedValues: any = [];

  filteredOptions: Observable<any[]> | undefined;
  @ViewChild('search') searchTextBox: ElementRef = {} as ElementRef;


  data: any[] = [
    { 'name': '' }
  ]

  _id: any
  courseData: any

  constructor(private spinner: NgxSpinnerService,
    private toastr: ToastrService, 
    private courseService: CourseService, 
    private durationService: DurationService, 
    private router: Router, 
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.getDurations()
    this.route.paramMap.subscribe(param => {
      this.id = param.get('id') ?? ""
      this.type = this.id == "" ? 'Add' : 'Update'
      if (this.type == 'Update') {
        this.getSingleCourse()
      }
    })
  }

  getDurations(){
    this.spinner.show()
    this.durationService.getAllDuration(null).subscribe({
      next: (result) => {
        this.spinner.hide()
        if (result.success) {
          this.durationList = result.data
          // console.log(this.durationList);
          
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

  uploadImage(event:any){
    // console.log("event",event)
    this.courseForm.patchValue({"course_image":event.target.files[0]})
    // console.log(this.courseForm.value.course_image);
    this.fileName = event.target.files[0].name
    
  }

  

  getSingleCourse() {
    this.courseService.singleCourse({ _id: this.id }).subscribe({
      next: (v: any) => {
        var result = v
        if (result.success) {
          this.courseData = v.data
          this.courseForm.patchValue({
            _id: v.data?._id,
            name: v.data?.name,
            duration: v.data?.duration?._id,
            fee: v.data?.fee,
            minimumRegistrationFee: v.data?.minimumRegistrationFee,
            courseType: v.data?.courseType.toString(),
            detail: v.data?.detail
          })
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

  submit() {
    this.spinner.show()
    let apiData = new FormData()
    apiData.append("name", this.courseForm.value.name ?? '')
    apiData.append("courseType", this.courseForm.value.courseType ?? '')
    apiData.append("duration", this.courseForm.value.duration ?? '')
    apiData.append("fee", this.courseForm.value.fee ?? '')
    apiData.append("minimumRegistrationFee", this.courseForm.value.minimumRegistrationFee ?? '')
    apiData.append("detail", this.courseForm.value.detail ?? '')

    if(this.courseForm.value.course_image != null)
      apiData.append("course_image", this.courseForm.value.course_image ?? '')
    if (this.type == 'Add') {
      if(this.courseForm.value.course_image != null){
        this.courseService.addCourse(apiData).subscribe({
          next: (v: any) => {
            if (v.success) {
              this.toastr.success(v.message, 'Success')
              this.router.navigateByUrl('/admin/courses')
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
      else{
        this.spinner.hide()
        this.toastr.error("Course Image is Required",)
        
      }
    }
    else {
      apiData.append('_id',this.courseForm.value._id ?? '')
      this.courseService.updateCourse(apiData).subscribe({
        next: (v: any) => {
          if (v.success) {
            this.toastr.success(v.message, 'Success')
            this.router.navigateByUrl('/admin/courses')

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

}
