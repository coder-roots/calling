import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ADD_USERS, ALL_FINANCIAL_YEAR, ALL_USERS, BASE_URL, CHANGE_FORGOT_PASSWORD, CHANGE_PASSWORD, DELETE_USERS, ENABLE_DISABLE_USERS, LOGIN, LOGOUT, REQUEST_OTP, SINGLE_USERS, UPDATE_USERS, VERIFY_OTP } from 'src/app/endpoints';
import { ServerResponse } from 'src/app/models/ServerResponse';
import { UserModel } from 'src/app/models/UserModel';
import { UserResponse } from 'src/app/models/UserResponse';
import { UserDataService } from '../userData/user-data.service';

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {

  constructor(private http: HttpClient, private _userDataService: UserDataService) { }

  getAllfinancialYear(data: any) {
    return this.http.post<UserModel>(BASE_URL + ALL_FINANCIAL_YEAR, data)
  }
  login(data: any) {
    return this.http.post<UserModel>(BASE_URL + LOGIN, data)
  }

  logout(data: any) {
    return this.http.post<ServerResponse>(BASE_URL + LOGOUT, data)
  }

  requestOtp(data: any) {
    return this.http.post<any>(BASE_URL + REQUEST_OTP, data)
  }

  verifyOtp(data: any) {
    return this.http.post<any>(BASE_URL + VERIFY_OTP, data)
  }

  changeForgotPassword(data: any) {
    return this.http.post<any>(BASE_URL + CHANGE_FORGOT_PASSWORD, data)
  }

  getAllUsers(data: any) {
    return this.http.post<UserResponse>(BASE_URL + ALL_USERS, data)
  }

  singleUser(data: any) {
    return this.http.post<UserResponse>(BASE_URL + SINGLE_USERS, data)
  }

  addUser(data: any) {
    return this.http.post<UserResponse>(BASE_URL + ADD_USERS, data)
  }

  updateUsers(data: any) {
    return this.http.post<UserResponse>(BASE_URL + UPDATE_USERS, data)
  }

  deleteUsers(data: any) {
    return this.http.post<UserResponse>(BASE_URL + DELETE_USERS, data)
  }

  enableDisableUser(data: any) {
    return this.http.post<UserResponse>(BASE_URL + ENABLE_DISABLE_USERS, data)
  }

  changePassword(data: any) {
    return this.http.post<UserResponse>(BASE_URL + CHANGE_PASSWORD, data)
  }

}
