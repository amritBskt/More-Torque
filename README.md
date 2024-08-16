# TorqueTrack - Conference Booking Application

## Overview

More Torque (MT) is a comprehensive backend system designed to manage vehicles and organizations for a conference booking application. The project involves handling vehicle information, organizational hierarchies, and policy inheritance. It features VIN decoding, rate limiting, caching, and secure API access. This project was developed using Node.js with ExpressJS and MongoDB.

## Features

- **VIN Decoding:** Extracts and provides manufacturer, model, and year information from VINs using the NHTSA API.
- **Vehicle Management:** Allows CRUD operations for vehicles, including VIN validation and integration with organizational data.
- **Organization Management:** Supports hierarchical organizational structures with parent-child relationships and policy inheritance.
- **Policy Inheritance:** Automatically propagates fuel reimbursement and speed limit policies across organizational levels.
- **Rate Limiting:** Implements rate limiting to prevent abuse and ensure fair use of the API.
- **Caching:** Uses caching to optimize performance and reduce redundant API calls.
- **Authentication:** Ensures secure API access by verifying authorized users.

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/amritBskt/TorqueTrack.git
   cd more-torque
   ```
   
2. **Install Dependencies**

    ```bash
    npm install
    ```
    
3. **Configuration**
    - Set up environment variables in a .env file (if needed).
    - Ensure MongoDB is running locally or configure the connection string in your environment.

4. **Run the Application**

    ```bash
    npm start
    ```

5. **Run Tests**

    ```bash
    npm test
    ```

## API Endpoints

**Vehicles**

1. **POST /vehicles**
    - Adds a new vehicle to the system.
    - Request body: { vin: "xxxxxxxx", org: "yyyyyy" }
    - Decodes VIN, checks organization, and stores vehicle details.
    
2. **GET /vehicles/decode/**
    - Decodes VIN and retrieves vehicle information.
    - Returns cached data if available.

**Organizations**

1. **POST /orgs**
    - Creates a new organization.
    - Request body: { name, account, website, fuelReimbursementPolicy, speedLimitPolicy }
    - Assigns the new organization a random parent from existing organizations, or null if none exist.

2. **PATCH /orgs**
    - Updates organization details and policies.
    - Request body: { id, account, website, fuelReimbursementPolicy, speedLimitPolicy }
    - Propagates policy changes to child organizations.

3. **GET /orgs**
    - Retrieves all organizations with parent details if available.

## License
This project is licensed under the MIT License.
