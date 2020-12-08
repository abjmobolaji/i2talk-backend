const connection = require('../models/db');

// Create  FAQ
const addFaq = (req, res, next) => {
    const { question, answer, updatedBy } = req.body;
    const sql = `insert into faq (question, answer, updatedBy) values ('${question}', '${answer}', '${updatedBy}')`;
    connection.query(sql, (err, response) => {
        if (err) return res.status(422).json({message : err.sqlMessage}) 
        res.status(201).json({message : 'FAQ added successfully'})
    }); 
};

// Edit FAQ
const editFaq = (req, res, next) => {
    const { question, answer, updatedBy } = req.body;
    connection.query(`select * from faq where id = ${req.params.id}`, (err, response) => {
        if (err) return res.status(422).json({message : err.sqlMessage}) 
        else if (response.length === 0) return res.status(404).json({message : 'Could not find a faq with the provided id'})
        connection.query(`UPDATE faq SET question = '${question}', answer = '${answer}', updatedBy = '${updatedBy}' where id = ${req.params.id}`, (err, response) => {
            if (err) return res.status(422).json({message : err.sqlMessage})
            res.status(200).json({message : 'Reminder edited successfully'})
        })
    }); 
};

// Delete FAQ
const deleteFaq = (req, res, next) => {
    connection.query(`select * from faq where id = ${req.params.id}`, (err, response) => {
        if (err) return res.status(422).json({message : err.sqlMessage}) 
        else if (response.length === 0) return res.status(404).json({message : 'No faq with the with the provided id'})
        const sql = `delete from faq where id = ${req.params.id}`
        connection.query(sql, (err, response) => {
        if (err) return res.status(422).json({message : err.sqlMessage}) 
        res.status(200).json({message : "faq deleted successfully"})
    });
    }); 
};

// get All FAQ
const getFaq = (req, res, next) => {
    const sql = 'select * from faq'
    connection.query(sql, (err, response) => {
        if (err) return res.status(422).json({message : err.sqlMessage}) 
        else if (response.length === 0) return res.status(404).json({message : 'No FAQ found.'})
        res.status(200).json({data : response})
    }); 
};

exports.addFaq = addFaq;
exports.editFaq = editFaq;
exports.deleteFaq = deleteFaq;
exports.getFaq = getFaq;