import { HttpErrorResponse, HttpEvent, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, tap } from 'rxjs';
import { SESSION_YEAR } from 'src/app/endpoints';
import { UserDataService } from 'src/app/services/userData/user-data.service';

@Injectable({
  providedIn: 'root'
})
export class InterceptorServiceService {

  constructor(private _userData: UserDataService, private router: Router, private spinner: NgxSpinnerService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this._userData.isLogin() == true) {
      let token = this._userData.getData().token ?? ""
      let sessionYear = this._userData.getSession()
      // console.log(token)
      let tokenReq = req.clone({
        setHeaders: {
          Authorization: token,
          sessionYearId: sessionYear!
        }
      });
      return next.handle(tokenReq).pipe(
        tap(
          event => { },
          error => this.handleError(req, error)
        )
      );                                                                                                        
    } else {
      let tokenReq = req.clone({});
      return next.handle(tokenReq)
    }
  }

  handleError(req: HttpRequest<any>, error: any) {
    if (error instanceof HttpErrorResponse) {
      this.spinner.hide()
      if (error.status === 401 || error.status === 403) {
        sessionStorage.clear()
        this.router.navigateByUrl('/login')
      }
    }
  }
}
