import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BASE_IMAGE_URL, PAGELENGTH } from 'src/app/endpoints';
import { EmployeeService } from 'src/app/services/employee/employee.service';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { EmployeeAddMultipleDialogComponent } from './employee-add-multiple-dialog/employee-add-multiple-dialog.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {

  search: string = ""
  displayedColumns: string[] = ['employeeAutoId', 'image', 'name', 'email', 'contact', 'jobTitle', 'joiningDate', 'status', 'action']

  EmployeeResponse: Partial<any> = {}

  dataSource = new MatTableDataSource<any>([]);
  startpoint: Number = 0
  totalLoaded: Number = 0
  total: any = 0
  pageNo: Number = 0

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  constructor(private employeeService: EmployeeService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.dataSource.data = []
    this.getAllEmployee(null)
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator
  }

  getImageUrl(path: any) {
    return BASE_IMAGE_URL + path
  }

  getEmployee(event: any) {
    if (event.target.value == "") {
      this.getAllEmployee(null)
    }
  }

  getAllEmployee(event: any) {
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
      this.employeeService.getAllEmployee(data).subscribe({
        next: (result) => {
          this.spinner.hide()
          if (result.success) {
            this.EmployeeResponse = result
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
        this.employeeService.deleteEmployee({ _id: id }).subscribe({
          next: (v: any) => {
            var result = v
            if (result.success) {
              this.toastr.success(result.message, 'Success')
            }
            if (!result.success) {
              this.toastr.error(result.message, 'Error')
            }
            this.getAllEmployee(null)
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

  changeEmployeeStatus(event: any, id: any) {
    this.spinner.show()
    this.employeeService.changeStatusEmployee({ _id: id, status: event.checked }).subscribe((result: any) => {
      this.spinner.hide()
      if (result.success) {
        this.toastr.success(result.message)

        this.getAllEmployee(null)
      }
      else this.toastr.error(result.message)

    })
  }

  multipleEmpForm = new FormGroup({
    empArray:new FormControl([], [Validators.required])
  })

  openDialog(){
    const dialogRef = this.dialog.open(EmployeeAddMultipleDialogComponent, { disableClose: false, autoFocus: true, width: '40%', data: { form: this.multipleEmpForm } })
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.getAllEmployee(null)
      }
    });
  }


}
