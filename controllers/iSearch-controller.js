const connection = require('../models/db');
const getCoordsForAddress = require('../util/location');

// iSearch by Username/ Phone number
const iSearchUserName = (req, res, next) => {
    const { username_phone } = req.body;
    const sql = `SELECT * FROM users WHERE username = '${username_phone}' OR phone = '${username_phone}'`
    connection.query(sql, (err, response) => {
        if (err) return res.status(422).json({message : 'Something went wrong'}) 
        else if (response.length === 0) return res.status(404).json({message : 'No User Found'})
        res.status(200).json({data : response})
    });
};

// iSearch by Location Name
const iSearchLocationName = async (req, res, next) => {
    const username = req.data.username;
    const {location, kilometer} = req.body;
    try {
        var coordinates = await getCoordsForAddress(location);
     } catch (error) {
       return next(error)
     }
    const sql = `SELECT id, username, fullName, state, latitude, longitude, (((acos(sin(('${coordinates.lat}'*pi()/180)) * sin((latitude*pi()/180)) +
     cos(('${coordinates.lat}'*pi()/180)) * cos((latitude*pi()/180)) * cos((('${coordinates.lng}' - longitude)
      * pi()/180)))) * 180/pi()) * 60 * 1.1515 * 1.609344) 
      as distance FROM users WHERE NOT username = '${username}' HAVING distance <= '${kilometer}' ORDER BY distance ASC`
    connection.query(sql, (err, response) => {
        if (err) return res.status(422).json({message : 'Something went wrong'}) 
        else if (response.length === 0) return res.status(404).json({message : 'No Nearby User Found'})
        res.status(200).json({data : response})
    });
};

// iSearch by UserGeoLocation
const iSearchGeoLocation = (req, res, next) => {
    const username = req.data.username;
    const { latitude, longitude, kilometer} = req.body;
    const sql = `SELECT id, username, fullName, state, latitude, longitude, (((acos(sin(('${latitude}'*pi()/180)) * sin((latitude*pi()/180)) +
    cos(('${latitude}'*pi()/180)) * cos((latitude*pi()/180)) * cos((('${longitude}' - longitude)
     * pi()/180)))) * 180/pi()) * 60 * 1.1515 * 1.609344) 
     as distance FROM users WHERE NOT username = '${username}' HAVING distance <= '${kilometer}' ORDER BY distance ASC`
   connection.query(sql, (err, response) => {
       if (err) return res.status(422).json({message : 'Something went wrong'}) 
       else if (response.length === 0) return res.status(404).json({message : 'No Nearby User Found'})
       res.status(200).json({data : response})
   });
};

module.exports = {
    iSearchUserName,
    iSearchLocationName,
    iSearchGeoLocation
}