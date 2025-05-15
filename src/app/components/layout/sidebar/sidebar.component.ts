import { Component, HostListener, OnInit } from '@angular/core';
import { NgxSpinner, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SESSION_YEAR } from 'src/app/endpoints';
import { UserDataService } from 'src/app/services/userData/user-data.service';
import { UserServiceService } from 'src/app/services/userService/user-service.service';
import { SessionYearService } from 'src/app/services/sessionYear/session-year.service';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  userData:any
  sessionYearList:any = []
  sessionYear:any = this._userData.getSession()
  constructor(
    private sessionYearService: SessionYearService,
    private _userData: UserDataService, 
    private spinner: NgxSpinnerService, 
    private toastr: ToastrService, 
    private _userService: UserServiceService) { }

  ngOnInit(): void {
    this.userData = this._userData.getData()
    this.sessionYear = this._userData.getSession()
    // console.log("session", this.sessionYear);
    
    this.sessionYearList = JSON.parse(sessionStorage.getItem('sessions') ?? '')
  }

  

  setSessionYear(event:any){
    // console.log(JSON.stringify(this.sessionYear!))
    sessionStorage.setItem(SESSION_YEAR, this.sessionYear)
    window.location.reload()
  }
}
 