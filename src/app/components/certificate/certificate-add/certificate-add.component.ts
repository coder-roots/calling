import { Component, ViewChild, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { PAGELENGTH } from 'src/app/endpoints';
import { AdmissionService } from 'src/app/services/admission/admission.service';
import { BatchService } from 'src/app/services/batch/batch.service';
import { CertificateAddDialogComponent } from './certificate-add-dialog/certificate-add-dialog.component';

@Component({
  selector: 'app-certificate-add',
  templateUrl: './certificate-add.component.html',
  styleUrls: ['./certificate-add.component.css']
})
export class CertificateAddComponent implements OnInit {

  search: string = ""
  displayedColumns: string[] = ['admissionAutoId', 'stuName', 'info','isOfficial', 'college', 'courses', 'admissionDate', 'action']


  AdmissionResponse: Partial<any> = {}


  dataSource = new MatTableDataSource<any>([]);
  startpoint: Number = 0
  totalLoaded: Number = 0
  total: any = 0
  pageNo: Number = 0
  batchList: any[] = []
  collegeList: any[] = []
  courseList: any[] = []
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  constructor(private admissionService: AdmissionService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private batchService: BatchService,
    private router:Router) {
      this.collegeList = JSON.parse(sessionStorage.getItem('colleges') ?? '')
    this.courseList = JSON.parse(sessionStorage.getItem('courses') ?? '')
    }

  ngOnInit(): void {
    this.getBatches()
    this.dataSource.data = []
    this.getAllAdmission(null)
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

    if (filter == 'course') {
      if (event.value != '')
        this.obj['technologies.course'] = event.value
      else delete this.obj['technologies.course']
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
    this.obj.isTotalFeePaid = true
    this.obj.isActive = true

    if (this.totalLoaded == 0 || event == null || ((this.totalLoaded < this.total) && (event.pageIndex > this.pageNo))) {
      this.admissionService.getAllAdmission(this.obj).subscribe({
        next: (result:any) => {
          this.spinner.hide()
          if (result.success) {
            this.AdmissionResponse = result
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

  certificateForm:any = new FormGroup({
    admissionId:new FormControl('', [Validators.required]),
    collectedBy:new FormControl('', [Validators.required]),
    givenBy:new FormControl('', [Validators.required]),
    comments:new FormControl(''),
    name:new FormControl('', [Validators.required]),
    email:new FormControl('', [Validators.required]),
    coursename:new FormControl('', [Validators.required]),
    refNo:new FormControl('', [Validators.required]),
    start:new FormControl('', [Validators.required]),
    end:new FormControl('', [Validators.required]),
    company: new FormControl(0)   // 0 : O7 Services and 1: O7 Solutions
  })

  openDialog(data:any){


      this.certificateForm.patchValue({
        admissionId:data._id
      })

    const dialogRef = this.dialog.open(CertificateAddDialogComponent, { disableClose: false, autoFocus: true, width: '60%', data: { admissionData: data, form: this.certificateForm } })
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.router.navigateByUrl('/admin/certificates')
      }
    });
  }

}
