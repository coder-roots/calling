import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class CreateExcelService {
  constructor(private datePipe: DatePipe) { }

  generateExcel(data: any) {
    let workbook = new ExcelJS.Workbook();
    let worksheet = workbook.addWorksheet(data.heading.title);
    if (data.heading.filters && data.heading.filters.company) {
      let companyRow = worksheet.addRow([data.heading.filters.company]);
      worksheet.mergeCells(`A${companyRow.number}:${String.fromCharCode(64 + data.header.length)}${companyRow.number}`);
      companyRow.font = { name: 'Arial', size: 18, bold: true };
      companyRow.alignment = { horizontal: 'center', vertical: 'middle' };
    }

    let combinedHeading = data.heading.title;

  
    if (data.heading.dateRange) {
      combinedHeading += ` : ${data.heading.dateRange}`;
    }
    
    if (data.heading.filters && Object.keys(data.heading.filters).length > 0) {
      const filters = Object.keys(data.heading.filters)
        .filter((key) => key !== "company")
        .map((key) => `${key}: ${data.heading.filters[key]}`)
        .join(", ");
    
      if (filters) {
        combinedHeading += ` | ${filters}`;
      }
    }
    
  
    let headingRow = worksheet.addRow([combinedHeading]);
    headingRow.font = { name: 'Arial', size: 11 };
  
    const currentDateTime = new Date();

    const formattedDateTime = this.datePipe.transform(currentDateTime, 'dd/MM/YYYY HH:mm:ss a');
  
    worksheet.addRow([`Date: ${formattedDateTime}`]).font = { name: 'Arial', size: 11 };
    
  
    let headerRow = worksheet.addRow(data.header);
    headerRow.font = { bold: true };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
  
    data.excelData.forEach((rowData: any) => {
      let row = worksheet.addRow(rowData);
      const isDeleted = rowData.includes("Yes");
  
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
        if (isDeleted) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFCCCC' },
          };
        }
      });
    });
  

    const allData = [data.header, ...data.excelData];
    data.header.forEach((header: string, index: number) => {
      const columnValues = allData.map((row) => row[index]?.toString() || "");
      const maxLength = Math.max(...columnValues.map((value) => value.length));
      worksheet.getColumn(index + 1).width = maxLength + 2; // Add extra padding
    });
  

    const totalColumns = data.header.length;
    if (data.summary) {
      const keys = {
        totalCollection: "Total Collection",
        deletedReceiptsCollection: "Deleted Receipts Collection",
        deletedReceiptsCount: "Deleted Receipts",
        netCollection: "Net Collection",
      };
  
      const summaryEntries = Object.entries(keys).map(([key, displayText]) => {
        const value = data.summary[key] || "N/A";
        return `${displayText}: ${value}`;
      });
  
      const summaryText = summaryEntries.join(" | ");
      let summaryRow = worksheet.addRow([summaryText]);
      worksheet.mergeCells(`A${summaryRow.number}:${String.fromCharCode(64 + totalColumns)}${summaryRow.number}`);
      summaryRow.font = { bold: true }; 
      summaryRow.alignment = { horizontal: 'left', vertical: 'middle' };
  
      summaryRow.getCell(1).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    } else {
      let footerRow = worksheet.addRow(['This is a system-generated Excel sheet.']);
      worksheet.mergeCells(`A${footerRow.number}:${String.fromCharCode(64 + totalColumns)}${footerRow.number}`);
      footerRow.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFCCFFE5' },
      };
      footerRow.font = { italic: true };
      footerRow.getCell(1).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    }
    workbook.xlsx.writeBuffer().then((dataBuffer) => {
      let blob = new Blob([dataBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, data.heading.title + '.xlsx');
    });
  }
  


}
