import { Component,HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToWords } from 'to-words';
@Component({
  selector: 'app-print-receipts',
  templateUrl: './print-receipts.component.html',
  styleUrls: ['./print-receipts.component.css']
})
export class PrintReceiptsComponent implements OnInit {

  data:any
  id:any
  type:any
  constructor(
    private router:Router
  ) {

    this.data =  router?.getCurrentNavigation()?.extras?.state?.['data']
    this.id =  router?.getCurrentNavigation()?.extras?.state?.['id']
    this.type =  router?.getCurrentNavigation()?.extras?.state?.['type']
    console.log(this.data);
  }

  ngOnInit(): void {
    // window.print()
  }

  // ngAfterViewInit() {
  //   setTimeout(() => {
  //     // print current iframe
  //
  //   }, 5000);
  // }

  print(){
    window.print();
  }

  // @HostListener("window:afterprint", [])
  // onWindowAfterPrint() {
  //   if(this.type=='fee')
  //   this.router.navigateByUrl("/admin/admission/viewFee/"+this.data.admissionId?._id)

  // }

  changeToWords(num:number){
    const toWords = new ToWords();
    return toWords.convert(num, { currency: true });
  }

}
