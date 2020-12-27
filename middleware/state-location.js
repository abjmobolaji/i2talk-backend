const getlatlongFromState = (req, res, next) => {
    // if (!req.body.state) { return res.status(404).json({message : 'Could not get state!'}); }
    switch (req.body.state) {
      case "Abia":
        latlong = [5.532003041,7.486002487];
        break;
      case "Adamawa":
        latlong = [10.2703408,13.2700321];
        break;
      case "Akwa Ibom":
        latlong = [5.007996056,7.849998524];
        break;
      case "Anambra":
        latlong = [6.210433572,7.06999711];
        break;
      case "Bauchi":
        latlong = [11.68040977,10.19001339];
        break;
      case "Bayelsa":
        latlong = [4.664030,6.036987];
        break;
      case "Benue":
        latlong = [7.190399596,8.129984089];
        break;
      case "Borno":
        latlong = [10.62042279,12.18999467];
        break;
      case "Cross River":
        latlong = [4.960406513,8.330023558];
        break;
      case "Delta":
        latlong = [5.890427265,5.680004434];
        break;
      case "Edo":
        latlong = [6.340477314,5.620008096];
        break;
      case "Ekiti":
        latlong = [7.630372741,5.219980834];
        break;
      case "Enugu":
        latlong = [6.867034321,7.383362995];
        break;
      case "Abuja":
        latlong = [9.083333149,7.533328002];
        break;
      case "Gombe":
        latlong = [10.29044293,11.16995357];
        break;
      case "Imo":
        latlong = [5.492997053,7.026003588];
        break;
      case "Jigawa":
        latlong = [11.7991891,9.350334607];
        break;
      case "Kaduna":
        latlong = [11.0799813,7.710009724];
        break;
      case "Kano":
        latlong = [11.99997683,8.5200378];
        break;
      case "Katsina":
        latlong = [11.5203937,7.320007689];
        break;
      case "Kebbi":
        latlong = [12.45041445,4.199939737];
        break;
      case "Kogi":
        latlong = [7.800388203,6.739939737];
        break;
      case "Kwara":
        latlong = [8.490010192,4.549995889];
        break;
      case "Lagos":
        latlong = [6.443261653,3.391531071];
        break;
      case "Nasarawa":
        latlong = [8.490423603,8.5200378];
        break;
      case "Niger":
        latlong = [10.4003587,5.469939737];
        break;
      case "Ogun":
        latlong = [7.160427265,3.350017455];
        break;
      case "Ondo":
        latlong = [7.250395934,5.199982054];
        break;
      case "Osun":
        latlong = [7.629959329,4.179992634];
        break;
      case "Oyo":
        latlong = [7.970016092,3.590002806];
        break;
      case "Plateau":
        latlong = [9.929973978,8.890041055];
        break;
      case "Rivers":
        latlong = [4.810002257,7.010000772];
        break;
      case "Sokoto":
        latlong = [13.06001548,5.240031289];
        break;
      case "Taraba":
        latlong = [7.870409769,9.780012572];
        break;
      case "Yobe":
        latlong = [11.74899608,11.96600457];
        break;
      case "Zamfara":
        latlong = [12.1704057,6.659996296];
        break;
      case "FCT":
        latlong = [9.083333149,7.533328002];
        break;
      default:
        latlong = [];
    } 
    req.body.latitude = latlong[0];
    req.body.longitude = latlong[1];
    req.body = req.body;
    next();
}

module.exports.getlatlongFromState = getlatlongFromState;