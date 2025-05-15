import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { read, utils } from 'xlsx';
import * as fs from 'file-saver';
import * as Excel from 'exceljs';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { CallService } from 'src/app/services/call/call.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { CallHistoryComponent } from './call-history/call-history.component';
import { UserDataService } from '../../../services/userData/user-data.service';
import { BASE_IMAGE_URL } from '../../../endpoints';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-call-sheet-add',
  templateUrl: './call-sheet-add.component.html',
  styleUrls: ['./call-sheet-add.component.css']
})
export class CallSheetAddComponent implements OnInit {

  fileName: any = ''
  type: string = "Add"
  id: any = ''
  
  displayedColumns: string[] = ['srNo', 'rollNo', 'studentName','contactNo','callerName', 'callDate', 'callStatus' ,'action']
  dataSource = new MatTableDataSource<any>([]);

  callSheetForm = new FormGroup({
    comments: new FormControl('', Validators.required),
    collegeId: new FormControl('', [Validators.required]),
    semester: new FormControl("", [Validators.required]),
    course: new FormControl('', [Validators.required]),
    sheetDate: new FormControl(new Date(), [Validators.required]),
    // attachment: new FormControl(null),
    students:new FormControl(''),
    _id: new FormControl(''),
    company: new FormControl(''),
  })

  collegeList: any = []

  selectFormControl = new FormControl();
  searchTextboxControl = new FormControl();
  selectedValues: any = [];

  filteredOptions: Observable<any[]> | undefined;
  @ViewChild('search') searchTextBox: ElementRef = {} as ElementRef;


  data: any[] = [
    { 'name': '' }   
  ]

  _id: any
  callSheetData: any
  callDate:any
  callStatus:any
  callerName:any = ""
  showTable:boolean = false
  constructor(private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private callService: CallService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog:MatDialog,
    private userDataService:UserDataService,
    private datepipe:DatePipe
  ) {
    this.collegeList = JSON.parse(sessionStorage.getItem('colleges') ?? '')
    this.callDate = Date.now()
    this.callerName = userDataService.getData()?.data?.name
  }

  companies:any = [];
  ngOnInit(): void {
    this.dataSource.data = []
    this.route.paramMap.subscribe(param => {
      this.id = param.get('id') ?? ""
      this.type = this.id == "" ? 'Add' : 'Update'
      if (this.type == 'Update') {
        this.getSingleCallSheet()
      }
    })
    let companies = JSON.parse(sessionStorage.getItem('companies')??'');
    if(companies.length==1) {
        this.callSheetForm.patchValue({company: companies[0]})
    }
    this.companies = companies;
  }

  downloadFormat(){
    return BASE_IMAGE_URL+"excelSheet/CallingSheetFormat.xlsx"
  }


  stuArray: any[] = []
  uploadFile(event: any) {
    this.stuArray = []
    const files = event.target.files
    if (files.length) {
      const file = files[0]
      this.fileName= file.name
      const reader = new FileReader()
      reader.onload = (event: any) => {
        const wb = read(event.target.result)
        const sheets = wb.SheetNames
        if (sheets.length) {
          const rows = utils.sheet_to_csv(wb.Sheets[sheets[0]])
          let sheetData: any;
          sheetData = rows
          // console.log("Students CSV",sheetData);

          let lines = sheetData.split('\n')
          // console.log("Split ", lines);

          var headers = lines[0].split(",");
          
          for (var i = 1; i < lines.length; i++) {
            let obj:any = {};
            let currentline = lines[i].split(",");
            if(!currentline[0])
              continue
            for (let j = 0; j < headers.length; j++) {
              obj[headers[j]] = currentline[j];
            }
            this.stuArray.push(obj);
          }
          // console.log("array",this.stuArray);
          

        }
      }
      reader.readAsArrayBuffer(file)
    }


  }



