import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { CertificateService } from 'src/app/services/certificate/certificate.service';
import { UserDataService } from '../../../services/userData/user-data.service';
import { BASE_IMAGE_URL } from '../../../endpoints';
import { read, utils } from 'xlsx';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver'

@Component({
  selector: 'app-certificate-sheet',
  templateUrl: './certificate-sheet.component.html',
  styleUrls: ['./certificate-sheet.component.css']
})
export class CertificateSheetComponent implements OnInit {

  fileName: any = ''
  type: string = "Add"
  id: any = ''
  sheetData: any = {}
  displayedColumns: string[] = ['srNo', 'name', 'email', 'coursename', 'refNo', 'course', 'action']
  dataSource = new MatTableDataSource<any>([]);

  certificateSheetForm = new FormGroup({
    _id: new FormControl(''),
    comments: new FormControl('', Validators.required),
    title: new FormControl('', [Validators.required]),
    userList: new FormControl(""),
    company: new FormControl(0)   // 0 : O7 Services and 1: O7 Solutions
  })





  filteredOptions: Observable<any[]> | undefined;
  @ViewChild('search') searchTextBox: ElementRef = {} as ElementRef;


  data: any[] = [
    { 'name': '' }
  ]

  _id: any
  certificateSheetData: any

  showTable: boolean = false
  constructor(private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private certificateService: CertificateService,
    private router: Router,
    private route: ActivatedRoute,
    private userDataService: UserDataService
  ) {

  }

  ngOnInit(): void {
    this.dataSource.data = []
    this.route.paramMap.subscribe(param => {
      this.id = param.get('id') ?? ""
      this.type = this.id == "" ? 'Add' : 'View'
      if (this.type == 'View') {
        this.getSingleCertificateSheet()
      }
    })
  }

  downloadFormat() {
    return BASE_IMAGE_URL + "excelSheet/CertificateSheetFormat.xlsx"
  }


  userList: any[] = []
  uploadFile(event: any) {
    this.userList = []
    const files = event.target.files
    if (files.length) {
      const file = files[0]
      this.fileName = file.name
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
            let obj: any = {};
            let currentline = lines[i].split(",");
            // console.log(currentline);
            if (!currentline[0])
              continue
            for (let j = 0; j < headers.length; j++) {
              obj[headers[j]] = currentline[j];
            }
            this.userList.push(obj);
          }

          console.log("userList", this.userList);


        }
      }
      reader.readAsArrayBuffer(file)
    }


  }



  getSingleCertificateSheet() {
    this.spinner.show()
    this.certificateService.singleCertificateSheet({ _id: this.id }).subscribe({
      next: (v: any) => {
        var result = v
        this.spinner.hide()
        if (result.success) {
          this.certificateSheetData = v.data
          this.certificateSheetForm.patchValue({
            comments: v.data?.comments,
            title: v.data?.title,
            _id: v.data?._id
          })

          this.sheetData = {
            title: this.certificateSheetData.title,
            comments: this.certificateSheetData.comments
          }
          this.showTable = true
          this.dataSource.data = this.certificateSheetData?.userList
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



  submit() {
    this.spinner.show()
    if (this.type == 'Add') {
      this.certificateSheetForm.patchValue({ userList: JSON.stringify(this.userList) })
      this.certificateService.addCertificateSheet(this.certificateSheetForm.value).subscribe({
        next: (v: any) => {
          this.spinner.hide()
          if (v.success) {
            this.fileName = ''
            this.toastr.success(v.message, 'Success')
            // this.router.navigateByUrl('/admin/callSheets')
            this.sheetData = {
              title: v.data?.title,
              comments: v.data?.comments
            }
            this.dataSource.data = v.data?.userList
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
      this.certificateService.updateCertificateSheet(this.certificateSheetForm.value).subscribe({
        next: (v: any) => {
          if (v.success) {
            this.toastr.success(v.message, 'Success')
            // this.router.navigateByUrl('/admin/callSheets')
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

  openCertificate(data: any) {
    window.open(BASE_IMAGE_URL + data)
  }


  download(data: any) {
    return BASE_IMAGE_URL + data
  }



  downloadAll() {
    const zip = new JSZip();
    const folder = zip.folder(this.certificateSheetData.title);
    const downloadPromises: Promise<void>[] = [];
    for (let i of this.certificateSheetData.userList) {
      const url = BASE_IMAGE_URL + i.certificate;
      const fileName = i.name
        ? `${i.name.replace(/\s+/g, '_')}.pdf`
        : 'Certificate.pdf';
      const promise = fetch(url)
        .then(response => response.blob())
        .then(blob => {
          folder?.file(fileName, blob);
        });
      downloadPromises.push(promise);
    }
    Promise.all(downloadPromises)
      .then(() => {
        const zipFileName = this.certificateSheetData.title
          ? `${this.certificateSheetData.title.replace(/\s+/g, '_')}.zip`
          : 'Certificates.zip';

        zip.generateAsync({ type: 'blob' }).then((content: any) => {
          saveAs(content, zipFileName);
        });
      })
      .catch(err => {
        console.error('Error downloading files:', err);
      });
  }


}
