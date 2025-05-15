import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CollegeCourseService } from 'src/app/services/collegeCourse/college-course.service';

@Component({
  selector: 'app-college-course-add',
  templateUrl: './college-course-add.component.html',
  styleUrls: ['./college-course-add.component.css']
})
export class CollegeCourseAddComponent implements OnInit {

  type: string = ""

  collegeCourseForm:any
  constructor(@Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<CollegeCourseAddComponent>,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private collegeCourseService: CollegeCourseService) {

    this.type = this.data.type
    this.collegeCourseForm = this.data.form
    
  }

  ngOnInit(): void {
  }

  submit() {
    this.spinner.show()
    if (this.type == 'Add') {
      console.log(this.collegeCourseForm.value);
      this.collegeCourseService.addCollegeCourse(this.collegeCourseForm.value).subscribe({
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
    else {
      this.collegeCourseService.updateCollegeCourse(this.collegeCourseForm.value).subscribe({
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
  }


}
