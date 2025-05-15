import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserDataService } from 'src/app/services/userData/user-data.service';
import { UserServiceService } from 'src/app/services/userService/user-service.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { SessionYearService } from 'src/app/services/sessionYear/session-year.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  sessionYearList: any = [];
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    sessionYear: new FormControl(''),
    // isAdmin: new FormControl(true),
    // deviceId: new FormControl(''),
    // deviceType: new FormControl(1)
  });

  constructor(
    private _userService: UserServiceService,
    private _userDataService: UserDataService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private _userData: UserDataService,
    private sessionYearService: SessionYearService
  ) {}

  ngOnInit(): void {
    if (this._userData.isLogin()) {
      this.router.navigateByUrl('/admin/home');
      return;
    } else {
      this.getSessionYear();
    }
  }

  submit() {
    this.spinner.show();
    this._userService.login(this.loginForm.value).subscribe({
      next: (v: any) => {
        if (v.success) {
          this._userDataService.setData(v);
          this._userDataService.setSession(this.loginForm.value.sessionYear);
          this.toastr.success(v.message, 'Success');
          if(v.data.userType==1) {
            sessionStorage.setItem('companies',JSON.stringify(['Jain Student Provider','VSS Immi','Manu Sharma']))
          } else {
            sessionStorage.setItem('companies',JSON.stringify(v?.data?.assignedCompanies))
          }
          this.router.navigateByUrl('/admin/home');
        } else {
          this.toastr.error(v.message, 'Error');
        }
      },
      error: (e: any) => {
        this.spinner.hide();
        this.toastr.error(e.error.message, 'Error');
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  getSessionYear() {
    let current: any[] = [];
    this.spinner.show();
    this.sessionYearService.getAllSessionYear({}).subscribe({
      next: (v: any) => {
        if (v.success) {
          // console.log("v.data", v.data)
          this.sessionYearList = v.data;
          this._userData.setSessionList(this.sessionYearList);
          // console.log("list", this.sessionYearList);

          if (this.sessionYearList.length > 0)
            current = this.sessionYearList.filter((x: any) => {
              return x.isActive === true;
            });
          this.loginForm.patchValue({ sessionYear: current[0]?._id });
        } else {
          this.toastr.error(v.message, 'Error');
        }
      },
      error: (e: any) => {
        this.spinner.hide();
        this.toastr.error(e.error.message, 'Error');
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  try(event: any) {
    console.log(event);
  }
}
