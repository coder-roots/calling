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
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-admission',
  templateUrl: './admission.component.html',
  styleUrls: ['./admission.component.css']
})
export class AdmissionComponent implements OnInit {


  displayedColumns: string[] = ['admissionAutoId', 'stuName', 'info', 'college', 'courses', 'management', 'company', 'admissionDate', 'isFeeComplete', 'action']

  AdmissionResponse: Partial<any> = {}

  dataSource = new MatTableDataSource<any>([]);
  startpoint: Number = 0
  totalLoaded: Number = 0
  total: any = 0
  pageNo: Number = 0
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  company: any;
  batchList: any[] = []
  collegeList: any[] = []
  courseList: any[] = []
  obj: any = {}

  search: any
  start: any = null;
  end: any = null;
  applyDateFilter: boolean = false;

  constructor(private admissionService: AdmissionService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private batchService: BatchService) {
    this.collegeList = JSON.parse(sessionStorage.getItem('colleges') ?? '')
    this.courseList = JSON.parse(sessionStorage.getItem('courses') ?? '')
  }

  companies: any = [];
  userType: any;



  onFilterToggle() {
    if (!this.applyDateFilter) {
      this.start = null;
      this.end = null;
      this.obj.startDate = null
      this.obj.endDate = null
      this.getAllAdmission(null)
    } else {
      this.end = this.obj.endDate = new Date();
      this.start = this.obj.startDate = new Date(
        new Date().setDate(this.obj.endDate.getDate() - 10)
      );
      this.makeObj(null, 'date')
    }
  }

  onDateChange() {
    if (this.start && this.end) {
      this.applyDateFilter = true;
    }
  }

  ngOnInit(): void {
    this.getBatches();
    this.dataSource.data = [];

    // if (sessionStorage.getItem('admissionFilters') != null) {
    //   this.obj = JSON.parse(sessionStorage.getItem('admissionFilters') ?? '');
    // }
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


  makeObj(event: any, filter: any) {
    if (!this.obj) {
      this.obj = {};
    }
    if (filter == 'date' && this.applyDateFilter) {
      this.obj.startDate = new Date(this.start.setDate(this.start.getDate()));
      this.obj.endDate = new Date(this.end.setDate(this.end.getDate()));
    }

    if (filter == 'college') {
      if (event != '') this.obj.college = event;
      else delete this.obj.college;
    }


    if (filter == 'course') {
      if (event != '') this.obj['technologies.course'] = event;
      else delete this.obj['technologies.course'];
    }

    if (filter == 'company') {
      if (event != '') this.obj['company'] = event;
      else delete this.obj['company'];
    }

    if (filter == 'search') {
      if (this.search && this.search.trim() !== '') {
        this.obj['search'] = this.search;
      } else {
        delete this.obj['search'];
      }
    } else {
      delete this.obj['search'];
    }

    if (filter == 'autoId') {
      if (event.value != '') this.obj['admissionAutoId'] = event.value;
      else delete this.obj['admissionAutoId'];
    }

    if (filter == 'batch') {
      if (event != '') {
        this.obj['batches.batchId'] = event;
        this.obj['batches.isCurrentAttendingBatch'] = true;
      } else {
        delete this.obj['batches.batchId'];
        delete this.obj['batches.isCurrentAttendingBatch'];
      }
    }


    sessionStorage.setItem('admissionFilters', JSON.stringify(this.obj));
    this.getAllAdmission(null);
  }


  getAllAdmission(event: any) {


    if (this.company) {
      this.obj['company'] = this.company;
    } else {
      delete this.obj['company'];
    }
    this.spinner.show();
    if (event == null) {
      this.startpoint = 0;
      this.dataSource.data = [];
    }
    this.obj.startpoint = this.startpoint;
    this.obj.isActive = true;

    if (this.totalLoaded == 0 || event == null || ((this.totalLoaded < this.total) && (event.pageIndex > this.pageNo))) {
      this.admissionService.getAllAdmission(this.obj).subscribe({
        next: (result: any) => {
          this.spinner.hide();
          if (result.success) {
            this.AdmissionResponse = result;
            this.total = result.total ?? 0;
            this.dataSource.data = [...this.dataSource.data, ...(result.data || [])];
            this.totalLoaded = this.dataSource.data.length;
            this.startpoint = this.totalLoaded;
            this.pageNo = this.paginator?.pageIndex;
            setTimeout(() => {
              this.paginator.length = this.total;
              this.paginator.pageSize = PAGELENGTH;
              this.paginator._changePageSize;
            }, 10);
          } else {
            this.toastr.error(result.message);
          }
        },
        error: (e) => {
          this.spinner.hide();
          this.toastr.error(e);
        },
        complete: () => {
          this.spinner.hide();
        }
      });
    } else {
      this.spinner.hide();
    }
  }




  openDeleteDialog(id: any) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, { disableClose: false, data: { 'message': 'Are you sure, you really want to delete it?' } })
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.spinner.show()
        this.admissionService.deleteAdmission({ _id: id }).subscribe({
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

  completeAdmission(id: any) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, { disableClose: false, data: { 'message': 'Are you sure, you really want to complete admssion?' } })
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.spinner.show()
        this.admissionService.updateAdmission({ _id: id, isActive: 'false' }).subscribe({
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
    })
  }
}