  getSingleCallSheet() {
    this.spinner.show()
    this.callService.singleCallSheet({ _id: this.id }).subscribe({
      next: (v: any) => {
        var result = v
        this.spinner.hide()
        if (result.success) {
          this.callSheetData = v.data
          this.callSheetForm.patchValue({
            _id: v.data?._id,
            collegeId: v.data?.collegeId._id,
            course: v.data?.course,
            comments: v.data?.comments,
            sheetDate: v.data?.sheetDate,
            company: v.data?.company,
            semester: v.data?.semester.toString()
            // attachment
          })
          this.getCallSheetDetail(this.id)
          this.showTable= true

        }
        else {
          this.toastr.error(v.message, 'Error')
          this.spinner.hide()
        }
      },
      error: (e) => {
        this.spinner.hide()
        this.toastr.error(e.error.message)
      },
      complete: () => { this.spinner.hide() }
    })
  }

  getCallSheetDetail(callSheetId:any){
    this.callService.getAllCallSheetDetail({ callSheetId: callSheetId }).subscribe({
      next: (v: any) => {
        var result = v
        if (result.success) {
          this.dataSource.data = v.data
          this.tableData = v.data
        }
        else {
          this.toastr.error(v.message, 'Error')
        }
      },
      error: (e) => {
        this.spinner.hide()
        this.toastr.error(e.error.message)
      },
      complete: () => { this.spinner.hide() }
    })
  }

  submit() {
    this.spinner.show()
    // let apiData = new FormData()
    // apiData.append("collegeId", this.callSheetForm.value.collegeId ?? '')
    // apiData.append("course", this.callSheetForm.value.course ?? '')
    // apiData.append("semester", this.callSheetForm.value.semester ?? '')
    // apiData.append("sheetDate", this.callSheetForm.value.sheetDate ?? '')
    // apiData.append("comments", this.callSheetForm.value.comments ?? '')
    // if (this.callSheetForm.value.attachment != null) {
    //   apiData.append("attachment", this.callSheetForm.value.attachment ?? '')
    //   console.log(apiData);
    // }
    // else this.toastr.error("Upload File")


    if (this.type == 'Add') {
      this.callSheetForm.patchValue({students:JSON.stringify(this.stuArray) })
        this.callService.addCallSheet(this.callSheetForm.value).subscribe({
          next: (v: any) => {
            this.spinner.hide()
            if (v.success) {
              this.toastr.success(v.message, 'Success')
              // this.router.navigateByUrl('/admin/callSheets')
              this.dataSource.data = v.callSheetDetail
              this.id = v.data._id
              this.showTable = true
            }
            else {
              this.toastr.error(v.message, 'Error')
            }
          },
          error: (e: any) => {
            this.spinner.hide()
            this.toastr.error(e.error.message, 'Error')
          },
          complete: () => { this.spinner.hide() }
        })

    }
    else {

      this.callService.updateCallSheet(this.callSheetForm.value).subscribe({
        next: (v: any) => {
          if (v.success) {
            this.toastr.success(v.message, 'Success')

          }
          else {
            this.toastr.error(v.message, 'Error')
          }
        },
        error: (e: any) => {
          this.spinner.hide()
          this.toastr.error(e.error.message, 'Error')
        },
        complete: () => { this.spinner.hide() }
      })
    }
  }

  rowIndex:number = -1
  statusChange(value:any, index:number){
    this.callStatus = value
    this.rowIndex = index
  }

  addCall(id:any, index:number){
    if(this.callStatus != '' && this.rowIndex == index){
      this.spinner.show()
      this.callService.addCallSheetDetail({_id:id, callStatus:this.callStatus, callDate:new Date(), callerName:this.callerName}).subscribe({
        next: (v: any) => {
          this.spinner.hide()
          if (v.success) {
            this.toastr.success(v.message, 'Success')
            this.getCallSheetDetail(this.id)
            this.callStatus = ''
            this.rowIndex = -1
          }
          else {
            this.toastr.error(v.message, 'Error')
          }
        },
        error: (e: any) => {
          this.spinner.hide()
          this.toastr.error(e.error.message, 'Error')
        },
        complete: () => { this.spinner.hide() }
      })
    }
    else this.toastr.error("Call Status is not Allowed to be Empty")
  }


