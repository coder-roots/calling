import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserDataService } from 'src/app/services/userData/user-data.service';
import { UserServiceService } from 'src/app/services/userService/user-service.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

  email: any = ''
  requestOtp = true
  checkOtp = false
  changePassword = false
  userId:any = ''

  constructor(private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private _userService: UserServiceService,
    private router: Router,
    private _userData: UserDataService,) { }


    requestOtpForm = new FormGroup({
      email: new FormControl('', [Validators.required]),
    });
  
    changePasswordForm = new FormGroup({
      email: new FormControl(''),
      password: new FormControl('', [Validators.required])
    });
    
  ngOnInit(): void {
    if (this._userData.isLogin()) {
      this.router.navigateByUrl('/admin/home')
      return
    }
  }

  requestOtpSubmit() {
    this.spinner.show()
    this.email = this.requestOtpForm.get('email')?.value
    //console.log(data,this.requestOtpForm.get('email')?.value)
    this._userService.requestOtp(this.requestOtpForm.value).subscribe({
      next: (v) => {
        var result = v
        if (result.success) {
          this.checkOtp = true
          this.requestOtp = false
          this.changePassword = false
          this.toastr.success(result.message, 'Success')
        } else {
          this.toastr.error(result.message, 'Error')
        }
      },
      error: (e) => {
        this.spinner.hide()
        this.toastr.error(e.error.message)
      },
      complete: () => { this.spinner.hide() }
    })
  }

  onOtpChange(event: any) {
    if (event.length == 4) {
      this.spinner.show()
      this._userService.verifyOtp({ email: this.email, otp: event }).subscribe({
        next: (v) => {
          this.spinner.hide()
          var result = v
          if (result.success) {
            this.userId = result.data._id
            this.checkOtp = false
            this.requestOtp = false
            this.changePassword = true
            this.toastr.success(result.message, 'Success')
          } else {
            this.toastr.error(result.message, 'Error')
          }
        }, error: (e) => {
          this.spinner.hide()
          this.toastr.error(e.error.message)
        },
        complete: () => { this.spinner.hide() }
      })
    }
  }

  changePasswordSubmit() {
    this.spinner.show()
    // this.changePasswordForm.patchValue({ userId: this.userId })
    this._userService.changeForgotPassword({ userId: this.userId, password: this.changePasswordForm.value.password }).subscribe({
      next: (v) => {
        this.spinner.hide()
        var result = v
        if (result.success) {
          this.toastr.success(result.message, 'Success')
          this.router.navigateByUrl('/')
        }
      }, error: (e) => {
        this.spinner.hide()
        this.toastr.error(e.error.message)
      },
      complete: () => { this.spinner.hide() }
    })
  }
}
