import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ADD_FEE_RECEIPT, ADD_FEE_RECEIPT_OF_DIRECT_COLLECTION, ALL_FEE_RECEIPT, BASE_URL, DELETE_FEE_RECEIPT, SINGLE_FEE_RECEIPT, UPDATE_FEE_RECEIPT } from 'src/app/endpoints';
import { ALL_FEE_STRUCTURE } from '../../endpoints';

@Injectable({
  providedIn: 'root'
})
export class FeeService {

  constructor(private http: HttpClient) { }

  getAllFeeStructure(data: any) {
    return this.http.post<any>(BASE_URL + ALL_FEE_STRUCTURE, data)
  }
  
  getAllFeeReceipt(data: any) {
    return this.http.post<any>(BASE_URL + ALL_FEE_RECEIPT, data)
  }

  singleFeeReceipt(data: any) {
    return this.http.post<any>(BASE_URL + SINGLE_FEE_RECEIPT, data)
  }

  addFeeReceipt(data: any) {
    return this.http.post<any>(BASE_URL + ADD_FEE_RECEIPT, data)
  }

  addFeeReceiptOfDirectCollection(data: any) {
    return this.http.post<any>(BASE_URL + ADD_FEE_RECEIPT_OF_DIRECT_COLLECTION, data)
  }

  updateFeeReceipt(data: any) {
    return this.http.post<any>(BASE_URL + UPDATE_FEE_RECEIPT, data)
  }

  deleteFeeReceipt(data: any) {
    return this.http.post<any>(BASE_URL + DELETE_FEE_RECEIPT, data)
  }
}
