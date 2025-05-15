import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BASE_IMAGE_URL, PAGELENGTH } from 'src/app/endpoints';
import { CourseService } from 'src/app/services/course/course.service';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit {

  search: string = ""
  displayedColumns: string[] = ['courseAutoId', 'image',  'name', 'fee', 'minimumRegistrationFee', 'duration' ,'createdAt', 'action']

  CourseResponse: Partial<any> = {}

  dataSource = new MatTableDataSource<any>([]);
  startpoint: Number = 0
  totalLoaded: Number = 0
  total: any = 0
  pageNo: Number = 0

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  constructor(private courseService: CourseService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private sanitizer:DomSanitizer) { }

  ngOnInit(): void {
    this.dataSource.data = []
    this.getAllCourse(null)
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator
  }

  getImageUrl(path:any){
    return BASE_IMAGE_URL+path
  }

  getCourse(event: any) {
    if (event.target.value == "") {
      this.getAllCourse(null)
    }
  }

  getAllCourse(event: any) {
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
      this.courseService.getAllCourse(data).subscribe({
        next: (result) => {
          this.spinner.hide()
          if (result.success) {
            this.CourseResponse = result
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
        this.courseService.deleteCourse({ _id: id }).subscribe({
          next: (v: any) => {
            var result = v
            if (result.success) {
              this.toastr.success(result.message, 'Success')
            }
            if (!result.success) {
              this.toastr.error(result.message, 'Error')
            }
            this.getAllCourse(null)
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
