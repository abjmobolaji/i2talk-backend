require('dotenv').config();
const connection = require('../models/db');

const auditTrail=()=>{

}

/* 
TRAIL TEMPLATE
    trail = {
        actor : "",
        action : "",
        type : ""
    } 
*/

auditTrail.logTrail = (trail) => {
    connection.query(`INSERT INTO audit_trail (actor, action, type) VALUES ('${trail.actor}', '${trail.action}', '${trail.type}')`, (err, resp) => {
        if(err) { console.log(err.sqlMessage);  }
    });
}


///////////////////////////////////////////////////////////////////////////////////////// 

    


///////////////////////////////////////////////////
module.exports = auditTrail;