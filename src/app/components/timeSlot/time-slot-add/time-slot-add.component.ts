import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { TimeSlotService } from 'src/app/services/timeSlot/time-slot.service';
@Component({
  selector: 'app-time-slot-add',
  templateUrl: './time-slot-add.component.html',
  styleUrls: ['./time-slot-add.component.css']
})
export class TimeSlotAddComponent implements OnInit {

  type: string = ""

  timeSlotForm:any
  constructor(@Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<TimeSlotAddComponent>,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private timeSlotService: TimeSlotService
    ) {

    this.type = this.data.type
    this.timeSlotForm = this.data.form
    
  }

  ngOnInit(): void {
  }

  submit() {
    this.spinner.show()
    if (this.type == 'Add') {
      console.log(this.timeSlotForm.value);
      this.timeSlotService.addTimeSlot(this.timeSlotForm.value).subscribe({
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
      this.timeSlotService.updateTimeSlot(this.timeSlotForm.value).subscribe({
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
