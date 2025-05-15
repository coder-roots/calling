import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ADD_NEWSTYPE, ADD_NOTIFICATION, ALL_NOTIFICATION, BASE_URL, SINGLE_NOTIFICATION } from 'src/app/endpoints';
import { AllNotificationResponse, SingleNotificationResponse } from 'src/app/models/NotificationResponse';
@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private http: HttpClient) { }
  getAllNotifications(data: any) {
    return this.http.post<AllNotificationResponse>(BASE_URL + ALL_NOTIFICATION, data)
  }

  singleNotification(data: any) {
    return this.http.post<SingleNotificationResponse>(BASE_URL + SINGLE_NOTIFICATION, data)
  }

  addNotification(data: any) {
    return this.http.post<SingleNotificationResponse>(BASE_URL + ADD_NOTIFICATION, data)
  }


}
