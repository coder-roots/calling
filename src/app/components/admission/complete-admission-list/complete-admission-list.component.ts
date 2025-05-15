import { Component, ViewChild, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { PAGELENGTH } from 'src/app/endpoints';
import { AdmissionService } from 'src/app/services/admission/admission.service';
import { BatchService } from 'src/app/services/batch/batch.service';
import { DeleteDialogComponent } from '../../delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-complete-admission-list',
  templateUrl: './complete-admission-list.component.html',
  styleUrls: ['./complete-admission-list.component.css']
})
export class CompleteAdmissionListComponent implements OnInit {

  search: string = ""
  displayedColumns: string[] = ['admissionAutoId', 'stuName', 'info', 'college', 'courses', 'management', 'admissionDate', 'isFeeComplete', 'action']

  AdmissionResponse: Partial<any> = {}

  dataSource = new MatTableDataSource<any>([]);
  startpoint: Number = 0
  totalLoaded: Number = 0
  total: any = 0
  pageNo: Number = 0
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  batchList: any[] = []
  collegeList: any[] = []
  courseList: any[] = []

  constructor(private admissionService: AdmissionService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private batchService: BatchService) {
    this.collegeList = JSON.parse(sessionStorage.getItem('colleges') ?? '')
    this.courseList = JSON.parse(sessionStorage.getItem('courses') ?? '')
  }

  company: any;
  companies: any = [];
  userType: any;

  ngOnInit(): void {
    this.getBatches()
    this.dataSource.data = []
    const userData = JSON.parse(sessionStorage.getItem('user_data') ?? '{}');
    this.userType = userData.data.userType;

    let companies = JSON.parse(sessionStorage.getItem('companies') ?? '[]');
    this.companies = companies;

    if (this.userType !== 1 && companies.length > 0) {
      this.company = companies[0];
      console.log("Selected company:", this.company);
    }

    this.getAllAdmission(null);
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


  obj: any = {}
  makeObj(event: any, filter: any) {
    // this.obj = {}
    if (filter == 'college') {
      if (event.value != '')
        this.obj.college = event.value
      else delete this.obj.college
    }
    if (filter == 'company') {
      if (event != '')
        this.obj['company'] = event
      else delete this.obj['company']
    }

    if (filter == 'course') {
      if (event.value != '')
        this.obj['technologies.course'] = event.value
      else delete this.obj['technologies.course']
    }

    if (filter == 'autoId') {
      if (event.value != '')
        this.obj['admissionAutoId'] = event.value
      else delete this.obj['admissionAutoId']
    }

    if (filter == 'batch') {
      if (event.value != '') {
        this.obj['batches.batchId'] = event.value
        this.obj['batches.isCurrentAttendingBatch'] = true
      }
      else {
        delete this.obj['batches.batchId']
        delete this.obj['batches.isCurrentAttendingBatch']
      }
    }
    this.getAllAdmission(null)
  }


  getAllAdmission(event: any) {
    // console.log("paginator is ", this.paginator)
    // console.log("getAll called ")
    this.spinner.show()
    if (event == null) {
      this.startpoint = 0
      this.dataSource.data = []
    }

    this.obj.startpoint = this.startpoint
    this.obj.isActive = false
    if (this.totalLoaded == 0 || event == null || ((this.totalLoaded < this.total) && (event.pageIndex > this.pageNo))) {
      this.admissionService.getAllAdmission(this.obj).subscribe({
        next: (result: any) => {
          this.spinner.hide()
          if (result.success) {
            this.AdmissionResponse = result
            this.total = result.total ?? 0
            this.dataSource.data = [...this.dataSource.data, ...(result.data || [])];
            // console.log("dataSource",this.dataSource.data);

            this.totalLoaded = this.dataSource.data.length
            this.startpoint = this.totalLoaded
            this.pageNo = this.paginator?.pageIndex
            setTimeout(() => {
              this.paginator.length = this.total;
              this.paginator.pageSize = PAGELENGTH;
              this.paginator._changePageSize
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

  inCompleteAdmission(id: any) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, { disableClose: false, data: { 'message': 'Are you sure, to shift this into running admissions?' } })
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.spinner.show()
        this.admissionService.updateAdmission({ _id: id, isActive: 'true' }).subscribe({
          next: (v: any) => {
            var result = v
            if (result.success) {
              this.toastr.success(result.message, 'Success')
            }
            if (!result.success) {
              this.toastr.error(result.message, 'Error')
            }
            this.getAllAdmission(null)
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

}
