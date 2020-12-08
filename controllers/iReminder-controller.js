const connection = require('../models/db');

// Create a reminder
const createReminder = (req, res, next) => {
    const { userID, title, message, timeCompleted } = req.body;
    const sql = `insert into ireminder (userID, title, message, timeCompleted) values ('${userID}', '${title}', '${message}', '${timeCompleted}')`
    connection.query(sql, (err, response) => {
        if (err) return res.status(422).json({message : err.sqlMessage}) 
        res.status(201).json({message : 'Reminder added successfully'})
    }); 
};

// edit a reminder
const editReminder = (req, res, next) => {
    const { title, message, timeCompleted } = req.body;
    connection.query(`select * from ireminder where id = ${req.params.id}`, (err, response) => {
        if (err) return res.status(422).json({message : err.sqlMessage}) 
        else if (response.length === 0) return res.status(404).json({message : 'Could not find a reminder with the provided id'})
        connection.query(`UPDATE ireminder SET title = '${title}', message = '${message}', timeCompleted = '${timeCompleted}' where id = ${req.params.id}`, (err, response) => {
            if (err) return res.status(422).json({message : err.sqlMessage})
            res.status(200).json({message : 'Reminder edited successfully'})
        })
    }); 
};

// get all reminders
const getAllReminders = (req, res, next) => {
    const sql = 'select * from ireminder'
    connection.query(sql, (err, response) => {
        if (err) return res.status(422).json({message : err.sqlMessage}) 
        else if (response.length === 0) return res.status(404).json({message : 'This user have not set any reminder'})
        res.status(200).json({data : response})
    }); 
};

// get a reminder by id
const getReminder = (req, res, next) => {
    const sql = `select * from ireminder where id = ${req.params.id}`
    connection.query(sql, (err, response) => {
        if (err) return res.status(422).json({message : err.sqlMessage}) 
        else if (response.length === 0) return res.status(404).json({message : 'Could not find a reminder with the provided id'})
        res.status(200).json({data : response})
    }); 
};

// delete a reminder
const deleteReminder = (req, res, next) => {
    connection.query(`select * from ireminder where id = ${req.params.id}`, (err, response) => {
        if (err) return res.status(422).json({message : err.sqlMessage}) 
        else if (response.length === 0) return res.status(404).json({message : 'Could not find a reminder with the provided id'})
        const sql = `delete from ireminder where id = ${req.params.id}`
        connection.query(sql, (err, response) => {
            if (err) return res.status(422).json({message : err.sqlMessage}) 
            res.status(200).json({message : "Reminder deleted successfully"})
        }); 
    });
};

exports.createReminder = createReminder;
exports.editReminder = editReminder;
exports.getAllReminders = getAllReminders;
exports.getReminder = getReminder;
exports.deleteReminder = deleteReminder;