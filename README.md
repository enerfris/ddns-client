# DDNS Client for Google Cloud DNS

This project is a simple DDNS client that updates an A record in Google Cloud DNS every 5 minutes using Node.js and Docker.

## Requirements

- Node.js
- Docker
- Docker Compose
- A Google Cloud account with DNS management permissions and a service account with a JSON key

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ddns-client.git
cd ddns-client
```

### 2. Create the .env File

Copy the .env.example file to .env and fill in the necessary values:

```bash
cp .env.example .env
```

### 3. Service Account File

Place the JSON file of the service account in the project directory. Then, update the .env file to include the keys from the JSON file:

### 4. Install Dependencies

Make sure you have Node.js installed and run the following command to install project dependencies:

```bash
npm install
```

### 5. Build and Deploy the Container

Use Docker Compose to build and deploy the container:

```bash
docker-compose up --build -d
```
