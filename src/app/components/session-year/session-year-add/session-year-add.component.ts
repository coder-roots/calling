import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SessionYearService } from 'src/app/services/sessionYear/session-year.service';

@Component({
  selector: 'app-session-year-add',
  templateUrl: './session-year-add.component.html',
  styleUrls: ['./session-year-add.component.css']
})
export class SessionYearAddComponent implements OnInit {

  type: string = ""

  sessionYearForm:any
  constructor(@Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<SessionYearAddComponent>,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private sessionYearService: SessionYearService
    ) {

    this.type = this.data.type
    this.sessionYearForm = this.data.form
    
  }

  ngOnInit(): void {
  }


  submit() {
    this.spinner.show()
    if (this.type == 'Add') {
      // console.log(this.sessionYearForm.value);
      this.sessionYearService.addSessionYear(this.sessionYearForm.value).subscribe({
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
      this.sessionYearService.updateSessionYear(this.sessionYearForm.value).subscribe({
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
