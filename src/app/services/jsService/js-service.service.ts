import { Injectable } from '@angular/core';
declare var $:any;

@Injectable({
  providedIn: 'root'
})
export class JsServiceService {

  constructor() { }
  callJsClass(){
    $.getScript("../../../assets/plugins/sidemenu-toggle/sidemenu-toggle.js", function () {
    });  
    $.getScript("../../../assets/plugins/pscrollbar/perfect-scrollbar.js", function () {
      console.log('ok')
    }); 
  }
}
