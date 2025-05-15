import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { PAGELENGTH } from 'src/app/endpoints';
import { EnquiryService } from 'src/app/services/enquiry/enquiry.service';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { AdmissionService } from 'src/app/services/admission/admission.service';
import { CourseService } from 'src/app/services/course/course.service';
import { EnquiryAddMultipleComponent } from './enquiry-add-multiple/enquiry-add-multiple.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-enquiry',
  templateUrl: './enquiry.component.html',
  styleUrls: ['./enquiry.component.css'],
})
export class EnquiryComponent implements OnInit {

  displayedColumns: string[] = [
    'enquiryAutoId',
    'isNew',
    'stuName',
    'info',
    'courses',
    'company',
    'management',
    'createdAt',
    'action',
  ];

  start: any;
  end: any;
  courseList: any[] = [];
  collegeList: any[] = [];
  courseId: any;
  collegeId: any;
  company: any;
  tabIndex: any = 0;

  EnquiryResponse: Partial<any> = {};

  dataSource1 = new MatTableDataSource<any>([]);
  startpoint1: Number = 0;
  totalLoaded1: Number = 0;
  total1: any = 0;
  pageNo1: Number = 0;
  @ViewChild('paginator1')
  paginator1!: MatPaginator;

  dataSource2 = new MatTableDataSource<any>([]);
  startpoint2: Number = 0;
  totalLoaded2: Number = 0;
  total2: any = 0;
  pageNo2: Number = 0;
  @ViewChild('paginator2')
  paginator2!: MatPaginator;

  constructor(
    private enquiryService: EnquiryService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private admissionService: AdmissionService,
    private courseService: CourseService
  ) {
    if (sessionStorage.getItem('enquiryTab') != null)
      this.tabIndex = parseInt(sessionStorage.getItem('enquiryTab') ?? '');
    else this.tabIndex = 0;

    this.courseList = JSON.parse(sessionStorage.getItem('courses') ?? '');
    this.collegeList = JSON.parse(sessionStorage.getItem('colleges') ?? '');
  }

  companies: any = [];
  userType: any;

  ngOnInit(): void {
    this.dataSource1.data = [];
    this.dataSource2.data = [];


    const userData = JSON.parse(sessionStorage.getItem('user_data') ?? '{}');
    this.userType = userData.data.userType;


    let companies = JSON.parse(sessionStorage.getItem('companies') ?? '[]');
    this.companies = companies;


    if (this.userType !== 1 && companies.length > 0) {
      this.company = companies[0];
    }

    this.findEnquiries();
  }



  ngAfterViewInit(): void {
    this.dataSource1.paginator = this.paginator1;
    this.dataSource2.paginator = this.paginator2;
  }

  findEnquiries() {
    this.end = this.obj.endDate = new Date();
    this.start = this.obj.startDate = new Date(
      new Date().setDate(this.obj.endDate.getDate() - 10)
    );


    if (!!this.company) {
      this.obj['company'] = this.company;
    }

    this.tabChange(this.tabIndex);
  }


  getEnquiry(event: any) {
    if (event.target.value == '') {
      this.getAllEnquiry(null);
    }
  }


  search: any;

  handleSearch() {
    this.makeObj()
  }



  obj: any = {};
  makeObj() {
    // this.obj = {}
    this.obj.startDate = new Date(this.start.setDate(this.start.getDate()));
    this.obj.endDate = new Date(this.end.setDate(this.end.getDate()));
    if (!!this.courseId) {
      this.obj['technologies.course'] = this.courseId;
    } else delete this.obj['technologies.course'];

    if (!!this.collegeId) {
      this.obj['college'] = this.collegeId;
    } else delete this.obj['college'];

    if (!!this.company) {
      this.obj['company'] = this.company;
    } else delete this.obj['company'];


    if (this.search) {
      this.obj.search = this.search;
    } else {
      delete this.obj.search;
    }

    if (this.tabIndex == 0) {
      this.getAllEnquiry(null);
    }
    if (this.tabIndex == 1) {
      this.getAllConfirmedEnquiry(null);
    }
  }

  tabChange(index: any) {
    sessionStorage.setItem('enquiryTab', index);
    // console.log("tabIndex",this.tabIndex);
    // console.log("index",index);
    this.tabIndex = index;
    if (index == 0) {
      this.getAllEnquiry(null);
    }
    if (index == 1) {
      this.getAllConfirmedEnquiry(null);
    }
  }

