import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DurationService } from 'src/app/services/duration/duration.service';
@Component({
  selector: 'app-duration-add',
  templateUrl: './duration-add.component.html',
  styleUrls: ['./duration-add.component.css']
})
export class DurationAddComponent implements OnInit {

  type: string = "" 

  durationForm:any
  constructor(@Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<DurationAddComponent>,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private durationService: DurationService
    ) {

    this.type = this.data.type
    this.durationForm = this.data.form
    
  }

  ngOnInit(): void {
  }


  submit() {
    this.spinner.show()
    if (this.type == 'Add') {
      // console.log(this.durationForm.value);
      this.durationService.addDuration(this.durationForm.value).subscribe({
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
      this.durationService.updateDuration(this.durationForm.value).subscribe({
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
