
# Technical task from Pipedrive

Pipedrive Technical task. This is a simple application, written in javascript. The application will launch a local API with 4 endpoints, 3 of which will forward requests to the public Pipedrive and one will provide some metrics for the other endpoints.

The main file is **server.js**, using express, we launch a local API that will serve as the middlepoint for requests to Pipedrive deals API.
The endpoints will redirect requests to the Pipedrive API and return the retrieved data in json format. Github actions workflows were created as per instruction, to run the tests as well as CD.



## Installation

Install my-project with npm

1. Clone the repository with git clone

2. Navigate to project directory. Install the dependencies:

```bash
  npm install
```

3. If running locally, set up the configuration by creating a `.env` file and adding your API key to the API_KEY variable.
```API_KEY=YOUR_API_KEY```

4. Start the local API server:
```bash
  npm start
```

The API will be running on http://localhost:3000

Endpoints listed below.

Example: GET deals

```GET http://localhost:3000/deals```

## Docker

A docker file is included with the project. Should you wish to run the app inside of a container, follow these steps:

1. Ensure Docker is installed and running on your system.

2. Navigate to the cloned projects directory.

3. Run the command to create the image:
```docker build -t my-image . ``` 

Replace **my-image** with your desired name.

4. Once the image is built, run the following:
```docker run -p 4000:3000 -e API_KEY=YOUR_KEY my-image```

**API_KEY** - the .env file is in dockerignore, it is usually not recommended to have it within the container, instead we use an environment variable and pass it into the container.

The container with theAPI will be running on http://localhost:4000



## API Reference

#### Get all deals

```http
  GET /deals
```

By default, will return all deals in json format. Query params from pipedrive API may be passed.


#### Create deal

```http
  POST /deals
```

| Body parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `title`      | `string` | **Required**. The title is required|

Will create a new deal. The body should contain the data object with necessary fields. Additional info on Pipedrive page.


#### Update deal

```http
  PUT /deals
```

| Query parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `integer` | **Required**. The id of the deal to update|

Will update a deal with the target id. Id is expected to be in the query param.

```http
  GET /metrics
```

Returns a json response with the metrics data for the GET/PUT/POST endpoints.


## Other commands

A testfile is present within the **tests** folder, to run the tests:
```bash
  npm test
```

To run lint:

```bash
  npm run lint
```

## Github Actions

Inside of `.github/workflows`, there are 2 files. **test.yml**, which runs our tests on commits to the repo, as well as **deployment.yml**, which runs when a pull request is merged to the main branch. Per task description, right now it gives out an echo "Deployed". In a big project, could be used to trigger additional workflows/actions.



