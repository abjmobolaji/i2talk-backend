// required files
const express = require('express');
const bodyParser = require('body-parser')

// routes
const contactRoutes = require('./routes/contact-route');
const usersRoutes = require('./routes/users-route');
const faqRoutes = require('./routes/faq-route');
const iReminderRoutes = require('./routes/iReminder-route');
const iSearchRoutes = require('./routes/iSearch-route');

const port = 3000;
const app = express();

app.use(bodyParser.json());
app.use('/api/users', usersRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/ireminder', iReminderRoutes);
app.use('/api/isearch', iSearchRoutes);


app.use((req, res, next) => {
    const error = new Error('Could not find this route');
    throw error;
})

app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500)
    res.json({message: error.message || 'An unknown error occurred!'});
})

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})