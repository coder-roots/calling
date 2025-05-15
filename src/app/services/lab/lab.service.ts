import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ADD_LAB, ALL_LAB, BASE_URL, DELETE_LAB, SINGLE_LAB, UPDATE_LAB } from 'src/app/endpoints';

@Injectable({
  providedIn: 'root'
})
export class LabService {

  constructor(private http: HttpClient) { }

  getAllLab(data: any) {
    return this.http.post<any>(BASE_URL + ALL_LAB, data)
  }

  singleLab(data: any) {
    return this.http.post<any>(BASE_URL + SINGLE_LAB, data)
  }

  addLab(data: any) {
    return this.http.post<any>(BASE_URL + ADD_LAB, data)
  }

  updateLab(data: any) {
    return this.http.post<any>(BASE_URL + UPDATE_LAB, data)
  }

  deleteLab(data: any) {
    return this.http.post<any>(BASE_URL + DELETE_LAB, data)
  }
}
