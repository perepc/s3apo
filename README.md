# S3 File Uploader As Public Object (s3apo)

<p align="center">
  <img src="public/sapo.png" alt="s3apo Logo"/>
</p>

## Description

This application allows users to upload files to an Amazon S3 bucket and make them publicly accessible. It provides a user-friendly interface for entering AWS credentials, selecting files, and monitoring the upload status. The application is built using React and utilizes the AWS SDK for JavaScript to interact with S3.

### Context

My wife needed to upload files to an S3 bucket and make them publicly accessible. As she is not a developer, I thought it would be a good idea to create an application that would allow her to do that easily. So I created s3apo. "Sapo" is the spanish word for "toad".

### Features

- User authentication via AWS credentials (Access Key, Secret Key).
- File selection for multiple uploads.
- Real-time upload status updates.
- Sets public access to uploaded files (outputs public url for each file).

## Prerequisites

Before using this application, ensure you have the following:

- An AWS account.
- An S3 bucket created in your AWS account.

## S3 Bucket Configuration

To successfully upload files to your S3 bucket, you need to configure the bucket with the following settings:

1. **Bucket Policy**: Ensure your bucket policy allows public access if you want the uploaded files to be publicly accessible. Here is an example policy:

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-bucket-name/*"
       }
     ]
   }
   ```

   Replace `your-bucket-name` with the actual name of your bucket.

2. **CORS Configuration**: Set up CORS (Cross-Origin Resource Sharing) to allow your application to interact with the S3 bucket. Here is an example CORS configuration:

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <CORSConfiguration>
       <CORSRule>
           <AllowedOrigin>https://your-domain.com</AllowedOrigin>
           <AllowedMethod>GET</AllowedMethod>
           <AllowedMethod>PUT</AllowedMethod>
           <AllowedMethod>POST</AllowedMethod>
           <AllowedMethod>DELETE</AllowedMethod>
           <AllowedHeader>*</AllowedHeader>
       </CORSRule>
   </CORSConfiguration>
   ```

   Replace `https://your-domain.com` with your domain name or `*` to allow all domains.

3. **IAM User Permissions**: Create an IAM user with permissions to access the S3 bucket. Attach the following policy to the user:

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:PutObjectAcl",
           "s3:GetObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::your-bucket-name",
           "arn:aws:s3:::your-bucket-name/*"
         ]
       }
     ]
   }
   ```

   Again, replace `your-bucket-name` with the actual name of your bucket.

## Usage

1. Clone the repository.
2. Install the dependencies using `npm install`.
3. Run the application using `npm start`.
4. Enter your AWS credentials and bucket information in the provided fields.
5. Select the files you want to upload and click the "Upload Files" button.
6. The application will display the public URL for each uploaded file.

Feel free to use this application as a template to build your own application or to use it as a component for your own projects.

## License

This project is licensed under the MIT License.