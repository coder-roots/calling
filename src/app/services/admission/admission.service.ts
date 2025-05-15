import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ADD_ADMISSION, ALL_ADMISSION, BASE_URL, CONFIRM_ADMISSION, DELETE_ADMISSION, SINGLE_ADMISSION, UPDATE_ADMISSION, CHANGE_COURSE } from 'src/app/endpoints';
import { DROP_ADMISSION, DROP_ADMISSION_LIST, UPDATE_ADMISSION_DETAILS } from '../../endpoints';

@Injectable({
  providedIn: 'root'
})
export class AdmissionService {

  constructor(private http: HttpClient) { }

  getAllAdmission(data: any) {
    return this.http.post<any>(BASE_URL + ALL_ADMISSION, data)
  }

  singleAdmission(data: any) {
    return this.http.post<any>(BASE_URL + SINGLE_ADMISSION, data)
  }

  addAdmission(data: any) {
    return this.http.post<any>(BASE_URL + ADD_ADMISSION, data)
  }

  confirmAdmission(data: any) {
    return this.http.post<any>(BASE_URL + CONFIRM_ADMISSION, data)
  }



  updateAdmission(data: any) {
    return this.http.post<any>(BASE_URL + UPDATE_ADMISSION, data)
  }


  updateAdmissionDetails(data: any) {
    return this.http.post<any>(BASE_URL + UPDATE_ADMISSION_DETAILS, data)
  }



  deleteAdmission(data: any) {
    return this.http.post<any>(BASE_URL + DELETE_ADMISSION, data)
  }

  changeCourse(data: any) {
    return this.http.post<any>(BASE_URL + CHANGE_COURSE, data)
  }

  dropAdmission(data:any) {
    return this.http.post<any>(BASE_URL + DROP_ADMISSION,data);
  }

  dropAdmissionList(data:any) {
    return this.http.post(BASE_URL + DROP_ADMISSION_LIST, data)
}


}
