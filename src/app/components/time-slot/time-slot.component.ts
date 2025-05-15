import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { PAGELENGTH } from 'src/app/endpoints';
import { TimeSlotService } from 'src/app/services/timeSlot/time-slot.service';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { TimeSlotAddComponent } from '../timeSlot/time-slot-add/time-slot-add.component';

@Component({
  selector: 'app-time-slot',
  templateUrl: './time-slot.component.html',
  styleUrls: ['./time-slot.component.css']
})
export class TimeSlotComponent implements OnInit {

  timeSlotForm = new FormGroup({
    slot: new FormControl('', Validators.required),
    _id: new FormControl('')
  })

  search: string = ""
  displayedColumns: string[] = ['timeSlotAutoId', 'slot', 'createdAt', 'action']

  TimeSlotResponse: Partial<any> = {}

  dataSource = new MatTableDataSource<any>([]);
  startpoint: Number = 0
  totalLoaded: Number = 0
  total: any = 0
  pageNo: Number = 0

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  constructor(private timeSlotService: TimeSlotService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.dataSource.data = []
    this.getAllTimeSlot(null)
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator
  }

  getTimeSlot(event: any) {
    if (event.target.value == "") {
      this.getAllTimeSlot(null)
    }
  }

  getAllTimeSlot(event: any) {
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
      this.timeSlotService.getAllTimeSlot(data).subscribe({
        next: (result) => {
          this.spinner.hide()
          if (result.success) {
            this.TimeSlotResponse = result
            this.total = result.total ?? 0
            this.dataSource.data = [...this.dataSource.data, ...(result.data || [])];
            console.log(this.dataSource.data);
            
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
        this.timeSlotService.deleteTimeSlot({ _id: id }).subscribe({
          next: (v: any) => {
            var result = v
            if (result.success) {
              this.toastr.success(result.message, 'Success')
            }
            if (!result.success) {
              this.toastr.error(result.message, 'Error')
            }
            this.getAllTimeSlot(null)
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
      this.timeSlotForm.reset()
      this.timeSlotForm.patchValue({ _id: undefined })
    }
    else {
      type = 'Update'
      this.timeSlotForm.patchValue({
        slot: data?.slot,
        _id: data?._id
      })
    }
    const dialogRef = this.dialog.open(TimeSlotAddComponent, { disableClose: false, autoFocus: true, width: '40%', data: { type: type, form: this.timeSlotForm } })
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.getAllTimeSlot(null)
      }
    });


  }

}
