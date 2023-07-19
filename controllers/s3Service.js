const { S3 } = require("aws-sdk");
require("dotenv").config();

exports.s3Uploadv2 = async (files) => {
  const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  const uploadPromises = Object.keys(files).map(async (fieldname) => {
    const file = files[fieldname][0];

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `uploads/${file.fieldname}-${file.originalname}`,
      Body: file.buffer,
    };

    return await s3.upload(params).promise();
  });

  return Promise.all(uploadPromises);
};