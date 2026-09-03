# 🚀 AWS Serverless CRUD API

> A production-style serverless CRUD API built with **Amazon API Gateway, AWS Lambda, and Amazon DynamoDB**, with automated deployments through **GitHub Actions and GitHub OIDC**.

[![AWS Lambda](https://img.shields.io/badge/AWS-Lambda-orange?logo=awslambda)](https://aws.amazon.com/lambda/)
[![API Gateway](https://img.shields.io/badge/AWS-API%20Gateway-orange?logo=amazonaws)](https://aws.amazon.com/api-gateway/)
[![DynamoDB](https://img.shields.io/badge/AWS-DynamoDB-blue?logo=amazondynamodb)](https://aws.amazon.com/dynamodb/)
[![GitHub Actions](https://img.shields.io/badge/GitHub-Actions-black?logo=githubactions)](https://github.com/features/actions)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green?logo=node.js)](https://nodejs.org/)

---

## 📌 Overview

This project is a hands-on implementation of a serverless REST API on AWS.

The API supports complete CRUD operations for user records and demonstrates how **API Gateway, Lambda, and DynamoDB work together** to build a backend without managing servers.

The deployment pipeline is also automated. A push to the `main` branch triggers GitHub Actions, which authenticates with AWS using **GitHub OIDC** and deploys the Lambda function using a dedicated IAM role.

---

## 🏗️ Architecture

### Application

```text
┌──────────────┐
│    Client    │
│   Postman    │
└──────┬───────┘
       │ HTTP
       ▼
┌──────────────┐
│ API Gateway  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Lambda    │
│  Node.js API │
└──────┬───────┘
       │ AWS SDK
       ▼
┌──────────────┐
│  DynamoDB    │
│ mentor-name  │
└──────────────┘
```

### Deployment

```text
┌──────────────┐
│    GitHub    │
└──────┬───────┘
       │ Push to main
       ▼
┌──────────────────┐
│ GitHub Actions   │
└────────┬─────────┘
         │ OIDC
         ▼
┌──────────────────┐
│    AWS IAM       │
│ Deployment Role  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ AWS Lambda       │
│ Update Function  │
└──────────────────┘
```

---

## ✨ Features

- ✅ Create users
- ✅ Retrieve all users
- ✅ Retrieve a user by name
- ✅ Update existing users
- ✅ Delete users
- ✅ Input validation
- ✅ Duplicate protection using DynamoDB conditional writes
- ✅ Appropriate HTTP status codes
- ✅ Local Lambda testing
- ✅ Automated Lambda deployment
- ✅ GitHub OIDC authentication
- ✅ Separate IAM roles for deployment and runtime

---

## 🛠️ Tech Stack

| Technology                 | Purpose                          |
| -------------------------- | -------------------------------- |
| **AWS Lambda**             | Serverless application logic     |
| **Amazon API Gateway**     | HTTP API and request routing     |
| **Amazon DynamoDB**        | NoSQL data storage               |
| **AWS IAM**                | Authentication and authorization |
| **AWS STS**                | Temporary AWS credentials        |
| **GitHub Actions**         | CI/CD automation                 |
| **GitHub OIDC**            | Keyless AWS authentication       |
| **Node.js**                | Lambda runtime                   |
| **AWS SDK for JavaScript** | DynamoDB operations              |
| **Postman**                | API testing                      |

---

## 🔄 CRUD Operations

| Method   | Endpoint            | Description         |
| -------- | ------------------- | ------------------- |
| `GET`    | `/users`            | Get all users       |
| `GET`    | `/users/{userName}` | Get a specific user |
| `POST`   | `/users`            | Create a user       |
| `PUT`    | `/users/{userName}` | Update a user       |
| `DELETE` | `/users/{userName}` | Delete a user       |

### Example Response

```json
{
  "name": "Usama",
  "email": "usama@gmail.com",
  "followers": 100
}
```

---

## 🗄️ DynamoDB Design

The DynamoDB table uses:

```text
Table: mentor-name
Partition Key: name
Type: String
```

The API uses DynamoDB operations for the different CRUD actions:

| API Operation | DynamoDB Operation |
| ------------- | ------------------ |
| Get one user  | `GetCommand`       |
| Get all users | `ScanCommand`      |
| Create user   | `PutCommand`       |
| Update user   | `UpdateCommand`    |
| Delete user   | `DeleteCommand`    |

### Duplicate Protection

Creating a user is protected with a DynamoDB condition:

```text
attribute_not_exists(name)
```

If the name already exists, DynamoDB rejects the write and the API returns:

```text
409 Conflict
```

This prevents an accidental create request from silently replacing an existing record.

---

## 🔐 Security

Security was considered as part of the deployment design rather than added afterward.

### GitHub OIDC

GitHub Actions does **not** use long-lived AWS access keys.

Instead:

```text
GitHub Actions
      ↓
OIDC Token
      ↓
AWS STS
      ↓
IAM Role
      ↓
Temporary Credentials
```

### IAM Role Separation

The deployment and runtime permissions are intentionally separated.

**GitHub Actions role**

Used to deploy the Lambda function.

**Lambda execution role**

Used by the running Lambda function to access DynamoDB.

This follows the principle of giving each component only the permissions it needs.

> No AWS access keys, secrets, private credentials, or account-specific credentials are included in this repository.

---

## 🧪 Testing

The application was tested at multiple levels.

### Local Lambda Testing

A local test script invokes the Lambda handler directly and verifies the CRUD operations against DynamoDB.

```text
test.js
   ↓
Lambda handler
   ↓
DynamoDB
```

### API Testing

The deployed API was tested externally using Postman.

```text
Postman
   ↓
API Gateway
   ↓
Lambda
   ↓
DynamoDB
```

The tested scenarios include:

- Successful creation
- Successful retrieval
- Successful update
- Successful deletion
- User not found
- Duplicate user creation
- Invalid requests

---

## 🚀 CI/CD Pipeline

Every push to `main` can trigger the deployment workflow.

```text
git push
   ↓
GitHub Actions
   ↓
npm ci
   ↓
Create Lambda package
   ↓
GitHub OIDC
   ↓
Assume IAM deployment role
   ↓
Deploy Lambda
```

The deployment package contains only the files required by Lambda and its runtime dependencies rather than the complete development repository.

---

## 📁 Project Structure

```text
aws-serverless-crud-api/
│
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── index.js
├── package.json
├── package-lock.json
├── test.js
├── .gitignore
└── README.md
```

`test.js` is used for local testing and is not included in the Lambda deployment package.

---

## 💡 Key Takeaways

This project helped me connect several AWS services into one working serverless application.

The main concepts I practiced were:

- Serverless architecture
- REST API design
- Lambda execution
- API Gateway routing
- DynamoDB CRUD operations
- DynamoDB conditional writes
- IAM roles and permissions
- IAM trust policies
- GitHub OIDC
- Temporary AWS credentials
- GitHub Actions CI/CD
- Local Lambda testing
- Lambda deployment packaging

The most valuable part was understanding how the individual AWS services fit together as one system.

---

## 🎯 Why I Built This

I wanted to move beyond static website deployments and build a complete backend using AWS serverless services.

This project gave me practical experience building, testing, securing, and automatically deploying a real API without managing servers.

---

### Technologies

`AWS` `Lambda` `API Gateway` `DynamoDB` `IAM` `STS` `GitHub Actions` `OIDC` `Node.js` `REST API`
