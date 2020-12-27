const connection = require('../models/db');

// Create a Dairy
const createDairy = (req, res, next) => {
    const { message } = req.body;
    const userID = req.data.userID;
    const sql = `insert into idiary (userID, message) values ('${userID}', '${message}')`
    connection.query(sql, (err, response) => {
        if (err) return res.status(422).json({message : err.sqlMessage}) 
        res.status(201).json({message : 'iDairy added successfully'})
    }); 
};

// edit Dairy
const editDairy = (req, res, next) => {
    const { message } = req.body;
    const userID = req.data.userID;
    connection.query(`select * from idiary where id = ${req.params.id}`, (err, response) => {
        if (err) return res.status(422).json({message : err.sqlMessage}) 
        else if (response.length === 0) return res.status(404).json({message : 'Could not find a dairy with the provided id'})
        connection.query(`UPDATE idiary SET message = '${message}', userID = '${userID}' where id = ${req.params.id}`, (err, response) => {
            if (err) return res.status(422).json({message : err.sqlMessage})
            res.status(200).json({message : 'Dairy edited successfully'})
        })
    }); 
};

// get all Dairies Created by a particular User
const getAllDairy = (req, res, next) => {
    const userID = req.data.userID;
    const sql = `select * from idiary where userID = ${userID} ORDER BY timeCreated DESC`
    connection.query(sql, (err, response) => {
        if (err) return res.status(422).json({message : err.sqlMessage}) 
        else if (response.length === 0) return res.status(404).json({message : 'No dairy Found'})
        res.status(200).json({data : response})
    }); 
};

// Search Keyword Dairy
const searchDairy = (req, res, next) => {
    const { keyword } = req.body;
    const userID = req.data.userID;
    const sql = `select * from idiary where message LIKE '%?%' AND userID = ? ORDER BY timeCreated DESC`
    connection.query(sql, [keyword, userID], (err, response) => {
        if (err) return res.status(422).json({message : err.sqlMessage}) 
        // else if (response.length === 0) return res.status(404).json({message : 'No dairy Found'})
        res.status(200).json({data : response})
    }); 
};

// get a dairy by id
const getDairy = (req, res, next) => {
    const sql = `select * from idiary where id = ${req.params.id}`
    connection.query(sql, (err, response) => {
        if (err) return res.status(422).json({message : err.sqlMessage}) 
        else if (response.length === 0) return res.status(404).json({message : 'Could not find a dairy with the provided id'})
        res.status(200).json({data : response})
    }); 
};

// delete a dairy
const deleteDairy = (req, res, next) => {
    connection.query(`select * from idiary where id = ${req.params.id}`, (err, response) => {
        if (err) return res.status(422).json({message : err.sqlMessage}) 
        else if (response.length === 0) return res.status(404).json({message : 'Could not find a dairy with the provided id'})
        const sql = `delete from idiary where id = ${req.params.id}`
        connection.query(sql, (err, response) => {
            if (err) return res.status(422).json({message : err.sqlMessage}) 
            res.status(200).json({message : "Dairy deleted successfully"})
        }); 
    });
};

exports.createDairy = createDairy;
exports.editDairy = editDairy;
exports.getAllDairy = getAllDairy;
exports.getDairy = getDairy;
exports.deleteDairy= deleteDairy;
exports.searchDairy = searchDairy;