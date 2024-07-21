# Table of Contents

- [Description](#Description)

- [Technical Requirements](#technical-requirements)

- [API Documentation](#api-documentation)

- [Installation](#Installation)

# Description

This is a budget planning tool for construction companies.
When a client provides a budget, the system lists all housing options that can be built within that budget,
as well as any additional features the client might want to add.

# Technical Requirements

Programming language - JavaScript (Node.js)
Node.js - 18.16.0
Database - MySQL
Docker

## Base URL

http://localhost:8080

# API Documentation

1. Endpoint api/v2/login:


Endpoint: api/v2/login
Standard: JWT

Request :

curl -X POST http://localhost:3000/api/v2/login \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "username",
    "password": "password"
}'


Response:

"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNzIxMzQ0NTg3LCJleHAiOjE3MjEzNDQ2NDd9.y4DPa0BcKABeyCzZxJ4OPZzR_aUN_Vo1wmpuvfMiVLw"

2. Endpoint api/v2/housing-options:


### GET api/v2/housing-options - get all housing options

Server should answer with status code 200 and all housing options records.


### GET api/v2/housing-options/{optionId} - get one housing option by ID

Server should answer with status code 200 and record with id === optionId if it exists.

Server should answer with status code 400 and corresponding message if optionId is invalid.

Server should answer with status code 404 and corresponding message if record with id === optionId doesn't exist.


### POST api/v2/housing-options - create a new housing option.

The request body should contain the required information for creating a new housing option, such as name, labor costs, 
material prices, and construction time.

Server should answer with status code 201 and newly created record.

Server should answer with status code 400 and corresponding message if request body does not contain required fields.


### PUT api/v2/housing-options/{optionId} - update existing housing option.

The request body should contain the updated information for the housing option.

Server should answer with status code 200 and update the record.

Server should answer with status code 400 and corresponding message if optionId is invalid.

Server should answer with status code 404 and corresponding message if record with id === optionId doesn't exist.


### DELETE api/v2/housing-options/{optionId} - delete existing housing option from database

Server should answer with status code 204 if the record was found and delete the record.

Server should answer with status code 400 and corresponding message if optionId is invalid.

Server should answer with status code 404 and corresponding message if record with id === optionId doesn't exist.


3. Endpoint api/v2/budget:


### POST api/v2/budget - provide a budget and get a list of all housing options that can be built within that budget.

The request body should contain the budget amount.

Server should answer with status code 200 and a list of housing options within the budget.

Server should answer with status code 400 and corresponding message if the budget amount is not provided or invalid.

# Installation

## Node.js:

To install Node.js version 18.16.0:

1. Using Node Version Manager (nvm):

sh

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

source ~/.nvm/nvm.sh

nvm install 18.16.0

nvm use 18.16.0

2. Using a package manager:

On Ubuntu/Debian:

sh

sudo apt update

sudo apt install -y nodejs npm

sudo npm install -g n

sudo n 18.16.0

On macOS:

sh

brew install node@18

On Windows:

Download the installer from Node.js official website and follow the instructions.

## Docker

To install Docker:

On Ubuntu/Debian:

sh

sudo apt update

sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

sudo apt update

sudo apt install -y docker-ce

sudo systemctl status docker

On macOS:

Download and install Docker Desktop from Docker's official website.

On Windows:

Download and install Docker Desktop from Docker's official website.

## Clone this repo with the command:

git clone <https://github.com/AlfredoDeNigris/Personal-Project>

## Go to the project folder:

cd budgetPlanner

## Install dependencies:

npm install

## Run in docker container

For running the application in a Docker container, you should have Docker installed on your system.

## Run the app:

docker compose up

## Stop the app:

docker compose down
