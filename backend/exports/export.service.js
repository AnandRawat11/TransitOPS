/**
 * export.service.js
 * Generates PDF, Excel, and CSV streams for analytics reports.
 */
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { Parser } = require('json2csv');

exports.generatePDF = async (data, reportTitle) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.fontSize(20).text('TransitOps', { align: 'center' });
      doc.fontSize(14).text(`Report: ${reportTitle}`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(2);

      // JSON Data Dump (Simplistic for Phase 7, could be formatted into tables)
      doc.fontSize(12).text(JSON.stringify(data, null, 2));

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

exports.generateExcel = async (data, reportTitle) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'TransitOps';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(reportTitle);
  
  if (Array.isArray(data) && data.length > 0) {
    const columns = Object.keys(data[0]).map(k => ({ header: k, key: k, width: 20 }));
    sheet.columns = columns;
    sheet.addRows(data);
  } else if (typeof data === 'object') {
    sheet.columns = [
      { header: 'Key', key: 'k', width: 30 },
      { header: 'Value', key: 'v', width: 30 }
    ];
    Object.keys(data).forEach(k => {
      sheet.addRow({ k, v: JSON.stringify(data[k]) });
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

exports.generateCSV = (data) => {
  if (!data) return '';
  let arrData = Array.isArray(data) ? data : [data];
  
  // Flatten objects if needed, but for simplicity we rely on json2csv defaults
  const json2csvParser = new Parser();
  return json2csvParser.parse(arrData);
};
