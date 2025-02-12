# Real-Time SSH Login Monitoring

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

This project provides a real-time SSH login monitoring system, delivering immediate feedback on login activity to enhance security. It employs a hybrid approach, combining real-time WebSocket updates with efficient API endpoints for search and pagination.

## Features

*   **Real-time Monitoring:** Displays SSH login events as they occur via WebSockets.
*   **Data Persistence:** Stores login event data in a PostgreSQL database for historical analysis.
*   **Efficient Search and Pagination:** Offers a dedicated API endpoint for handling search and pagination, querying the database directly.
*   **User-Friendly Interface:** Presents login event data in a clear and organized format.
*   **Platform Compatibility:** Runs on Linux servers.

## Architecture

The system follows a client-server architecture with a hybrid data retrieval approach:

*   **Backend (Server):**
    *   Monitors the `/var/log/auth.log` file for new SSH login events.  *(Note: The log file location can be configured via environment variables.)*
    *   Parses log lines to extract relevant information (timestamp, username, IP address, status, authentication method).
    *   Stores login event data in a PostgreSQL database.
    *   Broadcasts new login events to connected frontend clients via WebSockets.
    *   Provides an API endpoint to handle search and pagination requests.
*   **Frontend (Client):**
    *   Connects to the backend via WebSockets for real-time updates.
    *   Uses HTTP requests (fetch API) to the backend API endpoint for initial data load and for search and pagination.
    *   Displays real-time login event updates and paginated search results.

## Data Flow

1.  SSH login attempts generate entries in `/var/log/auth.log`.
2.  The backend service monitors this log file.
3.  New log lines are parsed, and the extracted data is stored in the PostgreSQL database.
4.  **Real-time Path:** The backend broadcasts new login event data to connected frontend clients via WebSockets.
5.  **Search/Pagination Path:** When the user performs a search or navigates pages, the frontend sends an HTTP request to the backend API endpoint.
6.  The backend queries the database and returns the results to the frontend.
7.  The frontend updates its display with data from the API endpoint.

## Technical Stack

*   **Backend:**
    *   **Language:** TypeScript
    *   **Framework:** NestJS
    *   **Database:** PostgreSQL
    *   **ORM:** TypeORM
    *   **Real-time Communication:** Socket.IO (WebSockets)
    *   **Log Monitoring:** `tail`
*   **Frontend:**
    *   **Language:** TypeScript
    *   **Framework:** React.js
    *   **UI Library:** Bootstrap
*   **Deployment:** Docker, Docker Compose

## Project Structure

- `server/`: Backend API built with Node.js/Express (or similar).
- `web/`: Frontend built with React.js.
- `docker-compose.yml`: Configures all services to run together with Docker.

## Prerequisites

Before running the project, make sure you have the following installed:

- Docker
- Docker Compose

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <project-folder>
```

### 2. Update the following environment variables in the `/web/.env` file to match your backend service's address:

	```
	REACT_APP_API_URL=http://localhost:3010  # Replace with your backend API URL (e.g., http://your-backend-service:3010)
	REACT_APP_WS_URL=ws://localhost:3010     # Replace with your backend WebSocket URL (e.g., ws://your-backend-service:3010)
	```

	*   If your backend is running in Docker, you'll likely use the service name (e.g., `http://backend:3010` and `ws://backend:3010`).
	*   If running the backend locally, use `localhost` (as shown above).

### 3. Build Docker Containers and start services
	The project is configured using Docker Compose to manage all services. To build the containers for all services (web, server, and postgres-db), use the following command:

```bash
docker compose up -d --build
```
	This will:

	Start the server on port 3010.
	Start the web on port 3000.
	Start PostgreSQL on port 5432 for database operations.

### 4. Access the Application
	Frontend (Web): Access the application by navigating to http://<ip address of server>:3000 in your browser.
	Backend (API): The API is accessible at http://<ip address of server>:3010.
	Backend (WS): The WS is accessible at ws://<ip address of server>:3010.

### 5. Stop Services
	To stop all services, use:

```bash
docker compose down
```

### Docker Compose Configuration
	The docker-compose.yml file defines the following services:

	web (Frontend)
	Build Context: The web service is built from the ./web folder.
	Port Mapping: Exposes the frontend on port 3000.

	server (BackEnd)
	Build Context: The web service is built from the ./server folder.
	Port Mapping: Exposes the server on port 3010.

	postgres(DataBase)
	Build Context: The database is built from the public image postgres docker.
	Port Mapping: Exposes the db on port 5432.

### Environment Variables:
- **API_URL**: Set to http://<ip address of server>:3010 to point to the backend service.
	Dependencies: Depends on the server service.
	server (Backend)
	Build Context: The server service is built from the ./server folder.
	Port Mapping: Exposes the API on port 3010.
	Environment Variables:
	Database connection details (host, port, username, password, database name) are configured for PostgreSQL.

- **WS_URL**: Set to ws://<ip address of server>:3010 to point to the backend web socket service.
	Dependencies: Depends on the server service.
	server (Backend)
	Build Context: The server service is built from the ./server folder.
	Port Mapping: Exposes the WS on port 3010.
	Environment Variables:
	Database connection details (host, port, username, password, database name) are configured for PostgreSQL.

- **API_PORT**: Set to 3010 to indicate the backend API port.

	Dependencies: Depends on the postgres-db service.
	postgres-db (Database)
	Image: Uses the official postgres Docker image.
	Port Mapping: Exposes the PostgreSQL database on port 5432.
	Environment Variables:
	POSTGRES_USER: Username for PostgreSQL.
	POSTGRES_PASSWORD: Password for PostgreSQL.
	POSTGRES_DB: Name of the PostgreSQL database.
	Healthcheck: Ensures that PostgreSQL is ready before starting the server.

	Configuration Options
	Environment Variables
	You can set the following environment variables in your .env file for each service:

### server service:

- **DB_HOST**: Database hostname (default: postgres-db).
- **DB_PORT**: Database port (default: 5432).
- **DB_USERNAME**: Database username (default: admin).
- **DB_PASSWORD**: Database password (default: admin).
- **DB_NAME**: Database name (default: ssh_monitor).
- **API_PORT**: API port (default: 3010).
- **DB_RUN_MIGRATIONS**: run migrations (default: true).
- **LOG_FILE**: path to log file (default: /var/log/auth.log for Ubuntu and & Debian-based systems, for CentOS, RHEL, and Fedora the log file is /var/log/secure).

### web service:

- **API_URL**: API URL for communication with the backend (default: http://server:3010).
- **WS_URL**: WS URL for communication with the backend (default: ws://server:3010).

## Search and Pagination

*   **Page Size:** Hardcoded.
*   **Debounce:** Hardcoded delay for search/filter input.
*   **HTTP Requests:** Pagination data is fetched via HTTP requests.

## Future Enhancements

*   Reading the entire log file once if need (Currently we don't know a size the file and in restart time records in the DB also will be dublicated).
*   Configurable page size and debounce time.
*   WebSocket rooms for more efficient real-time updates (potentially).