const { 
    getAllEvents, 
    getEventById, 
    createEvent, 
    updateEvent, 
    deleteEvent, 
    registerVolunteer ,
    getEventVolunteers,
    getEventsByOrganization
} = require("../controllers/event");

const event = require("express").Router();

event.route("/event").get(getAllEvents).post(createEvent);
event.route("/event/:id").get(getEventById).put(updateEvent).delete(deleteEvent);
event.route("/event/:id/register").post(registerVolunteer);
event.route("/event/:id/volunteers").get(getEventVolunteers);
event.route("/event/organization/:id").get(getEventsByOrganization);
module.exports = { event };
