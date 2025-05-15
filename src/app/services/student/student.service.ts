import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ADD_STUDENT, ALL_STUDENT, BASE_URL, DELETE_STUDENT, SINGLE_STUDENT, UPDATE_STUDENT } from 'src/app/endpoints';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  constructor(private http: HttpClient) { }

  getAllStudent(data: any) {
    return this.http.post<any>(BASE_URL + ALL_STUDENT, data)
  }

  singleStudent(data: any) {
    return this.http.post<any>(BASE_URL + SINGLE_STUDENT, data)
  }

  addStudent(data: any) {
    return this.http.post<any>(BASE_URL + ADD_STUDENT, data)
  }

  updateStudent(data: any) {
    return this.http.post<any>(BASE_URL + UPDATE_STUDENT, data)
  }

  deleteStudent(data: any) {
    return this.http.post<any>(BASE_URL + DELETE_STUDENT, data)
  }
}
