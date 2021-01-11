// Attachment download
const downloadAttachment = (req, res) => {
    const filePath = req.params.path;
    const directoryPath =  __basedir + "/uploads/chatAttachments/"  
    res.download(directoryPath + filePath, (err) => {
      if (err) {
        res.status(500).send({
          message: "Could not download the file. " + err,
        });
      }
    });
  };

  const userProfile = (req, res) => {
    const filePath = req.params.path;
    const directoryPath =  __basedir + "/uploads/images/"
    res.sendFile(directoryPath + filePath, (err) => {
      if (err) {
        res.status(500).send({
          message: "Could not load the image " + err,
        });
      }
    });
  };


module.exports = {
  downloadAttachment,
  userProfile
};