# Social Media Backend Server

## Description

This repository contains the backend code for a social media application built using Node.js. It provides various features such as user authentication, file uploading to AWS S3, validation, logging, and more.

## Technologies Used

- **Node.js**: A JavaScript runtime built on Chrome's V8 JavaScript engine.
- **Express.js**: A fast, unopinionated, minimalist web framework for Node.js.
- **MongoDB**: A NoSQL database used for storing application data.
- **Mongoose**: An Object Data Modeling (ODM) library for MongoDB and Node.js.
- **Passport.js**: Authentication middleware for Node.js.
- **JWT (JSON Web Tokens)**: A compact, URL-safe means of representing claims to be transferred between two parties.
- **AWS SDK**: SDK for interacting with AWS services, used for S3 file storage.
- **bcrypt**: A library for hashing passwords.
- **Helmet**: Middleware to help secure Express apps by setting various HTTP headers.
- **Cors**: Middleware for enabling Cross-Origin Resource Sharing (CORS) in Express.js.
- **Express Validator**: Middleware for validating request data.
- **Multer**: Middleware for handling `multipart/form-data`, used for file uploads.
- **Multer-S3**: Multer storage engine for AWS S3.
- **Winston**: A versatile logging library for Node.js.

## Setup

1. **Clone the repository**:

    ```
    git clone <repository-url>
    ```

2. **Install dependencies**:

    ```
    npm install
    ```

3. **Set environment variables**:

    Create a `.env` file in the root directory and add the following variables:

    ```
    PORT=3000
    MONGODB_URI=<your-mongodb-uri>
    JWT_SECRET=<your-jwt-secret>
    AWS_ACCESS_KEY_ID=<your-aws-access-key-id>
    AWS_SECRET_ACCESS_KEY=<your-aws-secret-access-key>
    AWS_REGION=<your-aws-region>
    AWS_S3_BUCKET=<your-aws-s3-bucket-name>
    ```

4. **Run the server**:

    ```
    npm run dev
    ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.
