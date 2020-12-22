// Attachment download
const download = (req, res) => {
    const filePath = req.params.path;
    console.log(filePath)
    const directoryPath =  __basedir + "/uploads/chatAttachments/"
    console.log(directoryPath)
  
    res.download(directoryPath + filePath, (err) => {
      if (err) {
        res.status(500).send({
          message: "Could not download the file. " + err,
        });
      }
    });
  };

exports.download = download;