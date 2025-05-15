import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ADD_COLLEGE_COURSE, ALL_COLLEGE_COURSE, BASE_URL, DELETE_COLLEGE_COURSE, SINGLE_COLLEGE_COURSE, UPDATE_COLLEGE_COURSE } from 'src/app/endpoints';

@Injectable({
  providedIn: 'root'
})
export class CollegeCourseService {

  constructor(private http: HttpClient) { }

  getAllCollegeCourse(data: any) {
    return this.http.post<any>(BASE_URL + ALL_COLLEGE_COURSE, data)
  }

  singleCollegeCourse(data: any) {
    return this.http.post<any>(BASE_URL + SINGLE_COLLEGE_COURSE, data)
  }

  addCollegeCourse(data: any) {
    return this.http.post<any>(BASE_URL + ADD_COLLEGE_COURSE, data)
  }

  updateCollegeCourse(data: any) {
    return this.http.post<any>(BASE_URL + UPDATE_COLLEGE_COURSE, data)
  }

  deleteCollegeCourse(data: any) {
    return this.http.post<any>(BASE_URL + DELETE_COLLEGE_COURSE, data)
  }
}
