import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ADD_STORE_ITEM, ALL_STORE_ITEM, BASE_URL, DELETE_STORE_ITEM, SINGLE_STORE_ITEM, UPDATE_STORE_ITEM } from '../../endpoints';

@Injectable({
  providedIn: 'root'
})
export class StoreItemService {

  constructor(private http: HttpClient) { }

  getAllStoreItem(data: any) {
    return this.http.post<any>(BASE_URL + ALL_STORE_ITEM, data)
  }

  singleStoreItem(data: any) {
    return this.http.post<any>(BASE_URL + SINGLE_STORE_ITEM, data)
  }

  addStoreItem(data: any) {
    return this.http.post<any>(BASE_URL + ADD_STORE_ITEM, data)
  }

  updateStoreItem(data: any) {
    return this.http.post<any>(BASE_URL + UPDATE_STORE_ITEM, data)
  }

  deleteStoreItem(data: any) {
    return this.http.post<any>(BASE_URL + DELETE_STORE_ITEM, data)
  }
}
