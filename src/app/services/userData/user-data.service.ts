import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SESSION_YEAR, IS_LOGIN, USER_DATA } from 'src/app/endpoints';
import { UserModel } from 'src/app/models/UserModel';
import { DashboardServiceService } from '../dashboard-service/dashboard-service.service';
@Injectable({
  providedIn: 'root'
})
export class UserDataService {

  constructor(
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private dashboardService: DashboardServiceService
  ) { }

  setData(data: UserModel) {
    const jsonData = JSON.stringify(data)
    sessionStorage.setItem(USER_DATA, jsonData)
    sessionStorage.setItem(IS_LOGIN, "true")
  }
  setSession(sessionYear:any){
    sessionStorage.setItem(SESSION_YEAR, sessionYear)
  }
  setSessionList(sessionList:any){
    sessionStorage.setItem("sessions", JSON.stringify(sessionList))
  }
  getSession(){
    return sessionStorage.getItem(SESSION_YEAR)
  }

  getList() {
    var data: any = {}
    this.spinner.show()
    this.dashboardService.getList().subscribe({
      next: (result:any) => {
        this.spinner.hide()
        if (result.success) {
          data = result.list
          sessionStorage.setItem("labs", JSON.stringify(data?.labs))
          sessionStorage.setItem("courses", JSON.stringify(data?.courses))
          sessionStorage.setItem("durations", JSON.stringify(data?.durations))
          sessionStorage.setItem("colleges", JSON.stringify(data?.colleges))
          sessionStorage.setItem("collegeCourses", JSON.stringify(data?.collegeCourses))
          sessionStorage.setItem("timeSlots", JSON.stringify(data?.timeSlots))
          sessionStorage.setItem("employees", JSON.stringify(data?.employees))
          sessionStorage.setItem("sessions", JSON.stringify(data?.sessions))
          // console.log(2);
        } else {
          this.toastr.error(result.message, 'Error')
        }
      },
      error: (e) => {
        this.spinner.hide()
        this.toastr.error(e)
      },
      complete: () => {
        this.spinner.hide()
      }
    })
  }

  setList(listData: any) {
    sessionStorage.setItem("labs", JSON.stringify(listData?.labs))
    sessionStorage.setItem("courses", JSON.stringify(listData?.courses))
    sessionStorage.setItem("durations", JSON.stringify(listData?.durations))
    sessionStorage.setItem("colleges", JSON.stringify(listData?.colleges))
    sessionStorage.setItem("collegeCourses", JSON.stringify(listData?.collegeCourses))
    sessionStorage.setItem("timeSlots", JSON.stringify(listData?.timeSlots))
    sessionStorage.setItem("employees", JSON.stringify(listData?.employees))
  }

  getData() {
    const obj: UserModel = JSON.parse(sessionStorage.getItem(USER_DATA) ?? "")
    return obj
  }

  getDataWithKey(key: string) {
    return sessionStorage.getItem(key)
  }

  isLogin() {
    return sessionStorage.getItem(IS_LOGIN) === "true"
  }

  clearData() {
    sessionStorage.clear()
  }

  /**
 * Roles and permission data
 */

  
  public getPermissions() {
    const obj: UserModel = JSON.parse(sessionStorage.getItem(USER_DATA) ?? "{}")
    return obj?.data?.role?.permissions
  }

  public roleMatch(allowedRoles: any): boolean {
    let isMatch = false;
    const userRoles = this.getPermissions()

    allowedRoles.forEach((element: any) => {
      if (userRoles?.includes(element)) {
        isMatch = true;
        return;
      }
    });
    return isMatch;
  }


}
