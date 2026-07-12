const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');

// GET / - list all
router.get('/', tripController.getTrips);

// GET /:id - get trip by id
router.get('/:id', tripController.getTripById);

// POST / - create
router.post('/', tripController.createTrip);

// PUT /:id - update trip
router.put('/:id', tripController.updateTrip);

// DELETE /:id - delete trip
router.delete('/:id', tripController.deleteTrip);
// PUT /:id/dispatch - dispatch trip
router.put('/:id/dispatch', tripController.dispatchTrip);

// PUT /:id/complete - complete trip
router.put('/:id/complete', tripController.completeTrip);

// PUT /:id/cancel - cancel trip
router.put('/:id/cancel', tripController.cancelTrip);

module.exports = router;
