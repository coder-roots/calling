import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportService } from '../../../services/report/report.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl, FormGroup } from '@angular/forms';
import jsPDF from 'jspdf';
import { DatePipe } from '@angular/common';
import autoTable from 'jspdf-autotable';
import { CreateExcelService } from '../../../services/excel/create-excel.service';

@Component({
  selector: 'app-drop-report',
  templateUrl: './drop-report.component.html',
  styleUrls: ['./drop-report.component.css']
})
export class DropReportComponent implements OnInit {

  courseList: any[] = [];

  constructor(private report: ReportService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private DatePipe: DatePipe,
    private excelService: CreateExcelService
  ) {
    this.courseList = JSON.parse(sessionStorage.getItem('courses') ?? '');
  }

  displayedColumns: string[] = [
    'position',
    'id',
    'course',
    'name',
    'contact',
    'admDate',
    'amount',
    'company',
    'paymentMode'
  ];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  filterForm = new FormGroup({
    startDate: new FormControl(new Date()),
    endDate: new FormControl(new Date())
  })


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


  getReport() {
    this.spinner.show();
    let data: any = {};
    if (!!this.filterForm.value.startDate && !!this.filterForm.value.endDate) {
      data.startDate = this.filterForm.value.startDate
      data.endDate = this.filterForm.value.endDate
    }
    data.sessionYearId = sessionStorage.getItem('session_year')
    if (!!this.company) {
      data.company = this.company
    }
    if (!!this.courseId) {
      data.courseId = this.courseId
    }
    this.report.getDropReport(data)
      .subscribe({
        next: (v: any) => {
          this.spinner.hide();
          if (v.success) {
            this.toastr.success(v.message, 'Success')
            this.dataSource.data = v.data;
          } else {
            this.toastr.error(v.message, 'Error');
          }
        },
        error: (e) => {
          this.spinner.hide()
          this.toastr.error(e.error.message)
        },
        complete: () => { this.spinner.hide() }
      });

  }

  dateChanged() {
    if (!!this.filterForm.value.startDate && !!this.filterForm.value.endDate) {
      this.getReport();
    }
  }

  header = [
    [
      "Sr.",
      "Adm No.",
      "Course",
      "Name",
      "Contact",
      "Adm Date.",
      "Drop Date",
      "company",
      "Drop Reason"
    ]]




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

    let reportTitle = `Drop Report ${this.DatePipe.transform(this.filterForm.value.startDate, 'dd/MM/YYYY')} - ${this.DatePipe.transform(this.filterForm.value.endDate, 'dd/MM/YYYY')}`;
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

      tempObj.push(i);
      tempObj.push(element?.admissionAutoId || 'N/A');

      if (element?.technologies && element.technologies.length > 0) {
        let courseNames = element.technologies.map((itr: any) => itr?.course?.name).join(', ');
        tempObj.push(courseNames || 'N/A');
      } else {
        tempObj.push('N/A');
      }

      tempObj.push(element?.studentId?.studentName || 'N/A');
      tempObj.push(element?.studentId?.personalContact || 'N/A');
      tempObj.push(this.DatePipe.transform(element?.admissionDate, "dd/MM/YYYY") || 'N/A');
      tempObj.push(this.DatePipe.transform(element?.dropDate, "dd/MM/YYYY") || 'N/A');
      tempObj.push(element?.company || 'N/A');
      tempObj.push(element?.dropReason || 'N/A');

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
      "Sr.",
      "Adm No.",
      "Course",
      "Name",
      "Contact",
      "Adm Date.",
      "Drop Date",
      "company",
      "Drop Reason"

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
      title: "Drop Report",
      dateRange: `${this.DatePipe.transform(this.filterForm.value.startDate, 'dd/MM/YYYY')} - ${this.DatePipe.transform(this.filterForm.value.endDate, 'dd/MM/YYYY')}`,
      filters: filter,
    };
   
    var excelData: any[][] = [];
    var i = 0
    this.dataSource.data.forEach((element: any) => {
      i = i + 1
      var tempObj: any = [];
      tempObj.push(i);
      tempObj.push(element?.admissionAutoId || 'N/A');
      if (element?.technologies && element.technologies.length > 0) {
        let courseNames = element?.technologies.map((itr: any) => itr?.course?.name).join(', ');
        tempObj.push(courseNames || 'N/A');
      } else {
        tempObj.push('N/A');
      }
      tempObj.push(element?.studentId?.studentName || 'N/A');
      tempObj.push(element?.studentId?.personalContact || 'N/A');
      tempObj.push(this.DatePipe.transform(element?.admissionDate, "dd/MM/YYYY") || 'N/A');
      tempObj.push(this.DatePipe.transform(element?.dropDate, "dd/MM/YYYY") || 'N/A');
      tempObj.push(element?.company);
      tempObj.push(element?.dropReason || 'N/A');

      excelData.push(tempObj);
    });
    var tempObj: any = [];
    i += 1
    excelData.push(tempObj);
    this.excelService.generateExcel({ excelData, header, heading });
  }



}