  openDialog(callHistory:any[], studentName:any){
    const dialogRef = this.dialog.open(CallHistoryComponent, { disableClose: false, autoFocus: true, width: '40%', data: { studentName:studentName ,array:callHistory } })
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {

      }
    });
  }

  header = ['Sno.',  'RollNo.', 'Name', 'Contact', 'Call Status 1', 'Call Status 2', 'Call Status 3', 'Call Status 4', 'Call Status 5', 'Call Status 6', 'Call Status 7', 'Call Status 8', 'Call Status 9', 'Call Status 10', 'Call Status 11', 'Call Status 12', 'Call Status 13', 'Call Status 14', 'Call Status 15']

  tableData: any = []

  getReportData()
  {
    var prepare: any[][] = [];
    var i = 0
    //  console.log(this.tableData)
    this.tableData.forEach((element: any) => {
      i = i + 1
      var tempObj:any[] = [];
      tempObj.push(i);
      tempObj.push(element?.rollNo)
      tempObj.push(element?.studentName)
      tempObj.push(element?.contactNo)
      for(let j of element?.callHistory){
        let dt = this.datepipe.transform(j?.callDate, 'yyyy-MM-dd')
        tempObj.push(`${j?.callStatus} \n(${dt} by ${j?.callerName})`)
      }
      prepare.push(tempObj);
    });
    return prepare
  }

  generateExcel()
  {
    if (this.tableData.length == 0) {
      this.toastr.error('No Data Found', 'Alert')
      return
    }
    let workbook=new Excel.Workbook()
    let worksheet= workbook.addWorksheet("Student Call Sheet")

    var collegeName = this.callSheetData?.collegeId?.name

    var collegeCourse = this.callSheetData?.course
    var semester = this.callSheetData?.semester
    var sheetDate = this.callSheetData?.sheetDate.toString()


    let subTitleRow = worksheet.addRow([`Call Sheet`]);
    subTitleRow.font = { size: 20, bold: false }
    subTitleRow.getCell(1).alignment = {'horizontal': 'center'}
  //   //Merge Cells
    worksheet.mergeCells(`A${subTitleRow.number}:K${subTitleRow.number}`);

    let titleRow = worksheet.addRow([`${collegeName} ${collegeCourse} Sem- ${semester}`]);
    titleRow.font = { name: 'Comic Sans MS', family: 4, size: 25, underline: 'double', bold: true }
    titleRow.getCell(1).alignment = {'horizontal': 'center'}
    //Merge Cells
    worksheet.mergeCells(`A${titleRow.number}:K${titleRow.number}`);

    worksheet.addRow(['Sheet Date : ' + this.datepipe.transform(sheetDate, 'yyyy-MM-dd')])

    var prepare: any[][] = [];
    prepare=this.getReportData();

    worksheet.addRow([])
    let headerRow = worksheet.addRow(this.header);
    // Cell Style : Fill and Border
    headerRow.font = {bold:true, size:15}
    headerRow.eachCell((cell, number) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF00' },
      bgColor: { argb: 'FF0000FF' }
    }
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style:'thin' }}
    })


    prepare.forEach((d: any) => {
      let row = worksheet.addRow(d);
      row.alignment = {wrapText:true}
    });
    worksheet.getColumn(3).width = 25
    worksheet.getColumn(2).width = 10
    worksheet.getColumn(4).width = 20
    for(let i= 5; i<20; i++){
    worksheet.getColumn(i).width = 30
    }
    worksheet.addRow([])
    worksheet.addRow([])

    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, collegeName+"_"+collegeCourse+"_"+semester + '.xlsx');
    })
  }

}
