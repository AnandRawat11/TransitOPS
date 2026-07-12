/**
 * constants.js - Centralized enums and constants for TransitOps.
 *
 * All enum values use SCREAMING_SNAKE_CASE as the canonical
 * backend convention. The frontend maps these to display labels.
 *
 * Import specific constants:
 *   const { ROLES, VEHICLE_STATUS } = require('../utils/constants');
 */

const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  FLEET_MANAGER: 'FLEET_MANAGER',
  DRIVER: 'DRIVER',
  SAFETY_OFFICER: 'SAFETY_OFFICER',
  FINANCIAL_ANALYST: 'FINANCIAL_ANALYST',
});

const ROLES_ARRAY = Object.freeze(Object.values(ROLES));

const VEHICLE_STATUS = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  ON_TRIP: 'ON_TRIP',
  MAINTENANCE: 'MAINTENANCE',
  RETIRED: 'RETIRED',
});

const VEHICLE_STATUS_ARRAY = Object.freeze(Object.values(VEHICLE_STATUS));

const VEHICLE_TYPES = Object.freeze({
  TRUCK: 'TRUCK',
  VAN: 'VAN',
  BUS: 'BUS',
  CAR: 'CAR',
  MOTORCYCLE: 'MOTORCYCLE',
  TRAILER: 'TRAILER',
});

const VEHICLE_TYPES_ARRAY = Object.freeze(Object.values(VEHICLE_TYPES));

const FUEL_TYPES = Object.freeze({
  DIESEL: 'DIESEL',
  PETROL: 'PETROL',
  CNG: 'CNG',
  ELECTRIC: 'ELECTRIC',
  HYBRID: 'HYBRID',
});

const FUEL_TYPES_ARRAY = Object.freeze(Object.values(FUEL_TYPES));

module.exports = {
  ROLES,
  ROLES_ARRAY,
  VEHICLE_STATUS,
  VEHICLE_STATUS_ARRAY,
  VEHICLE_TYPES,
  VEHICLE_TYPES_ARRAY,
  FUEL_TYPES,
  FUEL_TYPES_ARRAY,
};
