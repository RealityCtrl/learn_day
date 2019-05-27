'use strict';

const AWS = require('aws-sdk');
const S3 = new AWS.S3({
  signatureVersion: 'v4',
});
const Sharp = require('sharp');
const width = 100
const height = 100
const OutputBucket = process.env.BUCKET;


exports.handler = function(event, context, callback) {
  try{
    console.log(event.Records[0].body)
    event.Records.forEach(message => {
      console.log(`start processing message ${message}`)
      const s3Event = JSON.parse(message.body)
      const originalKey = s3Event.Records[0].s3.object.key
      const inputBucket  = s3Event.Records[0].s3.bucket.name;
      console.log(`bucket: ${inputBucket} key: ${originalKey}`)
      S3.getObject({Bucket: inputBucket, Key: originalKey}).promise()
        .then(console.log('s3 object loaded'))
        .then(data => Sharp(data.Body)
          .resize(width, height)
          .toFormat('png')
          .toBuffer()
        )
        .then(console.log('image resized'))
        .then(buffer => S3.putObject({
            Body: buffer,
            Bucket: OutputBucket,
            ContentType: 'image/png',
            Key: originalKey,
          }).promise()
        )
        .then(console.log(`Key ${originalKey} processed`))
    })
  }catch(err){
    console.log(err)
  }

    callback(null, {
    statusCode: '200',
    body: 'Sucess',
  });


}



