import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DashboardResponse } from 'src/app/models/DashboardResponse';
import { DashboardServiceService } from 'src/app/services/dashboard-service/dashboard-service.service';
import { UserDataService } from 'src/app/services/userData/user-data.service';
import { EnquiryService } from 'src/app/services/enquiry/enquiry.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  filterForm = new FormGroup({
    startDate: new FormControl(''),
    endDate: new FormControl('')
  })

  permissions: any = []
  showFilter: boolean = false
  data: any = {

  }
  displayedColumns: string[] = ['enquiryAutoId', 'isConfirmed',  'stuName','info', 'courses', 'management' ,'createdAt', 'action']

  clientsPaymentResponse: Partial<any> = {}
  dataSource = new MatTableDataSource<any>([]);
  startpoint: Number = 0
  totalLoaded: Number = 0
  total: any = 0
  pageNo: Number = 0

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  constructor(
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private dashboardService: DashboardServiceService, 
    private _userDataService: UserDataService,
    private enquiryService:EnquiryService) { }

  ngOnInit(): void {
    this.permissions = (this._userDataService.getPermissions() ?? [])
    // this.getDashboardData()
    // if (this.showFilter) {
    //   this.filterForm.patchValue({ startDate: moment(new Date()).format('YYYY-MM-DD'), endDate: moment(new Date()).format('YYYY-MM-DD') })
      this.getDashboardData()
      this.getList()
      this.getEnquiries()
    // }
  }

  getDashboardData() {
    this.spinner.show()
    this.dashboardService.getDashboard().subscribe({
      next: (result) => {
        this.spinner.hide()
        if (result.success) {
          this.data = result.data
          
        } else {
          this.toastr.error(result.message, 'Error')
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
  }
  getList(){
    this._userDataService.getList()
  }

  getEnquiries() {
    this.spinner.show()   
    let obj = {
      startDate:moment(new Date()).format('YYYY-MM-DD'),
      endDate:moment(new Date()).format('YYYY-MM-DD')
    }
      this.enquiryService.getAllEnquiry(obj).subscribe({
        next: (result) => {
          this.spinner.hide()
          if (result.success) {
            this.total = result.total ?? 0
            this.dataSource.data = result.data
          }
          else{
            this.spinner.hide()
            this.toastr.error(result.message)
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
  }
}

