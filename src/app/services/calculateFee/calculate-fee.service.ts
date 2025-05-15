import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BASE_URL, CALCULATE_FEE, FETCH_ADMISSION_CALCULATED_FEE, FETCH_ENQUIRY_CALCULATED_FEE } from 'src/app/endpoints';

@Injectable({
  providedIn: 'root'
})
export class CalculateFeeService {

  constructor(private http: HttpClient) { }

  calculateFee(data:any){
    return this.http.post<any>(BASE_URL + CALCULATE_FEE, data)
  }

  fetchCalculatedFee(data:any){
    return this.http.post<any>(BASE_URL + FETCH_ENQUIRY_CALCULATED_FEE, data)
  }

  fetchAdmissionCalculatedFee(data:any){
    return this.http.post<any>(BASE_URL + FETCH_ADMISSION_CALCULATED_FEE, data)
  }
  // recalculateFee(data:any){
  //   return this.http.post<any>(BASE_URL + FETCH_CALCULATED_FEE, data)
  // }
}
