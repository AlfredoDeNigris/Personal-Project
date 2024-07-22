# Table of Contents

- [Description](#Description)

- [Technical Requirements](#technical-requirements)

- [API Documentation](#api-documentation)

- [Installation](#Installation)

- [Run](#Run)

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

## 1. Endpoint api/login:

Endpoint: api/login
Standard: JWT

curl -X POST http://localhost:8080/api/login  
  -H 'Content-Type: application/json'  
  -d '{  
    "username": "ignacioDeNigris",  
    "password": "password"  
}'


Response:

"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNzIxMzQ0NTg3LCJleHAiOjE3MjEzNDQ2NDd9.y4DPa0BcKABeyCzZxJ4OPZzR_aUN_Vo1wmpuvfMiVLw"


## 2. Endpoint api/client/register:

### POST api/client/register - create new client

curl -X POST http://localhost:8080/api/client/register  
  -H 'Content-Type: application/json'  
  -d '{
    "full_name": "Ignacio De Nigris",  
    "username": "ignacioDeNigris",  
    "password": "securePassword123",  
    "billing_address": "123 Main St, Anytown, USA",  
    "phone_number": "123-456-7890",  
    "email": "ignaciodenigris@gmail.com"  
}'


The request body should contain the required information for creating a new client, such as full_name, username, password, billing_address, phone_number and email.

Server should answer with status code 201 and newly created record.

Server should answer with status code 400 and corresponding message if request body does not contain required fields.


## 3. Endpoint api/client/profile:

### GET api/client/profile/:client_id - get client's information

curl -X GET http://localhost:8080/api/client/profile/{client_id}  
  -H 'Accept: application/json'


Server should answer with status code 200 and record with id === client_id if it exists.

Server should answer with status code 400 and corresponding message if client_id is invalid.

Server should answer with status code 404 and corresponding message if record with id === client_id does not exist.


### PUT api/client/profile/:client_id - updates client's information

curl -X PUT http://localhost:8080/api/client/profile/{client_id}  
  -H 'Content-Type: application/json'  
  -d '{  
    "full_name": "Alfredo De Nigris",  
    "username": "alfredoDeNigris",  
    "password": "newSecurePassword123",  
    "billing_address": "456 Main St, Anytown, USA",  
    "phone_number": "987-654-3210",  
    "email": "alfredodenigris@gmail.com"  
}'


The request body should contain the required information for editing the existin client information, such as full_name, username, password, billing_address, phone_number and email.

Server should answer with status code 200 and record with id === client_id if it exists.

Server should answer with status code 400 and corresponding message if client_id is invalid.

Server should answer with status code 404 and corresponding message if record with id === client_id does not exist.


### DELETE api/client/profile/:client_id - delete existing client

curl -X DELETE http://localhost:8080/api/client/profile/{client_id}


Server should answer with status code 204 if the record was found and deleted.

Server should answer with status code 400 and corresponding message if client_id is invalid.

Server should answer with status code 404 and corresponding message if record with id === client_id does not exist.


## 4. Endpoint api/house-catalogue:

### GET api/house-catalogue - get all housing options

curl -X GET http://localhost:8080/api/house-catalogue  
  -H 'Accept: application/json'  


Server should answer with status code 200 and all housing options records.

### GET api/house-catalogue/:budget - get all housing options with a comercial_cost less or equal to the inputed amount

curl -X GET http://localhost:8080/api/house-catalogue/{amount}  
  -H 'Accept: application/json'


Server should answer with status code 200 and all housing options with a comercial_cost less or equal to the inputed amount.


### GET api/house-catalogue/:house_model_id - Obtein information about the house selected by the client.

curl -X GET http://localhost:8080/api/house-catalogue/{house_model_id}  
  -H 'Accept: application/json'


Server should answer with status code 200 and record with id === house_model_id if it exists.

Server should answer with status code 400 and corresponding message if house_model_id is invalid.

Server should answer with status code 404 and corresponding message if record with id === house_model_id does not exist.


## 5. Endpoint api/features:

### GET api/features - get all features

curl -X GET http://localhost:8080/api/features  
  -H 'Accept: application/json'  


Server should answer with status code 200 and all features records.

### GET api/features/:difference - get all features with a unit_cost less or equal to the difference between the client's budget and the selected house's comercial_cost

curl -X GET http://localhost:8080/api/features/{difference}  
  -H 'Accept: application/json'  


Server should answer with status code 200 and all features with a unit_cost less or equal to the difference between the client's budget and the selected house's comercial_cost.

## 6. Endpoint api/selected_house

### POST api/selected_house - create a new selected_house

curl -X POST http://localhost:8080/api/selected_house  
  -H 'Content-Type: application/json'  
  -d '{  
    "client_id": 1,  
    "house_id": 2,  
    "final_price": 150000  
}'


The request body should contain the required information for creating a new selected_house, such as client_id, house_model_id, and final_price.

Server should answer with status code 201 and newly created record.

Server should answer with status code 400 and corresponding message if request body does not contain required fields.

### PUT api/selected_house/:client_id/:house_model_id - updates selected_house information

curl -X PUT http://localhost:8080/api/selected_house/{client_id}/{house_model_id}  
  -H 'Content-Type: application/json'  
  -d '{  
    "client_id": 5,  
    "house_model_id": 9,  
    "final_price": 155000  
}'


