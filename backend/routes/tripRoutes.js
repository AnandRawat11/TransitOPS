const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');

// GET / - list all - Nitin Singh to implement
router.get('/', tripController.getTrips);

// POST / - create - Nitin Singh to implement
router.post('/', tripController.createTrip);

// PUT /:id/dispatch - dispatch trip
router.put('/:id/dispatch', tripController.dispatchTrip);

// PUT /:id/complete - complete trip
router.put('/:id/complete', tripController.completeTrip);

// PUT /:id/cancel - cancel trip
router.put('/:id/cancel', tripController.cancelTrip);

module.exports = router;
