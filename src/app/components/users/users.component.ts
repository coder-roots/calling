import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { PAGELENGTH } from 'src/app/endpoints';
import { UserResponse, Users } from 'src/app/models/UserResponse';
import { UserServiceService } from 'src/app/services/userService/user-service.service';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  search: string = ""
  search1: string = ""

  displayedColumns: string[] = ['autoId', 'name', 'email', 'phone', 'role', 'status', 'action']
  displayedColumnsUser: string[] = ['autoId', 'name', 'email','companies', 'phone', 'role', 'status', 'action']

  userResponse: Partial<UserResponse> = {}
  authorResponse: Partial<UserResponse> = {}
  selected = new FormControl(0);
  userType: Number = 2

  singleUserData: any;
  isAnyMediaLink = false

  tabs = ['Authors', 'Others']
  dataSource = new MatTableDataSource<Users>([]);
  dataSourceUser = new MatTableDataSource<Users>([]);
  startpoint: Number = 0
  totalLoaded: Number = 0
  total: any = 0
  pageNo: Number = 0

  startpointUser: Number = 0
  totalLoadedUser: Number = 0
  totalUser: any = 0
  pageNoUser: Number = 0


  @ViewChild('paginator1', { read: MatPaginator })
  paginator1!: MatPaginator;

  ngAfterViewInit(): void {

    this.dataSourceUser.paginator = this.paginator1
  }

  constructor(private userService: UserServiceService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private dialog: MatDialog, private route: ActivatedRoute) { }

  ngOnInit(): void {

    this.dataSource.data = []
    this.dataSourceUser.data = []
    this.getAllUsers(null)
  }

  getUser(event: any) {
    if (event.target.value == "") {
      this.getAllUsers(null)
    }
  }

  getAllUsers(event: any) {

    this.spinner.show()
    if (event == null) {
      this.startpoint = 0
      this.dataSourceUser.data = []
    }
    let data: any = {}
    if (!!this.search1) {
      data = {
        startpoint: this.startpoint,
        search: this.search1,
        userType: 2
      }
    } else {
      data = {
        startpoint: this.startpoint,
        userType: 2
      }
    }

    if (this.totalLoaded == 0 || event == null || ((this.totalLoaded < this.total) && (event.pageIndex > this.pageNo))) {
      this.userService.getAllUsers(data).subscribe({
        next: (result) => {
          this.spinner.hide()
          if (result.success) {
            this.userResponse = result
            this.total = result.total ?? 0
            this.dataSourceUser.data = [...this.dataSourceUser.data, ...(result.data || [])];
            this.totalLoaded = this.dataSourceUser.data.length
            this.startpoint = this.totalLoaded
            this.pageNo = this.paginator1?.pageIndex
            setTimeout(() => {
              this.paginator1.length = this.total;
              this.paginator1.pageSize = PAGELENGTH;
              this.paginator1._changePageSize
            }, 10)
          } else {
            this.toastr.error(result.message, 'Error')
          }

        },
        error: (e) => {
          this.spinner.hide()
          this.toastr.error(e)

        }
      })
    } else this.spinner.hide()

  }

  // getUserType(event: any) {
  //   this.selected.setValue = event
  //   // console.log("event is ", event)
  //   if (event == 0) this.userType = 2
  //   if (event == 1) this.userType = 4
  //   this.search = ""
  //   this.search1 = ""
  //   this.getAllUsers(null)
  // }

  changeUserStatus(event: any, id: any, index: any) {
    console.log("seelcted is ", this.selected.value)
    this.spinner.show()
    this.userService.enableDisableUser({ _id: id, isBlocked: event.checked }).subscribe((result: any) => {
      this.spinner.hide()
      if (result.success) {
        this.toastr.success(result.message)
        if (index == 0) this.userType = 2
        if (index == 1) this.userType = 4

        // this.selected.patchValue(index)
        // this.selected.setValue(index)
        this.getAllUsers(null)
      }
      else this.toastr.error(result.message)

    })
  }


  openDeleteDialog(id: any, index: any) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, { data: { 'message': 'Are you sure, you really want to delete it?' } })
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.spinner.show()
        this.userService.deleteUsers({ _id: id }).subscribe({
          next: (v: any) => {
            var result = v
            if (result.success) {
              this.toastr.success(result.message, 'Success')
            }
            if (!result.success) {
              this.toastr.error(result.message, 'Error')
            }

            this.getAllUsers(null)
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

  sendUserData(data: any) {
    this.singleUserData = data
    this.isAnyMediaLink = !(Object.values(data?.socialLinks).every(x => x === null || x === ''));
    // console.log("user data is ", this.isAnyMediaLink)
  }

}
