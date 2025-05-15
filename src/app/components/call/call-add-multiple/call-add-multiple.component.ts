import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import { PAGELENGTH } from 'src/app/endpoints';
import { CallService } from 'src/app/services/call/call.service';
import { BatchService } from 'src/app/services/batch/batch.service';
import { EnquiryService } from 'src/app/services/enquiry/enquiry.service';
import { AdmissionService } from 'src/app/services/admission/admission.service';
import { UserDataService } from '../../../services/userData/user-data.service';
import { CallHistoryComponent } from '../call-sheet-add/call-history/call-history.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-call-add-multiple',
  templateUrl: './call-add-multiple.component.html',
  styleUrls: ['./call-add-multiple.component.css']
})
export class CallAddMultipleComponent implements OnInit {

  search: string = ""
  displayedColumns: string[] = ['srNo', 'stuName','info','college',  'courses','callStatus'  ,'action']

  EnquiryResponse: Partial<any> = {}
  dataSource = new MatTableDataSource<any>([]);
  startpoint: Number = 0
  totalLoaded: Number = 0
  total: any = 0
  pageNo: Number = 0

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  collegeList: any = []
  courseList: any = []
  batchList: any = []

  start:any
  end:any

  callDate :any
  callStatus:any
  callerName:any
  constructor(private enquiryService: EnquiryService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private batchService: BatchService, 
    private route: ActivatedRoute,
    private router: Router,
    private callService:CallService,
    private admissionService:AdmissionService,
    private userDataService:UserDataService,
    private dialog:MatDialog) { 
      this.callDate = Date.now()
      this.collegeList = JSON.parse(sessionStorage.getItem('colleges')??'')
      this.courseList = JSON.parse(sessionStorage.getItem('courses')??'')
      this.callerName = userDataService.getData()?.data?.name
    }
    data:any
  ngOnInit(): void {
    this.dataSource.data = []
    this.route.paramMap.subscribe(param => {
      this.data = param.get('data') ?? ""
    })
    // this.getAllEnquiry(null)
    this.getBatches()
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator
  }

  getBatches() {
    this.spinner.show()   
    this.batchService.getAllBatch({}).subscribe({
      next: (result) => {
        this.spinner.hide()
        if (result.success) {
          this.batchList = result.data
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

  obj:any = {}
  makeObj(event:any, filter:any){
    // this.obj = {}
    // console.log('obj called');
    
    if(filter=='college'){
      if(event.value!='')
      this.obj.college = event.value
      else delete this.obj.college
    }
    if(filter == 'course'){
      if(event.value!='')
      this.obj['technologies.course'] = event.value
      else delete this.obj['technologies.course']
    }
    if(filter == 'batch'){
      if(event.value!=''){
        this.obj['batches.batchId'] = event.value
        this.obj['batches.isCurrentAttendingBatch'] = true
      }else{
        delete this.obj['batches.batchId']
        delete this.obj['batches.isCurrentAttendingBatch']
      }
    }
    // console.log("start", this.start);
    // console.log("end", this.end);
    
    if(filter == 'date' && !!this.start && !!this.end){
      
      this.obj.startDate = new Date(this.start.setDate(this.start.getDate()))
      this.obj.endDate = new Date(this.end.setDate(this.end.getDate()))
      
    }
    // console.log(this.obj)
    this.getAll(null)
  }

  getAll(event: any) {
    // console.log("paginator is ", this.paginator)
    // console.log("getAll called ")
    this.spinner.show()   
    if (event == null) {
      this.startpoint = 0
      this.dataSource.data = []
    }
    this.obj.startpoint = this.startpoint
    
    // console.log(this.obj);
    
    if(this.data=='enquiry'){
      this.obj.isAdmissionConfirmed = false
      if (this.totalLoaded == 0 || event == null || ((this.totalLoaded < this.total) && (event.pageIndex > this.pageNo))) {
        this.enquiryService.getAllEnquiry(this.obj).subscribe({
          next: (result) => {
            this.spinner.hide()
            if (result.success) {
              this.EnquiryResponse = result
              this.total = result.total ?? 0
              this.dataSource.data = [...this.dataSource.data, ...(result.data || [])];
              // console.log(this.dataSource.data);
              
              this.totalLoaded = this.dataSource.data.length
              this.startpoint = this.totalLoaded
              this.pageNo = this.paginator?.pageIndex
              setTimeout(() => {
                this.paginator.length = this.total;    
                this.paginator.pageSize = PAGELENGTH;
                this.paginator._changePageSize
              }, 10)

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
      } else this.spinner.hide()
    }
    else if(this.data=='admission'){
      if (this.totalLoaded == 0 || event == null || ((this.totalLoaded < this.total) && (event.pageIndex > this.pageNo))) {
        this.admissionService.getAllAdmission(this.obj).subscribe({
          next: (result) => {
            this.spinner.hide()
            if (result.success) {
              this.EnquiryResponse = result
              this.total = result.total ?? 0
              this.dataSource.data = [...this.dataSource.data, ...(result.data || [])];
              // console.log(this.dataSource.data);
              
              this.totalLoaded = this.dataSource.data.length
              this.startpoint = this.totalLoaded
              this.pageNo = this.paginator?.pageIndex
              setTimeout(() => {
                this.paginator.length = this.total;    
                this.paginator.pageSize = PAGELENGTH;
                this.paginator._changePageSize
              }, 10)
  
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
      } else this.spinner.hide()
    }
  }
  
  addCall(id:any, index:number){
    let callObj:any={}
    if(this.data=='enquiry'){
      callObj.isEnquiryCall = true
      callObj.enquiryId = id
    }
    if(this.data=='admission'){
      callObj.isEnquiryCall = false
      callObj.admissionId = id
    }
    callObj.callerName = this.callerName
    callObj.callStatus = this.callStatus
    if(this.callStatus != '' && this.rowIndex == index){
      this.callService.addCall(callObj).subscribe({
        next: (v: any) => {
          if (v.success) {
            this.toastr.success(v.message, 'Success')
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
    else this.toastr.error("Call Status is not Allowed to be Empty")
  }

  rowIndex:number = -1
  statusChange(value:any, index:number){
    this.callStatus = value
    this.rowIndex = index
  }

  openDialog(id:any, studentName:any){
    let callHistory:any[]=[]
    if(this.data=='enquiry'){
      this.callService.getAllCall({enquiryId:id, isEnquiryCall:true, removeSession:'true'}).subscribe({
        next: (result) => {
          this.spinner.hide()
          if (result.success) {
            callHistory = result.data
            const dialogRef = this.dialog.open(CallHistoryComponent, { disableClose: false, autoFocus: true, width: '40%', data: { studentName:studentName ,array:callHistory } })
            dialogRef.afterClosed().subscribe((confirmed: boolean) => {
              if (confirmed) {

              }
            });
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
    else if(this.data=='admission'){
      this.callService.getAllCall({admissionId:id, isEnquiryCall:false, removeSession:'true'}).subscribe({
        next: (result) => {
          this.spinner.hide()
          if (result.success) {
            callHistory = result.data
            const dialogRef = this.dialog.open(CallHistoryComponent, { disableClose: false, autoFocus: true, width: '40%', data: { studentName:studentName ,array:callHistory } })
            dialogRef.afterClosed().subscribe((confirmed: boolean) => {
              if (confirmed) {

              }
            });
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

}
