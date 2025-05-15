import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ADD_EMPLOYEE, ALL_EMPLOYEE, BASE_URL, DELETE_EMPLOYEE, SINGLE_EMPLOYEE, UPDATE_EMPLOYEE } from 'src/app/endpoints';
import { ADD_EMPLOYEE_MULTIPLE, CHANGE_STATUS_EMPLOYEE } from '../../endpoints';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  constructor(private http: HttpClient) { }

  getAllEmployee(data: any) {
    return this.http.post<any>(BASE_URL + ALL_EMPLOYEE, data)
  }

  singleEmployee(data: any) {
    return this.http.post<any>(BASE_URL + SINGLE_EMPLOYEE, data)
  }

  addEmployee(data: any) {
    return this.http.post<any>(BASE_URL + ADD_EMPLOYEE, data)
  }

  addEmployeeMultiple(data: any) {
    return this.http.post<any>(BASE_URL + ADD_EMPLOYEE_MULTIPLE, data)
  }

  updateEmployee(data: any) {
    return this.http.post<any>(BASE_URL + UPDATE_EMPLOYEE, data)
  }

  deleteEmployee(data: any) {
    return this.http.post<any>(BASE_URL + DELETE_EMPLOYEE, data)
  }

  changeStatusEmployee(data: any) {
    return this.http.post<any>(BASE_URL + CHANGE_STATUS_EMPLOYEE, data)
  }
}
