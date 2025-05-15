import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Observable, startWith, map } from 'rxjs';
import { City, Country, State } from 'src/app/models/CountryResponse';
// import { CategoryService } from 'src/app/services/category-service/category.service';
import { CustomerService } from 'src/app/services/customer-service/customer.service';
import { ExtraService } from 'src/app/services/extra/extra.service';

@Component({
  selector: 'app-customer-add',
  templateUrl: './customer-add.component.html',
  styleUrls: ['./customer-add.component.css']
})
export class CustomerAddComponent implements OnInit {

  type: string = "Add"
  id: any = ''

  customerForm = new FormGroup({
    companyName: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    phone: new FormControl('', [Validators.required, Validators.pattern('[0-9]{7,13}')]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl(''),
    address: new FormControl('', Validators.required),
    gstNum: new FormControl('', Validators.required),
    pinCode: new FormControl('', Validators.pattern('[0-9]{6,}')),
    _id: new FormControl(''),


  })

  categoryList: any = []

  selectFormControl = new FormControl();
  searchTextboxControl = new FormControl();
  selectedValues: any = [];

  filteredOptions: Observable<any[]> | undefined;
  @ViewChild('search') searchTextBox: ElementRef = {} as ElementRef;


  data: any[] = [
    { 'name': '' }
  ]

  _id: any
  customerData: any

  constructor(private spinner: NgxSpinnerService,
    private toastr: ToastrService, private customerService:
      CustomerService, private extraService: ExtraService,
    private router: Router, private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(param => {
      this.id = param.get('id') ?? ""
      this.type = this.id == "" ? 'Add' : 'Update'
      if (this.type == 'Update') {
        this.getSingleCustomer()
      }
    })
  }

  getSingleCustomer() {
    this.customerService.singleCustomer({ _id: this.id }).subscribe({
      next: (v: any) => {
        var result = v
        if (result.success) {
          this.customerData = v.data
          this.customerForm.patchValue({
            _id: v.data?._id,
            companyName: v.data?.companyName,
            gstNum: v.data?.gstNum,
            name: v.data?.name,
            address: v.data?.address,
            pinCode: v.data?.pinCode,
            email: v.data?.userId?.email,
            phone: v.data?.userId?.phone,
          })
        }
        else {
          this.toastr.error(v.message, 'Error')
        }
      },
      error: (e) => {
        this.spinner.hide()
        this.toastr.error(e.error.message)
      },
      complete: () => { this.spinner.hide() }
    })
  }

  submit() {
    this.spinner.show()
    if (this.type == 'Add') {
      if (this.customerForm.value.password == null || this.customerForm.value.password == undefined || this.customerForm.value.password == '') {
        this.toastr.error("Please provide password.", 'Error')
        return
      }

      this.customerForm.patchValue({ _id: undefined })

      this.customerService.addCustomer(this.customerForm.value).subscribe({
        next: (v: any) => {
          if (v.success) {
            this.toastr.success(v.message, 'Success')
            this.router.navigateByUrl('/admin/clients')
          }
          else {
            this.toastr.error(v.message, 'Error')
          }
        },
        error: (e: any) => {
          this.spinner.hide()
          this.toastr.error(e.error.message, 'Error')
        },
        complete: () => { this.spinner.hide() }
      })
    }
    else {
      this.customerService.updateCustomer(this.customerForm.value).subscribe({
        next: (v: any) => {
          if (v.success) {
            this.toastr.success(v.message, 'Success')
            this.router.navigateByUrl('/admin/clients')

          }
          else {
            this.toastr.error(v.message, 'Error')
          }
        },
        error: (e: any) => {
          this.spinner.hide()
          this.toastr.error(e.error.message, 'Error')
        },
        complete: () => { this.spinner.hide() }
      })
    }
  }
}
