import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { PAGELENGTH } from 'src/app/endpoints';
import { CallService } from 'src/app/services/call/call.service';
import { CollegeService } from 'src/app/services/college/college.service';
import { CourseService } from 'src/app/services/course/course.service';
import { EnquiryService } from 'src/app/services/enquiry/enquiry.service';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-call',
  templateUrl: './call.component.html',
  styleUrls: ['./call.component.css']
})
export class CallComponent implements OnInit {

  search: string = ""
  displayedColumns: string[] = ['srNo', 'calledTo', 'courses', 'info', 'college', 'callerName', 'callDate', 'callStatus', 'action']
  displayedColumnsForCallSheet: string[] = ['callSheetAutoId', 'collegeId', 'course', 'semester', 'comments', 'sheetDate', 'company', 'action']

  CallResponse: Partial<any> = {}

  //enquiry call
  dataSource1 = new MatTableDataSource<any>([]);
  startpoint1: Number = 0
  totalLoaded1: Number = 0
  total1: any = 0
  pageNo1: Number = 0
  @ViewChild('paginator1')
  paginator1!: MatPaginator;


  // admission call
  dataSource2 = new MatTableDataSource<any>([]);
  startpoint2: Number = 0
  totalLoaded2: Number = 0
  total2: any = 0
  pageNo2: Number = 0
  @ViewChild('paginator2')
  paginator2!: MatPaginator;

  // call sheet
  dataSource3 = new MatTableDataSource<any>([]);
  startpoint3: Number = 0
  totalLoaded3: Number = 0
  total3: any = 0
  pageNo3: Number = 0
  @ViewChild('paginator3')
  paginator3!: MatPaginator;




  collegeList: any = []
  courseList: any = []

  callDate: any
  callStatus: any

  start: any
  end: any

  tabIndex: any = 0
  tabChange(evt: any) {
    this.dataSource1.data = []
    this.dataSource2.data = []
    this.dataSource3.data = []
    this.tabIndex = evt.index
    sessionStorage.setItem('callTab', this.tabIndex)
    this.dateObj()
  }

  constructor(private enquiryService: EnquiryService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private collegeService: CollegeService,
    private courseService: CourseService,
    private route: ActivatedRoute,
    private router: Router,
    private callService: CallService,
    private dialog: MatDialog) {
    this.collegeList = JSON.parse(sessionStorage.getItem('colleges') ?? '')
    this.courseList = JSON.parse(sessionStorage.getItem('courses') ?? '')

    this.end = new Date()
    this.start = new Date(new Date().setDate(this.end.getDate() - 30));
    // console.log(this.start, this.end);
    if (sessionStorage.getItem('callTab') != null) this.tabIndex = parseInt(sessionStorage.getItem('callTab') ?? '')
    else this.tabIndex = 0
  }


  companies: any = [];
  userType: any;
  company:any;
  ngOnInit(): void {
    // this.dataSource1.data = []
    // this.dataSource2.data = []
    // this.dataSource3.data = []
    const userData = JSON.parse(sessionStorage.getItem('user_data') ?? '{}');
    this.userType = userData.data.userType;
    let companies = JSON.parse(sessionStorage.getItem('companies') ?? '[]');
    this.companies = companies;

    if (this.userType !== 1 && companies.length > 0) {
      this.company = companies[0];
    }
    this.dateObj()


  }

  ngAfterViewInit(): void {
    this.dataSource1.paginator = this.paginator1
    this.dataSource2.paginator = this.paginator2
    this.dataSource3.paginator = this.paginator3
  }


  obj: any = {}
  makeObj(event: any, filter: any) {
    // this.obj = {}
    if (filter == 'college') {
      if (event.value == 'all') delete this.obj.collegeId
      else this.obj.collegeId = event.value
    }
    if (filter == 'company') {
      if (event.value == 'all') delete this.obj.company
      else this.obj.company = event.value
    }

    if (this.tabIndex == 2)
      this.getAllCallSheet(null)
  }

  dateObj() {
    // console.log(this.start, this.end);
    if (!!this.start && !!this.end) {
      this.obj.startDate = this.start
      this.obj.endDate = this.end
      if (this.tabIndex == 0) {
        this.getAllEnquiryCall(null)
      }
      if (this.tabIndex == 1) {
        this.getAllAdmissionCall(null)
      }
      if (this.tabIndex == 2)
        this.getAllCallSheet(null)
    }
  }

