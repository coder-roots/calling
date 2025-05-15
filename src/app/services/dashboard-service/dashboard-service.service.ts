import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BASE_URL, DASHBOARD, LIST } from 'src/app/endpoints';
import { DashboardResponse } from 'src/app/models/DashboardResponse';

@Injectable({
  providedIn: 'root'
})
export class DashboardServiceService {

  constructor(private http: HttpClient) { }
  getDashboard() {
    return this.http.get<any>(BASE_URL + DASHBOARD)
  }
  getList() {
    return this.http.get<any>(BASE_URL + LIST)
  }
}
