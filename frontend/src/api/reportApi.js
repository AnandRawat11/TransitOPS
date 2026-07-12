import api from './axios';

export const getOperationalCost = async () => {
  const response = await api.get('/reports/operational-cost');
  return response.data;
};

export const getFuelEfficiency = async () => {
  const response = await api.get('/reports/fuel-efficiency');
  return response.data;
};

export const getFleetUtilization = async () => {
  const response = await api.get('/reports/fleet-utilization');
  return response.data;
};

export const getVehicleROI = async () => {
  const response = await api.get('/reports/roi');
  return response.data;
};

export const downloadCSVReport = async () => {
  const response = await api.get('/reports/export/csv', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'transitops-fleet-report.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
};
