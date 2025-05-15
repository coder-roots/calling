import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ADD_CALL, ALL_CALL, BASE_URL, DELETE_CALL, SINGLE_CALL, UPDATE_CALL } from 'src/app/endpoints';
import { ADD_CALL_SHEET, ALL_CALL_SHEET, ALL_CALL_SHEET_DETAIL, DELETE_CALL_SHEET, SINGLE_CALL_SHEET, UPDATE_CALL_SHEET, ADD_CALL_SHEET_DETAIL } from '../../endpoints';

@Injectable({
  providedIn: 'root'
})
export class CallService {

  constructor(private http: HttpClient) { }

  getAllCall(data: any) {
    return this.http.post<any>(BASE_URL + ALL_CALL, data)
  }

  singleCall(data: any) {
    return this.http.post<any>(BASE_URL + SINGLE_CALL, data)
  }

  addCall(data: any) {
    return this.http.post<any>(BASE_URL + ADD_CALL, data)
  }

  updateCall(data: any) {
    return this.http.post<any>(BASE_URL + UPDATE_CALL, data)
  }

  deleteCall(data: any) {
    return this.http.post<any>(BASE_URL + DELETE_CALL, data)
  }

  getAllCallSheet(data: any) {
    return this.http.post<any>(BASE_URL + ALL_CALL_SHEET, data)
  }

  singleCallSheet(data: any) {
    return this.http.post<any>(BASE_URL + SINGLE_CALL_SHEET, data)
  }

  addCallSheet(data: any) {
    return this.http.post<any>(BASE_URL + ADD_CALL_SHEET, data)
  }

  updateCallSheet(data: any) {
    return this.http.post<any>(BASE_URL + UPDATE_CALL_SHEET, data)
  }

  deleteCallSheet(data: any) {
    return this.http.post<any>(BASE_URL + DELETE_CALL_SHEET, data)
  }

  getAllCallSheetDetail(data: any) {
    return this.http.post<any>(BASE_URL + ALL_CALL_SHEET_DETAIL, data)
  }

  addCallSheetDetail(data: any) {
    return this.http.post<any>(BASE_URL + ADD_CALL_SHEET_DETAIL, data)
  }
}
