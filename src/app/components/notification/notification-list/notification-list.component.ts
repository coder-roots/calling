import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BASE_IMAGE_URL, PAGELENGTH } from 'src/app/endpoints';
import { AllNotificationResponse, Notification } from 'src/app/models/NotificationResponse';
import { NotificationService } from 'src/app/services/notification/notification.service';
@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.css']
})
export class NotificationListComponent implements OnInit {
  filterForm = new FormGroup({
    startDate: new FormControl(''),
    endDate: new FormControl('')
  })
  addNotificationForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    isImage: new FormControl(false),
    notification_image: new FormControl()
  })

  orgNotificationForm = this.addNotificationForm.value

  displayNotification = 'none'
  singleNotificationData: any = ''
  search: string = ""
  displayedColumns: string[] = ['autoId', 'title', 'description', 'image', 'system', 'createdAt', 'action']
  categoryResponse: Partial<AllNotificationResponse> = {}
  BaseUrl = BASE_IMAGE_URL
  dataSource = new MatTableDataSource<Notification>([]);
  startpoint: Number = 0
  totalLoaded: Number = 0
  total: any = 0
  pageNo: Number = 0

  acceptedImage = ['image/webp']
  imageSrc = ''
  imageFile: any = ''
  imageError: boolean = false
  isFileChosen: boolean = false
  @ViewChild('inputOFiles') inputFiles: ElementRef = {} as ElementRef;
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  constructor(private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private notificationService: NotificationService,
    private trusturl: DomSanitizer,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.filterForm.patchValue({ startDate: moment(new Date()).format('YYYY-MM-DD'), endDate: moment(new Date()).format('YYYY-MM-DD') })
    this.dataSource.data = []
    this.getAllNotifications(null)
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator
  }

  public getSanitizeUrl(url: string) {
    return this.trusturl.bypassSecurityTrustUrl(this.BaseUrl + url)
  }

  getNotification(event: any) {
    if (event.target.value == "") {
      this.getAllNotifications(null)
    }
  }

  getAllNotifications(event: any) {
    // console.log("paginator is ", this.paginator)

    if (event == null) {
      this.startpoint = 0
      this.dataSource.data = []
    }
    let data: any = { startpoint: this.startpoint }
    if (!!this.search) {
      data.search = this.search
    }
    if (!!this.filterForm.value.startDate && !!this.filterForm.value.endDate) {
      data.startDate = moment(this.filterForm.value.startDate).format('YYYY-MM-DD')
      data.endDate = moment(this.filterForm.value.endDate).format('YYYY-MM-DD')
    }

    if (Object.keys(data).length > 2) {
      this.spinner.show()
      if (this.totalLoaded == 0 || event == null || ((this.totalLoaded < this.total) && (event.pageIndex > this.pageNo))) {
        this.notificationService.getAllNotifications(data).subscribe({
          next: (result) => {
            this.spinner.hide()
            if (result.success) {
              this.categoryResponse = result
              this.total = result.total ?? 0
              this.dataSource.data = [...this.dataSource.data, ...(result.data || [])];
              this.totalLoaded = this.dataSource.data.length
              this.startpoint = this.totalLoaded
              this.pageNo = this.paginator?.pageIndex
              setTimeout(() => {
                this.paginator.length = this.total;
                this.paginator.pageSize = PAGELENGTH;
                this.paginator._changePageSize
              }, 10)

            }else{
              this.toastr.error(result.message, 'Error')
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


  }




  addNotification() {
    if (this.addNotificationForm.value.isImage === true && (this.addNotificationForm.value.notification_image == null || this.addNotificationForm.value.notification_image == undefined || this.addNotificationForm.value.notification_image == '')) {
      this.toastr.error('Please provide image.', 'Error')
      return
    }
    this.spinner.show()
    let formdata = new FormData()
    formdata.append('data', JSON.stringify(this.addNotificationForm.value))
    if (this.addNotificationForm.value.isImage === true){
      formdata.append('notification_image', (this.addNotificationForm.value.notification_image))
    }
    this.notificationService.addNotification(formdata).subscribe((result: any) => {
      this.spinner.hide()
      if (result.success) {
        this.toastr.success(result.message, 'Success')
        this.displayNotification = 'none'
        this.addNotificationForm.reset(this.orgNotificationForm)
        this.getAllNotifications(null)
      }
      else this.toastr.error(result.message, 'Error')
    })
  }
  showCurrentNotification(i: any) {
    this.singleNotificationData = this.dataSource.data[i]
  }
  showAddModal() {
    //event.stopPropagation();
    this.displayNotification = 'block'
  }
  stop(event: any) {
    event.stopPropagation()
  }
  fileSelected(event: any) {

    this.imageError = false
    const reader = new FileReader();
    const max_height = 250;
    const max_width = 250;
    // console.log(event.target.files[0])
    if (!(this.acceptedImage.includes(event.target.files[0]['type']))) {
      this.imageError = true
      this.isFileChosen = false
      this.toastr.error('Please provide image having extension webp', 'Error')
      this.resetOtherFileInput()
      return
    }
    if (event.target.files[0]['size'] > 2097152) {
      this.imageError = true
      this.isFileChosen = false
      this.toastr.error('Please provide an image having size less than 2 mb')
      this.resetOtherFileInput()
      return
    }
    const [file] = event.target.files;

    reader.readAsDataURL(file);

    reader.onload = (e: any) => {
      // this.url = e.target.result;
      this.isFileChosen = true
      this.imageSrc = reader.result as string;
      const image = new Image();
      image.src = e.target.result;
      image.onload = (rs: any) => {

        const img_height = rs.currentTarget['height'];
        const img_width = rs.currentTarget['width'];
        //console.log(img_height, img_width);
        // if (img_height != max_height || img_width != max_width) {
        //   this.imageError = true
        //   this.isFileChosen = false
        //   this.toastr.error('Dimentions allowed ' +
        //     max_width +
        //     ' X ' +
        //     max_height +
        //     'px', 'Error')
        //   return;
        // } else {
        //   this.imageError = false
        //   this.addNotificationForm.patchValue({
        //     notification_image: event.target.files[0]
        //   })
        // }
        this.imageError = false
        this.addNotificationForm.patchValue({
          notification_image: event.target.files[0]
        })
      }
    }
  }

  resetOtherFileInput() {
    this.inputFiles.nativeElement.value = '';
  }
}
