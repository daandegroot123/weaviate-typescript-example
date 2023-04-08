# Testing vector databases
A vector database that enables efficient similarity search and indexing of high-dimensional data. Vector databases are particularly useful for machine learning applications, where data points are often represented as high-dimensional vectors. These databases allow users to perform similarity searches based on the embeddings of the data points, making it easier to find relevant information based on content or features.

## Installation
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
ts-node index.ts
```

or

```
ts-node combinator.ts
```