import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportService } from '../../../services/report/report.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';
import jsPDF from 'jspdf';
import { DatePipe } from '@angular/common';
import autoTable from 'jspdf-autotable';
import { CreateExcelService } from '../../../services/excel/create-excel.service';

@Component({
  selector: 'app-daybook',
  templateUrl: './daybook.component.html',
  styleUrls: ['./daybook.component.css'],
})
export class DaybookComponent implements OnInit {

  courseList: any[] = [];
  collegeList: any[] = [];
  batchList: any[] = [];

  constructor(
    private report: ReportService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private DatePipe: DatePipe,
    private excelService: CreateExcelService
  ) {
    this.courseList = JSON.parse(sessionStorage.getItem('courses') ?? '');
    this.collegeList = JSON.parse(sessionStorage.getItem('colleges') ?? '');
  }

  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  date = new FormControl(new Date());

  userType: any;
  companies: any[] = [];
  company: any = null;

  ngOnInit(): void {

    const userData = JSON.parse(sessionStorage.getItem('user_data') ?? '{}');
    this.userType = userData.data.userType;

    // Prefill companies
    let companies = JSON.parse(sessionStorage.getItem('companies') ?? '[]');
    this.companies = companies;

    if (companies.length > 0) {
      this.company = companies[0];
    } else {
      this.toastr.warning('No companies available. Please set up companies.');
    }

    this.getReport();
  }


  courseId: any;
  collegeId: any;



  getReport() {
    this.spinner.show();
    let data: any = {};

    if (!!this.courseId) {
      data.courseId = this.courseId
    }
    if (!!this.collegeId) {
      data.collegeId = this.collegeId
    }
    if (!!this.company) {
      data.company = this.company
    }

    if (this.date.value != undefined && this.date.value != null) {
      data.date = this.date.value;
    }
    data.sessionYearId = sessionStorage.getItem('session_year');
    this.report.getDayBook(data).subscribe({
      next: (v: any) => {
        this.spinner.hide();
        if (v.success) {
          this.toastr.success(v.message, 'Success');
          this.dataSource.data = v.data;
        } else {
          this.toastr.error(v.message, 'Error');
        }
      },
      error: (e) => {
        this.spinner.hide();
        this.toastr.error(e.error.message);
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  displayedColumns: string[] = [
    'position',
    'id',
    'course',
    'name',
    'contact',
    'receiptType',
    'amount',
    'collectedAt',
    'collectedBy',
    'paymentMode',
    'company',
  ];

  header = [
    [
      "Sr.", "Receipt Id", "Course", "Name", "Contact", "Receipt Type", "Reg. Amount", "Coll. At", "Coll. by", "Mode", "company"

    ],
  ];

  generatePdf() {

    var pdf = new jsPDF('l', 'pt', 'a4');

    pdf.setFontSize(10);
    pdf.setTextColor(99);

    if (!!this.company) {
      const companyName = `Company: ${this.company}`;
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text(companyName, pdf.internal.pageSize.width / 2, 30, { align: "center" });
    }

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");

    let reportTitle = `Daybook Collection : ${this.DatePipe.transform(this.date.value, "dd/MM/YYYY")}`;
    let filter: any = {};


    if (!!this.courseId) {
      const selectedCourse = this.courseList.find((course: any) => course._id === this.courseId);
      if (selectedCourse) {
        filter['Course'] = selectedCourse.name;
      }
    }

    if (Object.keys(filter).length > 0) {
      reportTitle += ' | ' + Object.keys(filter)
        .map((key) => `${key}: ${filter[key]}`)
        .join(', ');
    }

    pdf.text(reportTitle, 40, 50);

    const currentDate = new Date().toLocaleString();
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Date: ${currentDate}`, 40, 60);

    var prepare: any[][] = [];
    var i = 0;

    this.dataSource.data.forEach((element: any) => {
      i += 1;
      var tempObj: any = [];

      tempObj.push(i + (this.paginator.pageIndex * this.paginator.pageSize));
      tempObj.push(element?.feeReceiptAutoId + (element?.receiptType === 1 ? ` (${element.manualReceiptNumber})` : ''));

      const courseNames = element?.admissionId?.technologies
        ?.map((tech: any) => tech?.course?.name)
        .join(', ');
      tempObj.push(courseNames);

      tempObj.push(element?.admissionId?.studentId?.studentName);
      tempObj.push(element?.admissionId?.studentId?.personalContact);

      tempObj.push(element?.isRegistrationSlip ? `I: ${element?.installmentNumber}` : 'Registration');
      tempObj.push(element?.amountPaid);

      tempObj.push(this.DatePipe.transform(element?.collectedOn, "short"));
      tempObj.push(element?.collectedBy?.name);

      tempObj.push(element?.paymentMethod);
      tempObj.push(element?.admissionId?.company);

      prepare.push(tempObj);
    });

    var tempObj: any = [];
    i += 1;
    prepare.push(tempObj);

    autoTable(pdf, {
      head: this.header,
      body: prepare,
      theme: 'grid',
      startY: 65,
      styles: {
        overflow: 'linebreak',
        fontSize: 7,
        valign: 'middle',
      },
      margin: { left: 40 },
    });

    pdf.output('dataurlnewwindow');
  }





  generateExcel() {

    var header = [
      "Sr.", "Receipt Id", "Course", "Name", "Contact", "Receipt Type", "Reg. Amount", "Coll. At", "Coll. by", "Mode", "company"
    ];
    if (this.dataSource.data?.length == 0) {
      return
    }

    let filter: any = {};
    if (!!this.company) {
      filter.company = this.company;
    }

    if (!!this.courseId) {
      const selectedCourse = this.courseList.find((course: any) => course._id === this.courseId);
      if (selectedCourse) {
        filter.course = selectedCourse.name;
      }
    }


    let heading = {
      title: `Daybook Collection List`,
      dateRange: `${this.DatePipe.transform(this.date.value, 'dd/MM/YYYY')}`,
      filters: filter,
    };




    var excelData: any[][] = [];
    var i = 0
    this.dataSource.data.forEach((element: any) => {
      i = i + 1
      var tempObj: any = [];
      tempObj.push(i + 1 + (this.paginator.pageIndex * this.paginator.pageSize)); // Sr.
      tempObj.push(element?.feeReceiptAutoId + (element?.receiptType === 1 ? ` (${element.manualReceiptNumber})` : ''));
      for (let itr of element?.admissionId?.technologies) {
        tempObj.push(itr?.course?.name);
      }
      tempObj.push(element?.admissionId?.studentId?.studentName);
      tempObj.push(element?.admissionId?.studentId?.personalContact);
      tempObj.push(element?.isRegistrationSlip ? 'I: ' + element?.installmentNumber : 'Registration');
      tempObj.push(element?.amountPaid);
      tempObj.push(this.DatePipe.transform(element?.collectedOn, "short"));
      tempObj.push(element?.collectedBy?.name);
      tempObj.push(element?.paymentMethod);
      tempObj.push(element?.admissionId?.company);
      excelData.push(tempObj);
    });
    var tempObj: any = [];
    i += 1
    excelData.push(tempObj);
    this.excelService.generateExcel({ excelData, header, heading });


  }



}
