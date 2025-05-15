import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { PAGELENGTH } from 'src/app/endpoints';
import { CustomerResponse, Customers } from 'src/app/models/CustomerResponse';
import { CustomerService } from 'src/app/services/customer-service/customer.service';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { CustomerAddComponent } from './customer-add/customer-add.component';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {

  search: string = ""
  displayedColumns: string[] = ['autoId', 'companyName', 'name', 'gstNum', 'pincode', 'status', 'action']

  customerResponse: Partial<CustomerResponse> = {}

  dataSource = new MatTableDataSource<Customers>([]);
  startpoint: Number = 0
  totalLoaded: Number = 0
  total: any = 0
  pageNo: Number = 0

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  singleUserData: any

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator
  }

  constructor(private customerService: CustomerService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService, private dialog: MatDialog, private route: ActivatedRoute, private trusturl: DomSanitizer) { }

  ngOnInit(): void {

    this.dataSource.data = []
    this.getAllCustomers(null)
  }

  getCustomer(event: any) {
    if (event.target.value == "") {
      this.getAllCustomers(null)
    }
  }

  getAllCustomers(event: any) {
    // console.log("paginator is ", this.paginator)
    this.spinner.show()
    if (event == null) {
      this.startpoint = 0
      this.dataSource.data = []
    }
    let data: any = {}
    if (!!this.search) {
      data = {
        startpoint: this.startpoint,
        search: this.search
      }
    } else {
      data = {
        startpoint: this.startpoint
      }
    }

    if (this.totalLoaded == 0 || event == null || ((this.totalLoaded < this.total) && (event.pageIndex > this.pageNo))) {
      this.customerService.getAllCustomer(data).subscribe({
        next: (result) => {
          this.spinner.hide()
          if (result.success) {
            this.customerResponse = result
            this.total = result.total ?? 0
            this.dataSource.data = [...this.dataSource.data, ...(result.data || [])];
            this.totalLoaded = this.dataSource.data.length
            this.startpoint = this.totalLoaded
            this.pageNo = this.paginator?.pageIndex
            setTimeout(() => {
              this.paginator.length = this.total;
              this.paginator.pageSize = PAGELENGTH;
              this.paginator._changePageSize
            }, 10)

          }

        },
        error: (e) => {
          this.spinner.hide()
          this.toastr.error(e)

        },
        complete: () => {
          this.spinner.hide()
        }
      })
    } else this.spinner.hide()
  }

  changeUserStatus(event: any, id: any) {
    this.spinner.show()
    this.customerService.enableDisableCustomer({ _id: id, isBlocked: event.checked }).subscribe((result: any) => {
      this.spinner.hide()
      if (result.success) {
        this.toastr.success(result.message)
        this.getAllCustomers(null)
      }
      else this.toastr.error(result.message)

    })
  }

  openDeleteDialog(id: any) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, { disableClose: false, data: { 'message': 'Are you sure, you really want to delete it?' } })
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.spinner.show()
        this.customerService.deleteCustomer({ _id: id }).subscribe({
          next: (v: any) => {
            var result = v
            if (result.success) {
              this.toastr.success(result.message, 'Success')
            }
            if (!result.success) {
              this.toastr.error(result.message, 'Error')
            }
            this.getAllCustomers(null)
          },
          error: (e) => {
            this.spinner.hide()
            this.toastr.error(e.error.message)
          },
          complete: () => { this.spinner.hide() }
        })
      }
    });
  }

  sendUserData(data: any, from: any) {
    // this.singleUserData = data
    this.spinner.show()
    this.customerService.singleCustomer({ _id: data }).subscribe({
      next: (v: any) => {
        var result = v
        if (result.success) {
          this.singleUserData = v.data
          // if (from == 'Update'){
          //   this.customerForm.patchValue({ _id: v.data?._id, name: v.data?.name, address: v.data?.address, pinCode: v.data?.pinCode, email: v.data?.userId?.email, phone: v.data?.userId?.phone, countryCode: v.data?.userId?.countryCode, city: v.data?.city, state: v.data?.state })
          // }
        }
      },
      error: (e) => {
        this.spinner.hide()
        this.toastr.error(e.error.message)
      },
      complete: () => { this.spinner.hide() }
    })
  }

  // openDialog(id: any) {
  //   var type = 'Add'
  //   if (id == "") {
  //     type = 'Add'
  //     this.customerForm.reset()
  //     this.customerForm.patchValue({_id: undefined})


  //   }
  //   else {
  //     type = 'Update'
  //     this.customerForm.get('password')?.clearValidators()
  //     this.customerForm.get('countryCode')?.clearValidators()
  //     this.customerForm.updateValueAndValidity()

  //     this.sendUserData(id, 'Update')
  //   }
  //   // console.log("form is ", this.customerForm.value)
  //   const dialogRef = this.dialog.open(CustomerAddComponent, {disableClose: true, autoFocus: false, width: '80%', data: { type: type, form: this.customerForm, _id: id } })
  //   dialogRef.afterClosed().subscribe((confirmed: boolean) => {
  //     if (confirmed) {
  //       this.getAllCustomers(null)
  //     }
  //   });


  // }

}
