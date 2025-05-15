import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ADD_TIMESLOT, ALL_TIMESLOT, BASE_URL, DELETE_TIMESLOT, SINGLE_TIMESLOT, UPDATE_TIMESLOT } from 'src/app/endpoints';

@Injectable({
  providedIn: 'root'
})
export class TimeSlotService {

  constructor(private http: HttpClient) { }

  getAllTimeSlot(data: any) {
    return this.http.post<any>(BASE_URL + ALL_TIMESLOT, data)
  }

  singleTimeSlot(data: any) {
    return this.http.post<any>(BASE_URL + SINGLE_TIMESLOT, data)
  }

  addTimeSlot(data: any) {
    return this.http.post<any>(BASE_URL + ADD_TIMESLOT, data)
  }

  updateTimeSlot(data: any) {
    return this.http.post<any>(BASE_URL + UPDATE_TIMESLOT, data)
  }

  deleteTimeSlot(data: any) {
    return this.http.post<any>(BASE_URL + DELETE_TIMESLOT, data)
  }
}
