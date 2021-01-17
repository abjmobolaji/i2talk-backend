const connection = require('../models/db');
const getCoordsForAddress = require('../util/location');

// iSearch by Username/ Phone number
const iSearchUserName = (req, res, next) => {
    const { username_phone } = req.body;
    const sql = `SELECT * FROM users WHERE isEnabled = '1' AND (username = '${username_phone}' OR phone = '${username_phone}')`
    connection.query(sql, (err, response) => {
        if (err) return res.status(422).json({message : 'Something went wrong', err: err.sqlMessage}) 
        // else if (response.length === 0) return res.status(404).json({message : 'No User Found'})
        res.status(200).json({data : response})
    });
};

// iSearch by Location Name
const iSearchLocationName = async (req, res, next) => {
    const username = req.data.username;
    var {location, kilometer} = req.body;
    try {
        var coordinates = await getCoordsForAddress(location);
     } catch (error) {
       return next(error)
     }
     if (!kilometer) {
       var kilometer = 160;
     }
    const sql = `SELECT id, username, fullName, state, latitude, longitude, (((acos(sin(('${coordinates.lat}'*pi()/180)) * sin((latitude*pi()/180)) +
     cos(('${coordinates.lat}'*pi()/180)) * cos((latitude*pi()/180)) * cos((('${coordinates.lng}' - longitude)
      * pi()/180)))) * 180/pi()) * 60 * 1.1515 * 1.609344) 
      as distance FROM users WHERE NOT username = '${username}' AND isEnabled = '1' HAVING distance <= '${kilometer}' ORDER BY distance ASC`
    connection.query(sql, (err, response) => {
        if (err) return res.status(422).json({message : 'Something went wrong'}) 
        // else if (response.length === 0) return res.status(404).json({message : 'No Nearby User Found'})
        res.status(200).json({data : response})
    });
};

// iSearch by UserGeoLocation
const iSearchGeoLocation = (req, res, next) => {
    const username = req.data.username;
    const { page, size } = req.query;
    const { limit, offset } = getPagination(page, size);
    var { latitude, longitude, kilometer} = req.body;
    if (!kilometer) {
      var kilometer = 200;
    }
    const sql = `SELECT id, username, fullName, state, latitude, longitude, (((acos(sin(('${latitude}'*pi()/180)) * sin((latitude*pi()/180)) +
    cos(('${latitude}'*pi()/180)) * cos((latitude*pi()/180)) * cos((('${longitude}' - longitude)
     * pi()/180)))) * 180/pi()) * 60 * 1.1515 * 1.609344) 
     as distance FROM users WHERE NOT username = '${username}' AND isEnabled = '1' HAVING distance <= '${kilometer}' ORDER BY distance ASC LIMIT ${offset}, ${limit}`
   connection.query(sql, (err, response) => {
       if (err) return res.status(422).json({message : 'Something went wrong'}) 
       else if (response.length === 0) return res.status(404).json({message : 'No Nearby User Found'})
       const newResponse = {count: response.length, results : response}
       const responses = getPagingData(newResponse, page, limit)
       res.status(200).json(responses)
   });
};

const getPagination = (page, size) => {
    const limit = size ? +size : 5;
    const offset = page ? page * limit : 0;
    return { limit, offset };
};

  const getPagingData = (data, page, limit) => {
    const { count: totalItems, results: result  } = data;
    const currentPage = page ? +page : 1;
    const totalPages = Math.ceil(totalItems / limit);
  
    return { totalItems, result, totalPages, currentPage };
  };
  
module.exports = {
    iSearchUserName,
    iSearchLocationName,
    iSearchGeoLocation
}