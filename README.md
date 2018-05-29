# Serverless Login Screen

Template for session authentication using Serverless and Node.

## Prerequisites

- Docker
- Docker Compose
- Make
- AWS Admin Access

## Environment variables

Make sure you have set your environment variables properly or create a file `.env`. The file `.env.template` contains the environment variables that are used by the application. Keys found in LastPass.

## Make Usage

```bash
# using . env.template for .env as an example
$ make dotenv DOTENV=.env.template
# OR 
$ make .env
# Deploy the lambda stack
$ make deploy
# Remove the lambda stack
$ make remove
```

## RDS

Build required tables with this SQL script after you fire up an RDS instance:

```
CREATE TABLE `users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(20) DEFAULT NULL,
  `password` varchar(200) DEFAULT NULL,
  `first` varchar(20) DEFAULT NULL,
  `last` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
```

### Connecting LAMBDA to RDS

After deploying the Lambdas;

1. Place the Lambda function in the same VPC as your RDS instance
2. Your lambda execution role you will need to have VPC execution added to it in IAM
3. Assign a security group to the lambda function
4. In the security attached to the RDS instance, add an inbound rule for mysql (port 3306) and rather than adding it for an IP address add it for your lambda functions security group
5. Add the connection details of the VPC settings of the .env file and deploy or manually to each Lambda

## Develop

Uncomment the Offline plugin in serverless.yml 

```bash
# using offline mode
$ make offline
```
