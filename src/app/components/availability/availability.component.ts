import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BatchService } from 'src/app/services/batch/batch.service';

@Component({
  selector: 'app-availability',
  templateUrl: './availability.component.html',
  styleUrls: ['./availability.component.css']
})
export class AvailabilityComponent implements OnInit {
  batchList: any[] = []
  displayedColumns: string[] = []
  dataSource = new MatTableDataSource<any>([]);
  total: any
  labList: any[] = []
  width: any
  constructor(
    private batchService: BatchService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {

  }

  ngOnInit(): void {
    this.labList = JSON.parse(sessionStorage.getItem('labs') ?? '')
    // console.log(this.labList);
    let width = 100 / this.labList.length
    this.width = width + "%"
    this.displayedColumns = this.labList.map((x: any) => { return x.name })
    this.getAllBatch()
  }


  getAllBatch() {
    // console.log("paginator is ", this.paginator)
    this.spinner.show()

    let data: any = {
      isComplete: false,
      removeSession: 'true'
    }

    this.batchService.getAllBatch(data).subscribe({
      next: (result) => {
        this.spinner.hide()
        if (result.success) {
          // this.batchList = result.data.filter((x:any)=>{
          //   return x.isComplete == false
          // })
          this.batchList = result.data
          // console.log("batchList",this.batchList);
          this.total = result.total ?? 0
          this.getBatches()
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

  }

  arrays: any[] = []
  getBatches() {
    // let obj:any = {}
    // for(let x of this.labList){
    //   obj[x.name] = {}
    // }
    // console.log(obj);

    let arr: any[] = []
    for (let x of this.labList) {
      arr = this.batchList
        .filter((element: any) => element.labId._id == x._id)
        .sort((a: any, b: any) => this.extractTime(a.timeSlotId.slot) - this.extractTime(b.timeSlotId.slot));

      this.arrays.push(arr.length ? arr : [{ status: "Available" }]); // Ensure availability entry
    }


    // for (let array of this.arrays) {
    //   if (array.length == 0) {

    //     array.push({ status: "Available" })
    //   }
    // }

    // console.log(this.arrays);
    // console.log(this.arrays[2][1]);

  }
  extractTime(slot: string): number {
    if (!slot) return 0; // Handle empty slot case

    let timePart = slot.split(/ to | - /)[0]; // Extract "9 am" or "10 am"
    let [hour, meridian] = timePart.split(" "); // Split into [9, "am"]

    let hours = parseInt(hour);
    if (meridian.toLowerCase() === "pm" && hours !== 12) {
      hours += 12;
    } else if (meridian.toLowerCase() === "am" && hours === 12) {
      hours = 0; // Convert "12 am" to "00"
    }

    return hours;
  }
}
