import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UserDataService } from '../services/userData/user-data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private _router: Router, private _userData: UserDataService) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
  //   if (this._userData.isLogin() === false) {
  //     this._router.navigateByUrl('/login')
  //     return false
  //   }
  //   if (!route.data || !route.data['role']) {
  //     return true;
  //   }
  //   const roles = route.data['role'] as Array<string>
  //   if (roles) {
  //     const match = this._userData.roleMatch(roles)
  //     if (match) {
  //       //console.log('match')
  //       return true;
  //     } else {
  //       //console.log('match')
  //       if (this._userData.getData().data?.userType == 1){
  //         return true;
  //       }
  //       this._router.navigate([this.selectBestRoute()])
  //       return false;
  //     }
  //   }
  //   this._router.navigate([this.selectBestRoute()])
  //   return false;
  // }

  // selectBestRoute(): string {
  //   if (this._userData.isLogin()) {
  //     return '/admin/home'
  //   }
  //   return '/login';


  return true
  }
      
}
