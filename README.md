# ChromaDB Example: Lord of the Rings Characters
This code creates a collection of Lord of the Rings (LOTR) characters using the ChromaDB client. ChromaDB is a vector database that enables efficient similarity search and indexing of high-dimensional data. Vector databases are particularly useful for machine learning applications, where data points are often represented as high-dimensional vectors. These databases allow users to perform similarity searches based on the embeddings of the data points, making it easier to find relevant information based on content or features.

In this example, we demonstrate how to create a custom embedding function, load a CSV file, and store the generated embeddings into a JSON file, all using the ChromaDB client to create a vector database of LOTR characters.

## Installation
### Client-side
To use this code, you'll need to install the dependencies using:

```
npm install
```

### Server-side
To use ChromaDB, you will need to setup a Docker instance of the database. You can do this by following the instructions in the [ChromaDB docs](https://docs.trychroma.com/getting-started):

```
git clone git@github.com:chroma-core/chroma.git
cd chroma
docker-compose up -d --build
```

## Usage
Run the script using (requires `ts-node` npm package):

```
ts-node chroma.ts
```