import { Injectable } from '@angular/core';
import { ADD_SESSIONYEAR, ALL_SESSIONYEAR, BASE_URL, DELETE_SESSIONYEAR, SINGLE_SESSIONYEAR, UPDATE_SESSIONYEAR, UPDATE_ACTIVE_STATUS } from 'src/app/endpoints';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SessionYearService {

  constructor(private http: HttpClient) { }

  getAllSessionYear(data: any) {
    return this.http.post<any>(BASE_URL + ALL_SESSIONYEAR, data)
  }

  singleSessionYear(data: any) {
    return this.http.post<any>(BASE_URL + SINGLE_SESSIONYEAR, data)
  }

  addSessionYear(data: any) {
    return this.http.post<any>(BASE_URL + ADD_SESSIONYEAR, data)
  }

  updateSessionYear(data: any) {
    return this.http.post<any>(BASE_URL + UPDATE_SESSIONYEAR, data)
  }

  updateActiveStatus(data: any) {
    return this.http.post<any>(BASE_URL + UPDATE_ACTIVE_STATUS, data)
  }

  deleteSessionYear(data: any) {
    return this.http.post<any>(BASE_URL + DELETE_SESSIONYEAR, data)
  }
}
