/**
 * analyticsController.js
 * Exposes Analytics and Export methods to API endpoints.
 */
const analyticsService = require('../services/analytics.service');
const exportService = require('../exports/export.service');
const ScheduledReport = require('../models/ScheduledReport');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

exports.getDashboard = catchAsync(async (req, res) => {
  const result = await analyticsService.getExecutiveDashboard();
  sendSuccess(res, 200, 'Executive dashboard retrieved', result);
});

// Export Endpoint
exports.exportReport = catchAsync(async (req, res) => {
  const { type, format } = req.query; // type: 'DASHBOARD', format: 'PDF'
  
  let data;
  if (type === 'DASHBOARD') {
    data = await analyticsService.getExecutiveDashboard();
  } else {
    // For Phase 7 scope, we default to the dashboard data structure
    data = await analyticsService.getExecutiveDashboard();
  }

  if (format === 'PDF') {
    const pdfBuffer = await exportService.generatePDF(data, type || 'Custom Report');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report_${Date.now()}.pdf`);
    return res.send(pdfBuffer);
  } else if (format === 'EXCEL') {
    const excelBuffer = await exportService.generateExcel(data, type || 'Custom Report');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=report_${Date.now()}.xlsx`);
    return res.send(excelBuffer);
  } else if (format === 'CSV') {
    const csvData = exportService.generateCSV(data);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=report_${Date.now()}.csv`);
    return res.send(csvData);
  }

  return sendError(res, 400, 'Invalid format requested. Use PDF, EXCEL, or CSV.');
});

// Scheduled Reports CRUD
exports.createScheduledReport = catchAsync(async (req, res) => {
  const report = await ScheduledReport.create({ ...req.body, createdBy: req.user._id });
  sendSuccess(res, 201, 'Scheduled report created', report);
});

exports.getScheduledReports = catchAsync(async (req, res) => {
  const reports = await ScheduledReport.find().populate('createdBy', 'name email');
  sendSuccess(res, 200, 'Scheduled reports retrieved', reports);
});
