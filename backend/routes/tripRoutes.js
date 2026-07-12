const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');

// GET / - list all - Nitin Singh to implement
router.get('/', tripController.getTrips);

// POST / - create - Nitin Singh to implement
router.post('/', tripController.createTrip);

module.exports = router;
