import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { LabService } from 'src/app/services/lab/lab.service';
@Component({
  selector: 'app-lab-add',
  templateUrl: './lab-add.component.html',
  styleUrls: ['./lab-add.component.css']
})
export class LabAddComponent implements OnInit {

  type: string = ""

  labForm:any
  constructor(@Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<LabAddComponent>,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private labService: LabService
    ) {

    this.type = this.data.type
    this.labForm = this.data.form
    
  }

  ngOnInit(): void {
  }

  submit() {
    this.spinner.show()
    if (this.type == 'Add') {
      console.log(this.labForm.value);
      this.labService.addLab(this.labForm.value).subscribe({
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
      this.labService.updateLab(this.labForm.value).subscribe({
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
