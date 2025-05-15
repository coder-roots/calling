import { Component, OnInit, ViewChild } from '@angular/core';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { StudentService } from 'src/app/services/student/student.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { PAGELENGTH } from 'src/app/endpoints';
import { StudentAddComponent } from './student-add/student-add.component';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css']
})
export class StudentComponent implements OnInit {

  studentForm = new FormGroup({
    studentName: new FormControl('', Validators.required),
    company: new FormControl('', Validators.required),
    email: new FormControl('', Validators.required),
    personalContact: new FormControl('', Validators.required),
    parentsContact: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    fatherName: new FormControl('', Validators.required),
    _id: new FormControl('')
  })

  // studentName: { type: String, default: '' },
  //   email : { type: String, default : 0},
  //   personalContact : { type: String, default : ''},
  //   parentsContact : { type: String, default : ''},
  //   address :{type:String, default:''},
  //   fatherName:{type:String, default:''},

  search: string = ""
  displayedColumns: string[] = ['studentAutoId', 'studentName', 'email', 'personalContact', 'parentsContact', 'address', 'fatherName', 'college','company','createdAt', 'action']

  StudentResponse: Partial<any> = {}

  dataSource = new MatTableDataSource<any>([]);
  startpoint: Number = 0
  totalLoaded: Number = 0
  total: any = 0
  pageNo: Number = 0

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  companies:any = [];
  userType: any;
  company:any = null;

  constructor(private studentService: StudentService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.dataSource.data = []
    
    const userData = JSON.parse(sessionStorage.getItem('user_data') ?? '{}');
    this.userType = userData.data.userType;


    let companies = JSON.parse(sessionStorage.getItem('companies') ?? '[]');
    this.companies = companies;


    if (this.userType !== 1 && companies.length > 0) {
      this.company = companies[0];
    }

    this.getAllStudent(null);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator
  }

  getStudent(event: any) {
    if (event.target.value == "") {
      this.getAllStudent(null)
    }
  }

  getAllStudent(event: any) {
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

    if (!!this.company) {
      data['company'] = this.company;
    } else delete data['company'];

    if (this.totalLoaded == 0 || event == null || ((this.totalLoaded < this.total) && (event.pageIndex > this.pageNo))) {
      this.studentService.getAllStudent(data).subscribe({
        next: (result) => {
          this.spinner.hide()
          if (result.success) {
            this.StudentResponse = result
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
        this.studentService.deleteStudent({ _id: id }).subscribe({
          next: (v: any) => {
            var result = v
            if (result.success) {
              this.toastr.success(result.message, 'Success')
            }
            if (!result.success) {
              this.toastr.error(result.message, 'Error')
            }
            this.getAllStudent(null)
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
      this.studentForm.reset()
      this.studentForm.patchValue({ _id: undefined })
    }
    else {
      type = 'Update'
      this.studentForm.patchValue({
        studentName: data?.studentName,
        company: data?.company,
        email: data?.email,
        parentsContact: data?.parentsContact,
        personalContact: data?.personalContact,
        address: data?.address,
        fatherName: data?.fatherName,
        _id: data?._id
      })
    }
    const dialogRef = this.dialog.open(StudentAddComponent, { disableClose: false, autoFocus: true, width: '40%', data: { type: type, form: this.studentForm } })
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.getAllStudent(null)
      }
    });


  }
}
