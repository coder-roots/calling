import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ADD_COLLEGE, ALL_COLLEGE, BASE_URL, DELETE_COLLEGE, SINGLE_COLLEGE, UPDATE_COLLEGE } from 'src/app/endpoints';

@Injectable({
  providedIn: 'root'
})
export class CollegeService {

  
  constructor(private http: HttpClient) { }

  getAllCollege(data: any) {
    return this.http.post<any>(BASE_URL + ALL_COLLEGE, data)
  }

  singleCollege(data: any) {
    return this.http.post<any>(BASE_URL + SINGLE_COLLEGE, data)
  }

  addCollege(data: any) {
    return this.http.post<any>(BASE_URL + ADD_COLLEGE, data)
  }

  updateCollege(data: any) {
    return this.http.post<any>(BASE_URL + UPDATE_COLLEGE, data)
  }

  deleteCollege(data: any) {
    return this.http.post<any>(BASE_URL + DELETE_COLLEGE, data)
  }
}
