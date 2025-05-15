import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ADD_COURSE, ALL_COURSE, BASE_URL, DELETE_COURSE, SINGLE_COURSE, UPDATE_COURSE } from 'src/app/endpoints';

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  constructor(private http: HttpClient) { }

  getAllCourse(data: any) {
    return this.http.post<any>(BASE_URL + ALL_COURSE, data)
  }

  singleCourse(data: any) {
    return this.http.post<any>(BASE_URL + SINGLE_COURSE, data)
  }

  addCourse(data: any) {
    return this.http.post<any>(BASE_URL + ADD_COURSE, data)
  }

  updateCourse(data: any) {
    return this.http.post<any>(BASE_URL + UPDATE_COURSE, data)
  }

  deleteCourse(data: any) {
    return this.http.post<any>(BASE_URL + DELETE_COURSE, data)
  }
}
