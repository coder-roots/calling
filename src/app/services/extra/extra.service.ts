import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import * as moment from 'moment';
import { BASE_URL, GET_CITIES, GET_COUNTRIES, GET_SLUG, GET_STATES, GET_TAGS_FROM_TITLE } from 'src/app/endpoints';
import * as Excel from 'exceljs';
import * as fs from 'file-saver';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ExtraService {

  constructor(private http: HttpClient,private datePipe:DatePipe) { }

  getTagsFromTitle(data:any){
    return this.http.post<any>(BASE_URL + GET_TAGS_FROM_TITLE, data)
  }

  getCountries(){
    return this.http.post<any>(BASE_URL + GET_COUNTRIES, {})
  }

  getStates(data:any){
    return this.http.post<any>(BASE_URL + GET_STATES, data)
  }

  getCities(data:any){
    return this.http.post<any>(BASE_URL + GET_CITIES, data)
  }

  getSlug(data:any){
    return this.http.post<any>(BASE_URL + GET_SLUG, data)
  }


  generateExcel(data:any,title:any,header:any,balance:any) {

    //Excel Title, Header, Data
    //const header = ["Year", "Month", "Make", "Model", "Quantity", "Pct"]
    //console.log(data)
    //Create workbook and worksheet
    let workbook = new Excel.Workbook();
    let worksheet:any = workbook.addWorksheet(title);
    //Add Row and formatting
    let titleRow = worksheet.addRow([title]);
    worksheet.addRow[`Balance: ${balance}`]
    titleRow.font = { name: 'Comic Sans MS', family: 4, size: 16, underline: 'double', bold: true }
    worksheet.addRow([]);
    // let subTitleRow = worksheet.addRow(['Date : ' + moment().format('YYYY-MM-DD')])
    //Blank Row
    worksheet.addRow([]);
    //Add Header Row
    let headerRow = worksheet.addRow(header);

    // Cell Style : Fill and Border
    headerRow.eachCell((cell:any, number:any) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
        bgColor: { argb: 'FF0000FF' }
      }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })
    // worksheet.addRows(data);
    // Add Data and Conditional Formatting
    data.forEach((d:any) => {
      let row = worksheet.addRow(d);

    }
    );
    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(4).width = 30;
    worksheet.addRow([]);
    //Footer Row
    let footerRow = worksheet.addRow([`This is system generated excel sheet. ${this.datePipe.transform(new Date,'dd-MM-YYYY HH:mm a')}`]);
    footerRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFCCFFE5' }
    };
    footerRow.getCell(1).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    //Merge Cells
    worksheet.mergeCells(`A${footerRow.number}:F${footerRow.number}`);
    //Generate Excel File with given name
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, title+'.xlsx');
    })
  }
}
