import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ADD_DURATION, ALL_DURATION, BASE_URL, DELETE_DURATION, SINGLE_DURATION, UPDATE_DURATION } from 'src/app/endpoints';

@Injectable({
  providedIn: 'root'
})
export class DurationService {

    
  constructor(private http: HttpClient) { }

  getAllDuration(data: any) {
    return this.http.post<any>(BASE_URL + ALL_DURATION, data)
  }

  singleDuration(data: any) {
    return this.http.post<any>(BASE_URL + SINGLE_DURATION, data)
  }

  addDuration(data: any) {
    return this.http.post<any>(BASE_URL + ADD_DURATION, data)
  }

  updateDuration(data: any) {
    return this.http.post<any>(BASE_URL + UPDATE_DURATION, data)
  }

  deleteDuration(data: any) {
    return this.http.post<any>(BASE_URL + DELETE_DURATION, data)
  }
}
