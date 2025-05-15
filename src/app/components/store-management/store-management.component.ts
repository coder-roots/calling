import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { StoreItemService } from '../../services/storeItem/store-item.service';
import { MatPaginator } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { PAGELENGTH } from '../../endpoints';
import { ItemAddComponent } from './item-add/item-add.component';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-store-management',
  templateUrl: './store-management.component.html',
  styleUrls: ['./store-management.component.css']
})
export class StoreManagementComponent implements OnInit {

  storeItemForm = new FormGroup({
    itemType: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    quantity: new FormControl(0, Validators.required),
    inUse: new FormControl("0"),
    comments: new FormControl(''),
    issueDate: new FormControl(''),
    submitDate: new FormControl(''),
    assignedTo: new FormControl(''),
    labId: new FormControl(''),
    _id: new FormControl('')
  })

  search: string = ""
  displayedColumns0: string[] = ['storeItemAutoId','name', 'quantity', 'issueDate', 'submitDate', 'assignedTo','labId','comments', 'createdAt', 'action']
  displayedColumns1: string[] = ['storeItemAutoId','name', 'quantity','labId','comments', 'createdAt', 'action']
  displayedColumns2: string[] = ['storeItemAutoId','name', 'quantity', 'inUse','comments', 'createdAt', 'action']

  StoreItemResponse: Partial<any> = {}

  allItems:any[] = []

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

  dataSource3 = new MatTableDataSource<any>([]);
  startpoint3: Number = 0
  totalLoaded3: Number = 0
  total3: any = 0
  pageNo3: Number = 0
  @ViewChild('paginator3')
  paginator3!: MatPaginator;

  constructor(private storeItemService:StoreItemService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
   
    if(this.tabIndex == 0) this.getAllHardware(null) 
    if(this.tabIndex == 1) this.getAllMaterial(null) 
    if(this.tabIndex == 2) this.getAllKitchen(null) 
  }

  ngAfterViewInit(): void {
    this.dataSource1.paginator = this.paginator1
    this.dataSource2.paginator = this.paginator2
    this.dataSource3.paginator = this.paginator3
  }

  // getStoreItem(event: any) {
  //   if (event.target.value == "") {
  //     this.getAllStoreItem(null)
  //   }
  // }

  tabIndex:number = 0
  tabChange(evt:any){
    // console.log(evt);
    this.dataSource1.data = [] 
    this.dataSource2.data = [] 
    this.dataSource3.data = []
    this.tabIndex=evt.index
    if(evt.index == 0)
      this.getAllHardware(null)
    if(evt.index == 1)
    this.getAllMaterial(null)
    if(evt.index == 2)
    this.getAllKitchen(null)
  }

  
  getAllHardware(event: any) {
    // console.log("paginator is ", this.paginator)
    let obj:any= {}
    this.spinner.show()   
    if (event == null) {
      this.startpoint1 = 0
      this.dataSource1.data = []
    }

    obj.startpoint = this.startpoint1
    obj.itemType='Hardware'

    if (this.totalLoaded1 == 0 || event == null || ((this.totalLoaded1 < this.total1) && (event.pageIndex > this.pageNo1))) {
      this.storeItemService.getAllStoreItem(obj).subscribe({
        next: (result) => {
          this.spinner.hide()
          if (result.success) {
            this.StoreItemResponse = result
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
  
  getAllMaterial(event: any) {
    // console.log("paginator is ", this.paginator)
    let obj:any= {}
    this.spinner.show()   
    if (event == null) {
      this.startpoint2 = 0
      this.dataSource2.data = []
    }

    obj.startpoint = this.startpoint2
    obj.itemType='Material'

    if (this.totalLoaded2 == 0 || event == null || ((this.totalLoaded2 < this.total2) && (event.pageIndex > this.pageNo2))) {
      this.storeItemService.getAllStoreItem(obj).subscribe({
        next: (result) => {
          this.spinner.hide()
          if (result.success) {
            this.StoreItemResponse = result
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
  
  getAllKitchen(event: any) {
    // console.log("paginator is ", this.paginator)
    let obj:any= {}
    this.spinner.show()   
    if (event == null) {
      this.startpoint3 = 0
      this.dataSource3.data = []
    }

    obj.startpoint = this.startpoint3
    obj.itemType='Kitchen'

    if (this.totalLoaded3 == 0 || event == null || ((this.totalLoaded3 < this.total3) && (event.pageIndex > this.pageNo3))) {
      this.storeItemService.getAllStoreItem(obj).subscribe({
        next: (result) => {
          this.spinner.hide()
          if (result.success) {
            this.StoreItemResponse = result
            this.total3 = result.total ?? 0
            this.dataSource3.data = [...this.dataSource3.data, ...(result.data || [])];
            // console.log(this.dataSource3.data);
            this.totalLoaded3 = this.dataSource3.data.length
            this.startpoint3 = this.totalLoaded3
            this.pageNo3 = this.paginator3?.pageIndex
            setTimeout(() => {
              this.paginator3.length = this.total3;    
              this.paginator3.pageSize = PAGELENGTH;
              this.paginator3._changePageSize
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
        this.storeItemService.deleteStoreItem({ _id: id }).subscribe({
          next: (v: any) => {
            var result = v
            if (result.success) {
              this.toastr.success(result.message, 'Success')
            }
            if (!result.success) {
              this.toastr.error(result.message, 'Error')
            }
            if(this.tabIndex == 0) this.getAllHardware(null) 
            if(this.tabIndex == 1) this.getAllMaterial(null) 
            if(this.tabIndex == 2) this.getAllKitchen(null)
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
    // console.log("Data", data);
    
    var type = 'Add'
    if (data == "") {
      type = 'Add'
      this.storeItemForm.reset()
      let itemType = ''
      if(this.tabIndex == 0) itemType = "Hardware"
      if(this.tabIndex == 1) itemType = "Material"
      if(this.tabIndex == 2) itemType = "Kitchen"
      this.storeItemForm.patchValue({ _id: undefined, itemType: itemType})
    }
    else {
      type = 'Update'
      // console.log("_id", data._id);
      
      this.storeItemForm.patchValue({
        itemType: data?.itemType,
        name: data?.name,
        quantity: data?.quantity,
        inUse: data?.inUse,
        comments: data?.comments,
        issueDate: data?.issueDate,
        submitDate: data?.submitDate,
        assignedTo: data?.assignedTo,
        labId: data?.labId?._id,
        _id: data?._id
      })
      // console.log("Form", this.storeItemForm.value);
      
    }
    const dialogRef = this.dialog.open(ItemAddComponent, { disableClose: false, autoFocus: true, width: '40%', data: { type: type, form: this.storeItemForm } })
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {

        if(this.tabIndex == 0) this.getAllHardware(null) 
        if(this.tabIndex == 1) this.getAllMaterial(null) 
        if(this.tabIndex == 2) this.getAllKitchen(null)
      }
    });


  }

}



