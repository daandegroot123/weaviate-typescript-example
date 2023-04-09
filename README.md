# Weaviate vector database using TypeScript and OpenAI's embedder
A vector database enables efficient similarity search and indexing of high-dimensional data. Vector databases are particularly useful for machine learning applications, where data points are often represented as high-dimensional vectors. These databases allow users to perform similarity searches based on the embeddings of the data points, making it easier to find relevant information based on content or features.

In this examplary project, I have used [Weaviate](https://github.com/weaviate/weaviate) as a vector database and their integration with [OpenAI's embedder](https://platform.openai.com/docs/guides/embeddings) (`text-embedding-ada-002-v2`) to create and save vectors of a dataset. As example dataset, I have scraped all the Y Combinator from [their website](https://www.ycombinator.com/companies) (4000+ companies) and created vectors out of key datapoint (see `/examples/y-combinator/schema.json` for more details). I have also uploaded the dataset to [Kaggle](https://www.kaggle.com/datasets/daandegrote/y-combinator-companies-until-w23).

As a second example, I have downloaded a Lord of the Rings character dataset from [Kaggle, created by Paul Mooney](https://www.kaggle.com/datasets/paultimothymooney/lord-of-the-rings-data).

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
Populate the Weaviate database (make sure Docker is running). You can use one of the example datasets provided in the `/examples` directory (currently `y-combinator` and `lotr-character`). 

Running `populate` will create a Weaviate database with the data from the example dataset (and remove any existing data with the same class). _I paid ~$0.20 in OpenAI usage to populate the Y Combinator dataset_
```
ts-node index.ts populate <example-name>
```

If succesful, you can easily view and query your data via the Weaviate GraphQL API. You can use the [Apollo GraphQL Sandbox](https://studio.apollographql.com/sandbox/explorer) to explore the data and run queries. Just enter the graph url (`http://localhost:8080/v1/graphql`).

### Visualize your data
If you want to have some extra fun, you can use [Tensorflow's Embedding Projector](https://projector.tensorflow.org/) to visualize your data. To get the .tsv files required use the following command (will place them inside of the `/example/<example-name>` folder):
```
ts-node index.ts tsv <example-name>
```

These can be uploaded to the website to visualize your data.

## Add your own data
To create your own data, follow on of the examples:
1. Create a new folder inside of `/examples` with the name of your dataset.
2. Create a `schema.json` file in the root of your dataset folder. This file should contain the schema of your data.
3. Create a `data.json` file in the root of your dataset folder. This file should contain the data of your dataset.
4. Run `ts-node index.ts populate <your-dataset-name>` to populate the database with your data.

