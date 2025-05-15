import { Injectable } from '@angular/core';
import { BASE_URL, DAYBOOK, DAYBOOK_SUMMARY, DROP_ENQUIRY_LIST, DROP_LIST, OVERALL_BALANCE, REGISTRATION_DEFAULTER } from '../../endpoints';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ReportService {


  constructor(private http:HttpClient) { }

  getRegistrationDefaulter(data:any) {
    return this.http.post(BASE_URL + REGISTRATION_DEFAULTER,data);
  }

  getDayBook(data:any){
    return this.http.post(BASE_URL+DAYBOOK,data);
  }

  getDayBookSummary(data:any) {
    return this.http.post(BASE_URL+DAYBOOK_SUMMARY,data);
  }

  getOverallBalance(data:any) {
    return this.http.post(BASE_URL+OVERALL_BALANCE,data);
  }

  getDropReport(data:any) {
    return this.http.post(BASE_URL + DROP_LIST,data)
  }

  getEnquiryDropReport(data:any) {
    return this.http.post(BASE_URL + DROP_ENQUIRY_LIST,data);
  }
}
