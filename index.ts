import weaviate, { WeaviateClient, ObjectsBatcher } from 'weaviate-ts-client';
import fetch, { Response } from 'node-fetch';  // Note that Node implements its own Response type
import csv from "csvtojson";
import fs from 'fs';

const client: WeaviateClient = weaviate.client({
  scheme: 'http',
  host: 'localhost:8080',
  headers: {'X-OpenAI-Api-Key': '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'}
});

async function getJsonData(): Promise<any> {
  const characters = await csv().fromFile('./lotr_characters.csv');
  return characters;
}

async function importQuestions() {
  // Get the data from the data.json file
  const data = await getJsonData();

  // Prepare a batcher
  let batcher: ObjectsBatcher = client.batch.objectsBatcher();
  let counter: number = 0;
  let batchSize: number = 100;

  client.schema.classDeleter().withClassName('Character').do().then((res: any) => {
    console.log(res);
    })
    .catch((err: Error) => {
    console.error(err)
    });;

  interface Character {
    birth: string;
    death: string;
    gender: string;
    hair: string;
    height: string;
    name: string;
    race: string;
    realm: string;
    spouse: string;
  }

  // Create schema
  const schemaObj = {
    'class': 'Character',
    'vectorizer': 'text2vec-openai',
    "moduleConfig": {
      "text2vec-openai": {
        "model": "ada",
        "modelVersion": "002",
        "type": "text"
      }
    },
    "properties": [
      {
        "dataType": [
          "text"
        ],
        "moduleConfig": {
          "text2vec-openai": {
            "skip": false,
            "vectorizePropertyName": true
          }
        },
        "name": "birth"
      },
      {
        "dataType": [
          "text"
        ],
        "moduleConfig": {
          "text2vec-openai": {
            "skip": false,
            "vectorizePropertyName": true
          }
        },
        "name": "death"
      },
      {
        "dataType": [
          "text"
        ],
        "moduleConfig": {
          "text2vec-openai": {
            "skip": false,
            "vectorizePropertyName": true
          }
        },
        "name": "gender"
      },
      {
        "dataType": [
          "text"
        ],
        "moduleConfig": {
          "text2vec-openai": {
            "skip": false,
            "vectorizePropertyName": true
          }
        },
        "name": "hair"
      },
      {
        "dataType": [
          "text"
        ],
        "moduleConfig": {
          "text2vec-openai": {
            "skip": false,
            "vectorizePropertyName": true
          }
        },
        "name": "height"
      },
      {
        "dataType": [
          "text"
        ],
        "moduleConfig": {
          "text2vec-openai": {
            "skip": false,
            "vectorizePropertyName": true
          }
        },
        "name": "name"
      },
      {
        "dataType": [
          "text"
        ],
        "moduleConfig": {
          "text2vec-openai": {
            "skip": false,
            "vectorizePropertyName": true
          }
        },
        "name": "race"
      },
      {
        "dataType": [
          "text"
        ],
        "moduleConfig": {
          "text2vec-openai": {
            "skip": false,
            "vectorizePropertyName": true
          }
        },
        "name": "realm"
      },
      {
        "dataType": [
          "text"
        ],
        "moduleConfig": {
          "text2vec-openai": {
            "skip": false,
            "vectorizePropertyName": true
          }
        },
        "name": "spouse"
      }
    ]
  }

  client.schema.classCreator().withClass(schemaObj).do().then((res: any) => {
    console.log(res);
    })
    .catch((err: Error) => {
    console.error(err)
    });

  data.forEach((character: Character) => {

    // Create an object
    const obj = {
      class: 'Character',
      properties: {
        birth: character.birth,
        death: character.death,
        gender: character.gender,
        hair: character.hair,
        height: character.height,
        name: character.name,
        race: character.race,
        realm: character.realm,
        spouse: character.spouse,
      },
    }

    // add the object to the batch queue
    batcher = batcher.withObject(obj);

    // When the batch counter reaches batchSize, push the objects to Weaviate
    if (counter++ == batchSize) {
      // flush the batch queue
      batcher
      .do()
      .then((res: any) => {
        //console.log(res)
      })
      .catch((err: Error) => {
        console.error(err)
      });

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

//importQuestions();

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
const tsv = TSV.stringify(JSON.parse(fs.readFileSync('embeddings.json', 'utf8')))
fs.writeFileSync('embeddings.tsv', tsv)

async function createTsv() {
  const characters = await csv().fromFile('./lotr_characters.csv');

  const meta = TSV.stringify(characters)
  fs.writeFileSync('meta.tsv', meta)
}

createTsv()