  getAllEnquiryCall(event: any) {
    // console.log("paginator is ", this.paginator)
    // console.log("getAll called ")
    this.spinner.show()
    if (event == null) {
      this.startpoint1 = 0
      this.dataSource1.data = []
    }
    this.obj.startpoint = this.startpoint1
    // console.log(this.obj);
    this.obj.isEnquiryCall = true

    if (this.totalLoaded1 == 0 || event == null || ((this.totalLoaded1 < this.total1) && (event.pageIndex > this.pageNo1))) {
      this.callService.getAllCall(this.obj).subscribe({
        next: (result) => {
          this.spinner.hide()
          if (result.success) {
            this.CallResponse = result
            this.total1 = result.total ?? 0
            this.dataSource1.data = [...this.dataSource1.data, ...(result.data || [])];
            // console.log(this.dataSource.data);

            this.totalLoaded1 = this.dataSource1.data.length
            this.startpoint1 = this.totalLoaded1
            this.pageNo1 = this.paginator1?.pageIndex
            setTimeout(() => {
              this.paginator1.length = this.total1;
              this.paginator1.pageSize = PAGELENGTH;
              this.paginator1._changePageSize
            }, 10)

          }
          else {
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
    } else this.spinner.hide()
  }

  getAllAdmissionCall(event: any) {
    // console.log("paginator is ", this.paginator)
    // console.log("getAll called ")
    this.spinner.show()
    if (event == null) {
      this.startpoint2 = 0
      this.dataSource2.data = []
    }
    this.obj.startpoint = this.startpoint2
    // console.log(this.obj);
    this.obj.isEnquiryCall = false

    if (this.totalLoaded2 == 0 || event == null || ((this.totalLoaded2 < this.total2) && (event.pageIndex > this.pageNo2))) {
      this.callService.getAllCall(this.obj).subscribe({
        next: (result) => {
          this.spinner.hide()
          if (result.success) {
            this.CallResponse = result
            this.total2 = result.total ?? 0
            this.dataSource2.data = [...this.dataSource2.data, ...(result.data || [])];
            // console.log(this.dataSource2.data);

            this.totalLoaded2 = this.dataSource2.data.length
            this.startpoint2 = this.totalLoaded2
            this.pageNo2 = this.paginator2?.pageIndex
            setTimeout(() => {
              this.paginator2.length = this.total2;
              this.paginator2.pageSize = PAGELENGTH;
              this.paginator2._changePageSize
            }, 10)

          }
          else {
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
    } else this.spinner.hide()
  }

  getAllCallSheet(event: any) {
    // console.log("paginator is ", this.paginator)
    // console.log("getAll called ")
    this.spinner.show()
    if (event == null) {
      this.startpoint3 = 0
      this.dataSource3.data = []
    }
    this.obj.startpoint = this.startpoint3
    console.log(this.obj);
    if(this.company!="all") {
      this.obj.company = this.company;
    }

    if (this.totalLoaded3 == 0 || event == null || ((this.totalLoaded3 < this.total3) && (event.pageIndex > this.pageNo3))) {
      this.callService.getAllCallSheet(this.obj).subscribe({
        next: (result) => {
          this.spinner.hide()
          if (result.success) {
            this.CallResponse = result
            this.total3 = result.total ?? 0
            this.dataSource3.data = [...this.dataSource3.data, ...(result.data || [])];
            // console.log(this.dataSource3.data);

            this.totalLoaded3 = this.dataSource3.data.length
            this.startpoint3 = this.totalLoaded3
            this.pageNo3 = this.paginator3?.pageIndex
            setTimeout(() => {
              this.paginator3.length = this.total3;
              this.paginator3.pageSize = PAGELENGTH;
              this.paginator3._changePageSize
            }, 10)

          }
          else {
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
    } else this.spinner.hide()
  }

  openDeleteDialog(id: any) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, { disableClose: false, data: { 'message': 'Are you sure, you really want to delete it?' } })
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.spinner.show()
        this.callService.deleteCall({ _id: id }).subscribe({
          next: (v: any) => {
            var result = v
            if (result.success) {
              this.toastr.success(result.message, 'Success')
            }
            if (!result.success) {
              this.toastr.error(result.message, 'Error')
            }
            if (this.tabIndex == 0) {
              this.getAllEnquiryCall(null)
            }
            if (this.tabIndex == 1) {
              this.getAllAdmissionCall(null)
            }
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

  openDeleteDialogSheet(id: any) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, { disableClose: false, data: { 'message': 'Are you sure, you really want to delete it?' } })
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.spinner.show()
        this.callService.deleteCallSheet({ _id: id }).subscribe({
          next: (v: any) => {
            var result = v
            if (result.success) {
              this.toastr.success(result.message, 'Success')
            }
            if (!result.success) {
              this.toastr.error(result.message, 'Error')
            }

            this.getAllCallSheet(null)

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

  // editCall(index:any){
  //   console.log("index", index);
  //   let enquiryId = this.CallResponse['data'][index]._id
  //   this.callService.addCall({enquiryId:enquiryId, callStatus:this.callStatus}).subscribe({
  //     next: (v: any) => {
  //       if (v.success) {
  //         this.toastr.success(v.message, 'Success')
  //       }
  //       else {
  //         this.toastr.error(v.message, 'Error')
  //       }
  //     },
  //     error: (e: any) => {
  //       this.spinner.hide()
  //       this.toastr.error(e.error.message, 'Error')
  //     },
  //     complete: () => { this.spinner.hide() }
  //   })
  // }

  statusChange(value: any) {
    this.callStatus = value
  }

  generateExcel() {

  }


}
