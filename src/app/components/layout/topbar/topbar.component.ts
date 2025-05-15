import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { JsServiceService } from '../../../services/jsService/js-service.service';
import { UserDataService } from '../../../services/userData/user-data.service';
import { UserServiceService } from '../../../services/userService/user-service.service';
import { ChangePasswordComponent } from '../../users/change-password/change-password.component';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit {

  userData:any
  constructor(private js: JsServiceService, private _userData: UserDataService, private _userService: UserServiceService, private spinner: NgxSpinnerService, private toastr: ToastrService, private router: Router, private dialog: MatDialog) { }


  ngOnInit(): void {
    this.js.callJsClass()
    this.userData = this._userData.getData()
  }

  logout(){
    this._userData.clearData()
          this.toastr.success("Logout Successfull", 'Success')
          this.router.navigateByUrl('/login')
    // this.spinner.show()
    // this._userService.logout({ deviceId: '', deviceType: 1}).subscribe({
    //   next: (v:any) =>{
    //     if (v.success){
    //       this._userData.clearData()
    //       this.toastr.success(v.message, 'Success')
    //       this.router.navigateByUrl('/login')
    //     }
    //     else{
    //       this.toastr.error(v.message, 'Error')
    //     }
    //   },
    //   error: (e:any) =>{
    //     this.spinner.hide()
    //     this.toastr.error(e.error.message)
    //   },
    //   complete: () => { this.spinner.hide() }
    // })
  }

  data = {
    _id: '', oldPassword: '', newPassword: ''
  }
  openChangeDialog(){
    this.data = {
      _id: '', oldPassword: '', newPassword: ''
    }
    var sessionData = this._userData.getData()
    this.data._id = sessionData?.data?._id ?? ""
    let dialogRef = this.dialog.open(ChangePasswordComponent, { width: '80%', data: this.data })
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'true') {
      }
    })
  }

  sync(){
    this._userData.getList()
    setTimeout(()=>{
      window.location.reload()
    },1000)
    
  }

}