  getAllEnquiry(event: any) {
    this.spinner.show();
    if (event == null) {
      this.startpoint1 = 0;
      this.dataSource1.data = [];
    }
    this.obj.startpoint = this.startpoint1;
    this.obj.isAdmissionConfirmed = false;
    // console.log("Total", this.total1);
    // console.log("Totalloaded", this.totalLoaded1);
    // console.log("Total", this.total1);

    if (
      this.totalLoaded1 == 0 ||
      event == null ||
      (this.totalLoaded1 < this.total1 && event.pageIndex > this.pageNo1)
    ) {
      this.enquiryService.getAllEnquiry(this.obj).subscribe({
        next: (result: any) => {
          console.log(result);
          this.spinner.hide();
          if (result.success) {
            this.EnquiryResponse = result;
            this.total1 = result.total ?? 0;
            this.dataSource1.data = [
              ...this.dataSource1.data,
              ...(result.data || []),
            ];
            // console.log("dataS 1",this.dataSource1.data);

            this.totalLoaded1 = this.dataSource1.data.length;
            this.startpoint1 = this.totalLoaded1;
            this.pageNo1 = this.paginator1?.pageIndex;
            setTimeout(() => {
              this.paginator1.length = this.total1;
              this.paginator1.pageSize = PAGELENGTH;
              this.paginator1._changePageSize;
            }, 10);
          } else {
            this.spinner.hide();
            this.toastr.error(result.message);
          }
        },
        error: (e) => {
          this.spinner.hide();
          this.toastr.error(e);
        },
        complete: () => {
          this.spinner.hide();
        },
      });
    } else this.spinner.hide();
  }

  getAllConfirmedEnquiry(event: any) {
    this.spinner.show();
    if (event == null) {
      this.startpoint2 = 0;
      this.dataSource2.data = [];
    }
    this.obj.startpoint = this.startpoint2;
    this.obj.isAdmissionConfirmed = true;

    if (
      this.totalLoaded2 == 0 ||
      event == null ||
      (this.totalLoaded2 < this.total2 && event.pageIndex > this.pageNo2)
    ) {
      this.enquiryService.getAllEnquiry(this.obj).subscribe({
        next: (result: any) => {
          this.spinner.hide();
          if (result.success) {
            this.EnquiryResponse = result;
            this.total2 = result.total ?? 0;
            this.dataSource2.data = [
              ...this.dataSource2.data,
              ...(result.data || []),
            ];
            // console.log("dataSource 2",this.dataSource2.data);

            this.totalLoaded2 = this.dataSource2.data.length;
            this.startpoint2 = this.totalLoaded2;
            this.pageNo2 = this.paginator2?.pageIndex;
            setTimeout(() => {
              this.paginator2.length = this.total2;
              this.paginator2.pageSize = PAGELENGTH;
              this.paginator2._changePageSize;
            }, 10);
          } else {
            this.spinner.hide();
            this.toastr.error(result.message);
          }
        },
        error: (e) => {
          this.spinner.hide();
          this.toastr.error(e);
        },
        complete: () => {
          this.spinner.hide();
        },
      });
    } else this.spinner.hide();
  }

  openDeleteDialog(id: any) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      disableClose: false,
      data: { message: 'Are you sure, you really want to delete it?' },
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.spinner.show();
        this.enquiryService.deleteEnquiry({ _id: id }).subscribe({
          next: (v: any) => {
            var result = v;
            if (result.success) {
              this.toastr.success(result.message, 'Success');
            }
            if (!result.success) {
              this.toastr.error(result.message, 'Error');
            }
            this.getAllEnquiry(null);
          },
          error: (e) => {
            this.spinner.hide();
            this.toastr.error(e.error.message);
          },
          complete: () => {
            this.spinner.hide();
          },
        });
      }
    });
  }

  confirmAdmissionForm = new FormGroup({
    _id: new FormControl('', [Validators.required]),
    paymentMethod: new FormControl('Cash', [Validators.required]),
    collectedOn: new FormControl(new Date(), [Validators.required]),
    collectedBy: new FormControl('', [Validators.required]),
    remarks: new FormControl(''),
  });

  openConfirmAdmissionDialog(enquiryId: any, isFeeCalculated: any) {
    // if(isFeeCalculated){
    //   this.confirmAdmissionForm.patchValue({_id:enquiryId})
    //   const dialogRef = this.dialog.open(EnquiryConfirmAdmissionComponent, { disableClose: false, autoFocus: true, width: '40%', data: { type: "Add", form:this.confirmAdmissionForm } })
    //         dialogRef.afterClosed().subscribe((confirmed: boolean) => {
    //           if (confirmed) {
    //             // this.router.navigateByUrl('/admin/admissions')
    //           }
    //         });
    // }
    // else {
    this.router.navigate(['/admin/enquiry/calculateFee/', enquiryId]);
    // }
  }

  multipleEnqForm = new FormGroup({
    enqArray: new FormControl([], [Validators.required]),
  });

  openDialog() {
    const dialogRef = this.dialog.open(EnquiryAddMultipleComponent, {
      disableClose: false,
      autoFocus: true,
      width: '40%',
      data: { form: this.multipleEnqForm },
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.getAllEnquiry(null);
      }
    });
  }
}
