import weaviate, { WeaviateClient, ObjectsBatcher } from 'weaviate-ts-client';
import csv from "csvtojson";
import fs from 'fs';

const client: WeaviateClient = weaviate.client({
  scheme: 'http',
  host: 'localhost:8080',
});

async function deleteClass(className: string) {
  client.schema.classDeleter().withClassName(className).do().then((res: any) => {
    //console.log(res);
  })
  .catch((err: Error) => {
    console.error(err)
  });;
}

async function createClass(schemaObj: any) {
  client.schema.classCreator().withClass(schemaObj).do().then((res: any) => {
    //console.log(res);
  })
  .catch((err: Error) => {
    console.error(err)
  });
}

async function populateData(example: string) {
  // Get the data from the data.json file and read the class that is used in the schema
  const schemaObj = JSON.parse(fs.readFileSync('./examples/' + example + '/schema.json', 'utf8'));
  const className = schemaObj.class;

  // We are repopulating all the data, thus we remove existing data (if any) first
  deleteClass(className);
  createClass(schemaObj);
  // Get the data from the data.json file
  const { data } = JSON.parse(fs.readFileSync('./examples/' + example + '/data.json', 'utf8'));

  // Prepare a batcher
  let batcher: ObjectsBatcher = client.batch.objectsBatcher();
  let counter: number = 0;
  let batchSize: number = 10;
  let batchNumber = 1;

  data.forEach((dataPoint: any) => {

    // Create object properties from schema (make sure the property names match the schema)
    const properties: any = {};
    schemaObj.properties.forEach((property: any) => {
      properties[property.name] = dataPoint[property.name];
    });

    // Create an object
    const obj = {
      class: className,
      properties: properties,
    }

    // add the object to the batch queue
    batcher = batcher.withObject(obj);

    // When the batch counter reaches batchSize, push the objects to Weaviate
    if (counter++ == batchSize) {

      batchNumber += 1

      // flush the batch queue
      batcher
      .do()
      .catch((err: Error) => {
        console.error(err)
      });

      console.log('batchNumber', batchNumber)

      // restart the batch queue
      counter = 0;
      batcher = client.batch.objectsBatcher();
    }
  });

  // Flush the remaining objects
  batcher
  .do()
  .then((res: any) => {
    //console.log(res)
  })
  .catch((err: Error) => {
    console.error(err)
  });
}

function main() {
  // populateData(process.argv[2]);
  getAllVectors();
}

async function similarText(text: string) {
  client.graphql
  .get()
  .withClassName('Character')
  .withFields('birth death gender hair height name race realm spouse _additional {certainty}')
  .withNearText({concepts: [text]})
  .withLimit(5)
  .do()
  .then((res: any) => {
    console.log(JSON.stringify(res, null, 2))
  })
  .catch((err: Error) => {
    console.error(err)
  });
}

//similarText('Bilbo Baggins')

import { OpenAIApi, Configuration } from 'openai';

async function openAiVec(text: string) {
  const configuration = new Configuration({
    apiKey: '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',
  });
  
  const openai = new OpenAIApi(configuration);
  const response = await openai.createEmbedding({
    model: "text-embedding-ada-002",
    input: text,
  });

  //console.log(response.data.data[0].embedding)
  fs.writeFileSync('embedding.json', JSON.stringify(response.data.data[0].embedding, null, 2));
  return response.data.data[0].embedding;
}

async function similarVector(vector: number[]) {
  client.graphql
  .get()
  .withClassName('Character')
  .withFields('birth death gender hair height name race realm spouse _additional {certainty}')
  .withNearVector({ vector })
  .withLimit(5)
  .do()
  .then((res: any) => {
    console.log(JSON.stringify(res, null, 2))
  })
  .catch((err: Error) => {
    console.error(err)
  });
}

async function start(text: string) {
  await openAiVec(text)
  similarVector(JSON.parse(fs.readFileSync('embedding.json', 'utf8')))
}

//start('Wizard')

import { TSV } from 'tsv';

async function createTsv() {
  const characters = await csv().fromFile('./lotr_characters.csv');

  const meta = TSV.stringify(characters)
  fs.writeFileSync('meta.tsv', meta)
}

//createTsv()

async function getAllVectors() {
  client.graphql
  .get()
  .withClassName('Company')
  .withFields('name')
  .withLimit(5000)
  .do()
  .then((res: any) => {
    console.log(res.data.Get.Company.length)
  })
  .catch((err: Error) => {
    console.error(err)
  });
}

main();