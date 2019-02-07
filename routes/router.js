const express = require('express');
const router = express.Router();
const unitn = require('../public/unitn-service');

router.get('/', function(req,res,next) {  
  unitn.easyroomRequest()
  .then((obj) => {
    res.json(obj.data)
  })
});

router.get('/room', function(req, res, next) {
  // get all free room of povo
  unitn.easyroomRequest()
  .then((obj) => {    
    let rooms = unitn.createRoomsObject(obj.data);    
    let freeRooms = unitn.getFreeRooms(rooms);          
    let renderedTable = unitn.setFormatTime(freeRooms);    
    res.json(renderedTable)
  })  
});

router.get('/demo', function(req, res, next) {
  // get all free room of povo
  unitn.easyroomRequest()
  .then((obj) => {    
    let rooms = unitn.createRoomsObject(obj.data);    
    let freeRooms = unitn.getFreeRooms(rooms);              
    res.json(freeRooms)
  })  
});

module.exports = router;