The request body should contain the required information for editing the existin selected_house information, such as client_id, house_model_id, and final_price.

Server should answer with status code 200 and record with id === client_id and record with id === house_model_id if they both exists.

Server should answer with status code 400 and corresponding message if either client_id and/or house_model_id are invalid.

Server should answer with status code 404 and corresponding message if either record with id === client_id does not exist and/or record with id === house_model_id does not exist.

### DELETE api/selected_house/:client_id/:house_model_id - deletes existing selected_house

curl -X DELETE http://localhost:8080/api/selected_house/{client_id}/{house_model_id}


Server should answer with status code 204 if the record was found and deleted.

Server should answer with status code 400 and corresponding message if either client_id and/or house_model_id are invalid.

Server should answer with status code 404 and corresponding message if either record with id === client_id does not exist and/or record with id === house_model_id does not exist.

## 7. Endpoint api/selected_house_feature

### POST api/selected_house_feature/:feature_id - create a new selected_house_feature

curl -X POST http://localhost:8080/api/selected_house_feature/{feature_id}  
  -H 'Content-Type: application/json'  
  -d '{  
    "client_id": 1,  
    "house_model_id": 2,  
    "feature_id": 3,  
    "quantity": 2  
}'


The request body should contain the required information for creating a new selected_house_feature, such as client_id, house_model_id, feature_id and quantity.

Server should answer with status code 201 and newly created record.

Server should answer with status code 400 and corresponding message if request body does not contain required fields.

### PUT api/selected_house/:client_id/:house_model_id/:feature_id - updates selected_house_feature information

curl -X PUT http://localhost:8080/api/selected_house/{client_id}/{house_model_id}/{feature_id}  
  -H 'Content-Type: application/json'  
  -d '{  
    "client_id": 1,  
    "house_model_id": 2,  
    "feature_id": 3,  
    "quantity": 4  
}'


The request body should contain the required information for editing the existin selected_house_feature information, such as client_id, house_model_id, feature_id and quantity.

Server should answer with status code 200 and record with id === client_id, record with id === house_model_id and id === feature_id if they  exists.

Server should answer with status code 400 and corresponding message if either client_id and/or house_model_id and/or feature_id are invalid.

Server should answer with status code 404 and corresponding message if any record with id === client_id does not exist and/or record with id === house_model_id does not exist and/or feature_id does not exist.

### DELETE api/selected_house/:client_id/:house_model_id/:feature_id - deletes existing selected_house_feature

curl -X DELETE http://localhost:8080/api/selected_house/{client_id}/{house_model_id}/{feature_id}


Server should answer with status code 204 if the record was found and deleted.

Server should answer with status code 400 and corresponding message if either client_id and/or house_model_id and/or feature_id are invalid.

Server should answer with status code 404 and corresponding message if any record with id === client_id does not exist and/or record with id === house_model_id does not exist and/or feature_id does not exist.

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

cd Personal Proeject

## Install dependencies:

npm install

# Run

## Run in docker container


To run the application in a Docker container, you should have Docker installed on your system.

## Run the app:

docker compose up

## Stop the app:

docker compose down
