import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ADD_ENQUIRY, ALL_ENQUIRY, BASE_URL, DELETE_ENQUIRY, SINGLE_ENQUIRY, UPDATE_ENQUIRY } from 'src/app/endpoints';
import { ADD_ENQUIRY_MULTIPLE, DROP_ENQUIRY } from '../../endpoints';

@Injectable({
  providedIn: 'root'
})
export class EnquiryService {

  constructor(private http: HttpClient) { }

  getAllEnquiry(data: any) {
    return this.http.post<any>(BASE_URL + ALL_ENQUIRY, data)
  }

  singleEnquiry(data: any) {
    return this.http.post<any>(BASE_URL + SINGLE_ENQUIRY, data)
  }

  addEnquiry(data: any) {
    return this.http.post<any>(BASE_URL + ADD_ENQUIRY, data)
  }
  addEnquiryMultiple(data: any) {
    return this.http.post<any>(BASE_URL + ADD_ENQUIRY_MULTIPLE, data)
  }

  updateEnquiry(data: any) {
    return this.http.post<any>(BASE_URL + UPDATE_ENQUIRY, data)
  }

  deleteEnquiry(data: any) {
    return this.http.post<any>(BASE_URL + DELETE_ENQUIRY, data)
  }

  dropEnquiry(data:any) {
    return this.http.post<any>( BASE_URL + DROP_ENQUIRY,data);
  }

}
