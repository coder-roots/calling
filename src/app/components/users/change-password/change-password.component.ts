import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserServiceService } from '../../../services/userService/user-service.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {

  confirmPassword:string = ''
  passwordMatched:boolean = false
  error:boolean = false

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private spinner: NgxSpinnerService, private toastr: ToastrService, private _userService: UserServiceService, private dialogRef: MatDialogRef<ChangePasswordComponent>) { }

  ngOnInit(): void {
  }

  matchPassword(event:any){
    this.error = false
    if(this.data.newPassword === event.target.value){
      this.passwordMatched = true
    }else{
      this.error = true
      this.passwordMatched = false
    }
    //console.log(this.error)
  }

  save(){
    this.spinner.show()
        this._userService.changePassword(this.data).subscribe({
          next: (v) => {
            var result = v
            if (result.success) {
              this.toastr.success(result.message, 'Success')
              this.dialogRef.close("true")
            } else {
              this.toastr.error(result.message, 'Error')
            }
          },
          error: (e) => { this.spinner.hide(); this.toastr.error(e.error.message, 'Error') },
          complete: () => { this.spinner.hide(); },
        })
  }

}
