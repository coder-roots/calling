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
  selector: 'app-daybook-summary',
  templateUrl: './daybook-summary.component.html',
  styleUrls: ['./daybook-summary.component.css']
})
export class DaybookSummaryComponent implements OnInit {


  constructor(private report: ReportService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private DatePipe: DatePipe,
    private excelService: CreateExcelService


  ) { }

  displayedColumns: string[] = ['Sr', 'Date', 'registrationFee', 'installmentFee', 'cashColl', 'onlineColl', 'total', 'company'];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
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

  filterForm = new FormGroup({
    startDate: new FormControl(new Date()),
    endDate: new FormControl(new Date())
  })
  getReport() {

    let data: any = {};
    if (!!this.filterForm.value.startDate && !!this.filterForm.value.endDate) {
      data.startDate = this.filterForm.value.startDate
      data.endDate = this.filterForm.value.endDate
    } else {
      return;
    }
    data.sessionYearId = sessionStorage.getItem('session_year')
    if (!!this.company) {
      data.company = this.company
    }
    this.spinner.show();
    this.report.getDayBookSummary(data)
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
        error: (e: any) => {
          this.spinner.hide()
          this.toastr.error(e.error.message)
        },
        complete: () => { this.spinner.hide() }
      });

  }





  header = [
    [
      "Sr.",
      "Date Fee",
      "Registration Fee",
      "Installment Fee",
      "Cash Collection",
      "Online Collection",
      "Total Collection",
      "company"
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

    let reportTitle = `Daybook Summary List :  ${this.DatePipe.transform(this.filterForm.value.startDate, 'dd/MM/YYYY')} - ${this.DatePipe.transform(this.filterForm.value.endDate, 'dd/MM/YYYY')}`;
    let filter: any = {};


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
      tempObj.push(`${element?._id?.date}-${element?._id?.month}-${element?._id?.year}`);
      tempObj.push(element?.registrationFee);
      tempObj.push(element?.installmentFee);
      tempObj.push(element?.cash);
      tempObj.push(element?.online);
      tempObj.push(element?.total);
      tempObj.push(element?._id.company);
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
      "Date Fee",
      "Registration Fee",
      "Installment Fee",
      "Cash Collection",
      "Online Collection",
      "Total Collection",
      "company"
    ];
    if (this.dataSource.data?.length == 0) {
      return
    }

    let filter: any = {};

    if (!!this.company) {
      filter.company = this.company;
    }
    let heading = {
      title: `Daybook Summary List`,
      dateRange: `${this.DatePipe.transform(this.filterForm.value.startDate, 'dd/MM/YYYY')} - ${this.DatePipe.transform(this.filterForm.value.endDate, 'dd/MM/YYYY')}`,
      filters: filter,
    };


    var excelData: any[][] = [];
    var i = 0
    this.dataSource.data.forEach((element: any) => {
      i = i + 1
      var tempObj: any = [];
      tempObj.push(i);
      tempObj.push(`${element?._id?.date}-${element?._id?.month}-${element?._id?.year}`);
      tempObj.push(element?.registrationFee)
      tempObj.push(element.installmentFee);
      tempObj.push(element?.cash)
      tempObj.push(element?.online)
      tempObj.push(element?.total)
      tempObj.push(element?._id.company)
      excelData.push(tempObj);
    });
    var tempObj: any = [];
    i += 1
    excelData.push(tempObj);
    this.excelService.generateExcel({ excelData, header, heading });

  }


}
