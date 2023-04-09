# Testing vector databases
A vector database that enables efficient similarity search and indexing of high-dimensional data. Vector databases are particularly useful for machine learning applications, where data points are often represented as high-dimensional vectors. These databases allow users to perform similarity searches based on the embeddings of the data points, making it easier to find relevant information based on content or features.

## Installation
Create a .env file in the root directory and add the variables: OPENAI_APIKEY and DATA_PATH. The DATA_PATH variable should be the path to the data directory:

```
OPENAI_APIKEY=XXXXXXXXXXXXXXXXX
DATA_PATH=C:\Users\your-user-name\path\to\project\data
```

### Client-side
To use this code, you'll need to install the dependencies using:

```
npm install
```

### Server-side
To use database, you will need to setup a Docker instance of the database.

```
docker-compose up -d --build
```

## Usage
Run the script using (requires `ts-node` npm package):

```
ts-node index.ts  <example-name>
```