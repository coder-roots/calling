import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ADD_CLIENT, ALL_CLIENT, BASE_URL, DELETE_CLIENT, SINGLE_CLIENT, UPDATE_CLIENT } from 'src/app/endpoints';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(private http: HttpClient) { }

  getAllClient(data: any) {
    return this.http.post<any>(BASE_URL + ALL_CLIENT, data)
  }

  singleClient(data: any) {
    return this.http.post<any>(BASE_URL + SINGLE_CLIENT, data)
  }

  addClient(data: any) {
    return this.http.post<any>(BASE_URL + ADD_CLIENT, data)
  }

  updateClient(data: any) {
    return this.http.post<any>(BASE_URL + UPDATE_CLIENT, data)
  }

  deleteClient(data: any) {
    return this.http.post<any>(BASE_URL + DELETE_CLIENT, data)
  }
}
