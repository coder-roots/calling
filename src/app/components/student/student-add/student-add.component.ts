import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { StudentService } from 'src/app/services/student/student.service';

@Component({
  selector: 'app-student-add',
  templateUrl: './student-add.component.html',
  styleUrls: ['./student-add.component.css']
})
export class StudentAddComponent implements OnInit {

  type: string = ""

  studentForm:any
  constructor(@Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<StudentAddComponent>,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private studentService: StudentService) {

    this.type = this.data.type
    this.studentForm = this.data.form
    
  }
  companies:any = [];

  ngOnInit(): void {
    let companies = JSON.parse(sessionStorage.getItem('companies')??'');
    if(companies.length==1) {
        this.studentForm.patchValue({company: companies[0]})
    }
    this.companies = companies;
  }

  submit() {
    this.spinner.show()
    if (this.type == 'Add') {
      console.log(this.studentForm.value);
      this.studentService.addStudent(this.studentForm.value).subscribe({
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
      this.studentService.updateStudent(this.studentForm.value).subscribe({
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
