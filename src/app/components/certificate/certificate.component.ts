import { Component, ViewChild, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { PAGELENGTH } from 'src/app/endpoints';
import { CertificateService } from 'src/app/services/certificate/certificate.service';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { BASE_IMAGE_URL } from '../../endpoints';
import { AdmissionService } from 'src/app/services/admission/admission.service';
@Component({
  selector: 'app-certificate',
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.css']
})
export class CertificateComponent implements OnInit {

  
  displayedColumns: string[] = ['autoId', 'student', 'courses','college', 'collectedBy', 'givenBy', 'comments','admissionDate','createdAt', 'action']
  displayedColumnsForSheet: string[] = ['autoId', 'title', 'comments','total',"createdAt", 'action']

  CertificateResponse: Partial<any> = {}

  dataSource1 = new MatTableDataSource<any>([]);
  startpoint1: Number = 0
  totalLoaded1: Number = 0
  total1: any = 0
  pageNo1: Number = 0
  @ViewChild('paginator1')
  paginator1!: MatPaginator;

  dataSource2 = new MatTableDataSource<any>([]);
  startpoint2: Number = 0
  totalLoaded2: Number = 0
  total2: any = 0
  pageNo2: Number = 0
  @ViewChild('paginator2')
  paginator2!: MatPaginator;

  start:any
  end:any
  tabIndex:any = 0
  tabChange(evt:any){
    this.dataSource1.data = []
    this.dataSource2.data = []
    this.tabIndex = evt.index
    sessionStorage.setItem('certificateTab', this.tabIndex)
    this.dateObj()
    // console.log("tabChange called");
    
  }
  constructor(private certificateService: CertificateService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private admissionService: AdmissionService) {
      if(sessionStorage.getItem('certificateTab')!=null) this.tabIndex = parseInt(sessionStorage.getItem('certificateTab') ?? '')
      else this.tabIndex = 0
     }

  ngOnInit(): void {
   
    this.end = this.obj.endDate = new Date()
    this.start = this.obj.startDate = new Date(new Date().setDate(this.obj.endDate.getDate() - 10));
    this.dateObj()
  }

  ngAfterViewInit(): void {
    this.dataSource1.paginator = this.paginator1
    this.dataSource2.paginator = this.paginator2
  }

  downloadFormat(data:any){
    window.open(BASE_IMAGE_URL+data)
  }

  obj:any = {}

  makeObj(){
    this.obj = {}
    this.obj.startDate = new Date(this.start.setDate(this.start.getDate()));
    this.obj.endDate = new Date(this.end.setDate(this.end.getDate()));
    
    // console.log("Certificate date Search Obj",this.obj)

    if(this.tabIndex == 0){
      this.getAllCertificate(null)
    }
    if(this.tabIndex == 1){
      this.getAllCertificateSheet(null)
    }
  }

  dateObj(){
    if(!!this.start && !!this.end){
      this.obj.startDate = this.start
      this.obj.endDate = this.end
      if(this.tabIndex == 0){
        this.getAllCertificate(null)
      }
      if(this.tabIndex == 1){
        this.getAllCertificateSheet(null)
      }
    }
  }

  getAllCertificate(event: any) {
    
    this.spinner.show()   

    if (event == null) {
      this.startpoint1 = 0
      this.dataSource1.data = []
    }

      this.obj.startpoint = this.startpoint1

    if (this.totalLoaded1 == 0 || event == null || ((this.totalLoaded1 < this.total1) && (event.pageIndex > this.pageNo2))) {
      this.certificateService.getAllCertificate(this.obj).subscribe({
        next: (result) => {
          this.spinner.hide()
          if (result.success) {
            this.total1 = result.total ?? 0
            this.dataSource1.data = [...this.dataSource1.data, ...(result.data || [])];
            // console.log(this.dataSource1.data);
            
            this.totalLoaded1 = this.dataSource1.data.length
            this.startpoint1 = this.totalLoaded1
            this.pageNo1 = this.paginator1?.pageIndex
            setTimeout(() => {
              this.paginator1.length = this.total1;    
              this.paginator1.pageSize = PAGELENGTH;
              this.paginator1._changePageSize
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

  getAllCertificateSheet(event:any){
    this.spinner.show()   

    if (event == null) {
      this.startpoint1 = 0
      this.dataSource1.data = []
    }
    this.obj.startpoint = this.startpoint2

      if (this.totalLoaded2 == 0 || event == null || ((this.totalLoaded2 < this.total2) && (event.pageIndex > this.pageNo2))) {
        this.certificateService.getAllCertificateSheet(this.obj).subscribe({
          next: (result) => {
            this.spinner.hide()
            if (result.success) {
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

  openDeleteDialog(id: any, type:any) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, { disableClose: false, data: { 'message': 'Are you sure, you really want to delete it?' } })
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.spinner.show()

        if(type=='certificate'){
          this.certificateService.deleteCertificate({ _id: id }).subscribe({
            next: (v: any) => {
              var result = v
              if (result.success) {
                this.toastr.success(result.message, 'Success')
              }
              if (!result.success) {
                this.toastr.error(result.message, 'Error')
              }
              this.getAllCertificate(null)
            },
            error: (e) => {
              this.spinner.hide()
              this.toastr.error(e.error.message)
            },
            complete: () => { this.spinner.hide() }
          })
        }
        else{
          this.certificateService.deleteCertificateSheet({ _id: id }).subscribe({
            next: (v: any) => {
              var result = v
              if (result.success) {
                this.toastr.success(result.message, 'Success')
              }
              if (!result.success) {
                this.toastr.error(result.message, 'Error')
              }
            this.getAllCertificateSheet(null)
            },
            error: (e) => {
              this.spinner.hide()
              this.toastr.error(e.error.message)
            },
            complete: () => { this.spinner.hide() }
          })
        }
      }
    });
  }

  completeAdmission(id:any){
    const dialogRef = this.dialog.open(DeleteDialogComponent, { disableClose: false, data: { 'message': 'Are you sure, you really want to complete admssion?' } })
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.spinner.show()
        this.admissionService.updateAdmission({ _id: id, isActive:'false' }).subscribe({
          next: (v: any) => {
            var result = v
            if (result.success) {
              this.toastr.success(result.message, 'Success')
            }
            if (!result.success) {
              this.toastr.error(result.message, 'Error')
            }
            this.getAllCertificate(null)
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
