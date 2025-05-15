import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CollegeService } from 'src/app/services/college/college.service';
@Component({
  selector: 'app-college-add',
  templateUrl: './college-add.component.html',
  styleUrls: ['./college-add.component.css']
})
export class CollegeAddComponent implements OnInit {

  type: string = ""

  collegeForm:any
  constructor(@Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<CollegeAddComponent>,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private collegeService: CollegeService
    ) {

    this.type = this.data.type
    this.collegeForm = this.data.form
    
  }

  ngOnInit(): void {
  }

  submit() {
    this.spinner.show()
    if (this.type == 'Add') {
      // console.log(this.collegeForm.value);
      this.collegeService.addCollege(this.collegeForm.value).subscribe({
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
      this.collegeService.updateCollege(this.collegeForm.value).subscribe({
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
