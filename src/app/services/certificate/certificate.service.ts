import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ADD_CERTIFICATE, ALL_CERTIFICATE, BASE_URL, DELETE_CERTIFICATE, SINGLE_CERTIFICATE } from '../../endpoints';
import { ADD_CERTIFICATE_SHEET, ALL_CERTIFICATE_SHEET, DELETE_CERTIFICATE_SHEET, SINGLE_CERTIFICATE_SHEET, UPDATE_CERTIFICATE_SHEET} from '../../endpoints';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {

  constructor(private http: HttpClient) { }

  getAllCertificate(data: any) {
    return this.http.post<any>(BASE_URL + ALL_CERTIFICATE, data)
  }

  singleCertificate(data: any) {
    return this.http.post<any>(BASE_URL + SINGLE_CERTIFICATE, data)
  }

  addCertificate(data: any) {
    return this.http.post<any>(BASE_URL + ADD_CERTIFICATE, data)
  }

  deleteCertificate(data: any) {
    return this.http.post<any>(BASE_URL + DELETE_CERTIFICATE, data)
  }

  getAllCertificateSheet(data: any) {
    return this.http.post<any>(BASE_URL + ALL_CERTIFICATE_SHEET, data)
  }

  singleCertificateSheet(data: any) {
    return this.http.post<any>(BASE_URL + SINGLE_CERTIFICATE_SHEET, data)
  }

  addCertificateSheet(data: any) {
    return this.http.post<any>(BASE_URL + ADD_CERTIFICATE_SHEET, data)
  }

  updateCertificateSheet(data: any) {
    return this.http.post<any>(BASE_URL + UPDATE_CERTIFICATE_SHEET, data)
  }

  deleteCertificateSheet(data: any) {
    return this.http.post<any>(BASE_URL + DELETE_CERTIFICATE_SHEET, data)
  }

 
  
}
