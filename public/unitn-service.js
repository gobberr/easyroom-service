const axios = require('axios')  
const qs = require('qs')
const current_date = new Date();
const current_time = parseInt('' + current_date.getHours() + ('0' + current_date.getMinutes()).slice(-2));
const easyroom = "https://easyroom.unitn.it/Orario/rooms_call.php";   

// Params object that contains the data used by the API
let params = {                      
  'form-type': 'rooms',
  sede: 'E0503', // POVO  
  date: '',      // Filled later with current date
  _lang: 'it'
};

/** 
 * http POST request (url, parameters)
 * */ 
function easyroomRequest() {   
  // set current date
  let date = new Date();
  params['date'] = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
  return axios.post(easyroom, qs.stringify(params)); 
}

/**
 * This function should create the room object
 * The object should contain the rooms {room1: arr, room2: arr, .., roomN: arr}
 */
function createRoomsObject(data) {
    
  let rooms = {};
  // Check if the received object contains any lecture
  if (data.contains_events) {
    // Filter the data by selecting only the timetables for the classrooms
    let events = data.events;
    // For every object e in the event array
    events.forEach(e => {
      // Read the code of the classroom. This will be used to uniquely identify the room
      let roomCode = e.CodiceAula;
      // Create the lecture array with the from, to components
      let lessonHours = [e.from, e.to];
      // Add the lecture to the corresponding class in the rooms array
      // If the room doesn't exist in the object, create a new array with the roomCode as key
      if (!(roomCode in rooms)) {        
        rooms[roomCode] = new Array();
      }
      // Add the lecture to the array associated to the corresponding room
      rooms[roomCode].push(lessonHours);
    });
  }
  // Return the rooms object
  return rooms;
}

/**
 * This function takes in input the rooms object previously created and computes, for each classroom
 */ 
function getFreeRooms(rooms) {
  
  // Define the array to be returned
  let freeRooms = [];
  // For each room determine its status and the next lecture
  for (let code in rooms) {        
    let room = rooms[code];
    let occupied = false;
    let occupied_until = null;
    let next_lesson = null;
    // Here we assume that the events are given in chronological order
    // Cycle until we haven't found the next lesson or we have read all events
    for (let i = 0; (next_lesson == null) && (i < room.length); i++) {
      // Get the current lecture of index i
      let time = room[i];
      // Convert the strings hh:mm:ss to the integers hhmm
      let from = parseTime(time[0]);
      let to = parseTime(time[1]);     
      // If the current time is past the start of the lecture but prior to its ending,
      // then the room is occupied
      if (current_time > from && current_time < to) {        
        occupied = true;
        // Set occupied_until to the end of the lecture
        occupied_until = to;
      }
      // Otherwise, if the current time is 
      else if (current_time < from) {
        // Next lesson for this room
        next_lesson = [from, to];
      }
    }
    // Create the object to be added to the returned array
    let output = {
      code: code,
      occupied: occupied,
      occupied_until: occupied_until,
      next_lesson: next_lesson
    }
    // Add the object to the array
    freeRooms.push(output);
  }  
  return freeRooms;
}

/** 
 * from 0000 to 00:00
 * @param {*} time 
 */
function reverseParseTime(time) {    
  return (time.toString().substring(0, 2) + ':' + time.toString().substring(2, 4))
}

/**
 * set the time in the accepted format
 * @param {*} renderedTable 
 */
function setFormatTime(renderedTable) {    
  for(let i=0; i<renderedTable.length; i++) {
    if(renderedTable[i].next_lesson) {
      renderedTable[i].next_lesson[0] = reverseParseTime(renderedTable[i].next_lesson[0])
      renderedTable[i].next_lesson[1] = reverseParseTime(renderedTable[i].next_lesson[1])
    }
    if(renderedTable[i].occupied_until) {      
      renderedTable[i].occupied_until = reverseParseTime(renderedTable[i].occupied_until)
    }
  }
  return renderedTable;
}

/**
 * The from, to values received from the server are strings formatted as hh:mm:ss
 * This function converts the string in an integer that is more convenient during comparisons
 * @param {*} time 
 */
function parseTime(time) {
  let tmp = time.split(":");
  // The resulting integer will be hhmm
  return parseInt(tmp[0] + tmp[1]);
}

exports.setFormatTime = setFormatTime;
exports.easyroomRequest = easyroomRequest; 
exports.createRoomsObject = createRoomsObject;
exports.getFreeRooms = getFreeRooms;