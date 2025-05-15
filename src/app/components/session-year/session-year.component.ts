import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { SessionYearService } from 'src/app/services/sessionYear/session-year.service';
import { PAGELENGTH } from 'src/app/endpoints';
import { SessionYearAddComponent } from './session-year-add/session-year-add.component';
import { UserDataService } from '../../services/userData/user-data.service';


@Component({
  selector: 'app-session-year',
  templateUrl: './session-year.component.html',
  styleUrls: ['./session-year.component.css']
})
export class SessionYearComponent implements OnInit {

  sessionYearForm = new FormGroup({
    name: new FormControl('', Validators.required),
    isActive: new FormControl(false, Validators.required),
    _id: new FormControl('')
  })
  sessionYearList:any[]=[]
  search: string = ""
  displayedColumns: string[] = ['sessionYearAutoId', 'name', 'isActive', 'createdAt', 'addedBy','action']

  SessionYearResponse: Partial<any> = {}

  dataSource = new MatTableDataSource<any>([]);
  startpoint: Number = 0
  totalLoaded: Number = 0
  total: any = 0
  pageNo: Number = 0

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  constructor(private sessionYearService: SessionYearService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private route: ActivatedRoute, 
    private _userData :UserDataService) { }

  ngOnInit(): void {
    this.dataSource.data = []
    this.getAllSessionYear(null)
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator
  }

  getSessionYear(event: any) {
    if (event.target.value == "") {
      this.getAllSessionYear(null)
    }
  }

  getAllSessionYear(event: any) {
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
      this.sessionYearService.getAllSessionYear(data).subscribe({
        next: (result) => {
          this.spinner.hide()
          if (result.success) {
            this.SessionYearResponse = result
            this.total = result.total ?? 0
            this.dataSource.data = [...this.dataSource.data, ...(result.data || [])];
            // console.log(this.dataSource.data);
            this.sessionYearList = result.data
            this._userData.setSessionList(result.data)
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
        this.sessionYearService.deleteSessionYear({ _id: id }).subscribe({
          next: (v: any) => {
            var result = v
            if (result.success) {
              this.toastr.success(result.message, 'Success')
            }
            if (!result.success) {
              this.toastr.error(result.message, 'Error')
            }
            this.getAllSessionYear(null)
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

  openDialog(data: any) {
    var type = 'Add'
    if (data == "") {
      type = 'Add'
      this.sessionYearForm.reset()
      this.sessionYearForm.patchValue({ _id: undefined })
    }
    else {
      type = 'Update'
      this.sessionYearForm.patchValue({
        name: data?.name,
        _id: data?._id
      })
    }
    const dialogRef = this.dialog.open(SessionYearAddComponent, { disableClose: false, autoFocus: true, width: '40%', data: { type: type, form: this.sessionYearForm } })
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.getAllSessionYear(null)
      }
    });


  }


  changeStatus(event: any, id: any) {
    this.spinner.show()
    // console.log(event.checked);
    
    if(event.checked){
      this.sessionYearService.updateActiveStatus({ _id: id }).subscribe((result: any) => {
        this.spinner.hide()
        if (result.success) {
          this.toastr.success(result.message)
          this.getAllSessionYear(null)
        }
        else this.toastr.error(result.message)

      })
    }
    else{
      this.getAllSessionYear(null)
      this.toastr.error("Atleast One Session Should be active")
      this.spinner.hide()
    }
  }

}
