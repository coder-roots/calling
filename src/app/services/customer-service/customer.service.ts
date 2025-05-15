import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ADD_CUSTOMERS, ALL_CUSTOMERS, ALL_CUSTOMERS_MINI, BASE_URL, DELETE_CUSTOMERS, ENABLE_DISABLE_USERS, SINGLE_CUSTOMERS, UPDATE_CUSTOMERS } from 'src/app/endpoints';
import { CustomerResponse } from 'src/app/models/CustomerResponse';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  constructor(private http: HttpClient) { }

  getAllCustomer(data:any){
    return this.http.post<CustomerResponse>(BASE_URL + ALL_CUSTOMERS, data)
  }

  singleCustomer(data:any){
    return this.http.post<CustomerResponse>(BASE_URL + SINGLE_CUSTOMERS, data)
  }

  addCustomer(data:any){
    return this.http.post<CustomerResponse>(BASE_URL + ADD_CUSTOMERS, data)
  }

  updateCustomer(data:any){
    return this.http.post<CustomerResponse>(BASE_URL + UPDATE_CUSTOMERS, data)
  }

  deleteCustomer(data:any){
    return this.http.post<CustomerResponse>(BASE_URL + DELETE_CUSTOMERS, data)
  }

  enableDisableCustomer(data:any){
    return this.http.post<CustomerResponse>(BASE_URL + ENABLE_DISABLE_USERS, data)
  }

  getAllMiniCustomer(data:any){
    return this.http.post<CustomerResponse>(BASE_URL + ALL_CUSTOMERS_MINI, data)
  }
}
