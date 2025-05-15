import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ADD_BATCH, ADD_BATCH_STUDENT, ALL_BATCH, BASE_URL, DELETE_BATCH, DELETE_BATCH_STUDENT, SINGLE_BATCH, UPDATE_BATCH } from 'src/app/endpoints';
import { ADD_BATCH_STUDENT_MULTIPLE, SHUFFLE_BATCH_STUDENT, SHUFFLE_BATCH_STUDENT_MULTIPLE } from '../../endpoints';

@Injectable({
  providedIn: 'root'
})
export class BatchService {

  constructor(private http: HttpClient) { }

  getAllBatch(data: any) {
    return this.http.post<any>(BASE_URL + ALL_BATCH, data)
  }

  singleBatch(data: any) {
    return this.http.post<any>(BASE_URL + SINGLE_BATCH, data)
  }

  addBatch(data: any) {
    return this.http.post<any>(BASE_URL + ADD_BATCH, data)
  }

  updateBatch(data: any) {
    return this.http.post<any>(BASE_URL + UPDATE_BATCH, data)
  }

  deleteBatch(data: any) {
    return this.http.post<any>(BASE_URL + DELETE_BATCH, data)
  }

  addBatchStudent(data: any) {
    return this.http.post<any>(BASE_URL + ADD_BATCH_STUDENT, data)
  }
  addBatchStudentMultiple(data: any) {
    return this.http.post<any>(BASE_URL + ADD_BATCH_STUDENT_MULTIPLE, data)
  }

  shuffleBatchStudent(data: any) {
    return this.http.post<any>(BASE_URL + SHUFFLE_BATCH_STUDENT, data)
  }

  shuffleBatchStudentMultiple(data: any) {
    return this.http.post<any>(BASE_URL + SHUFFLE_BATCH_STUDENT_MULTIPLE, data)
  }

  deleteBatchStudent(data: any) {
    return this.http.post<any>(BASE_URL + DELETE_BATCH_STUDENT, data)
  }


}
