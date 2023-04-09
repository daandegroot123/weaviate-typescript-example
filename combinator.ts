import weaviate, { WeaviateClient, ObjectsBatcher } from 'weaviate-ts-client';
import csv from "csvtojson";
import fs from 'fs';

const client: WeaviateClient = weaviate.client({
  scheme: 'http',
  host: 'localhost:8080',
  headers: {'X-OpenAI-Api-Key': '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'}
});

async function getJsonData(): Promise<any> {
  const companies = await csv().fromFile('./companies.csv');
  return companies;
}

async function importCompanies() {
  // Get the data from the data.json file
  const data = await getJsonData();

  // Prepare a batcher
  let batcher: ObjectsBatcher = client.batch.objectsBatcher();
  let counter: number = 0;
  let batchSize: number = 100;

  client.schema.classDeleter().withClassName('Company').do().then((res: any) => {
    console.log(res);
    })
    .catch((err: Error) => {
    console.error(err)
    });;

  // Create schema
  const schemaObj = {
    'class': 'Company',
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
        "name": "name"
      },
      {
        "dataType": [
          "text"
        ],
        "moduleConfig": {
          "text2vec-openai": {
            "skip": true,
            "vectorizePropertyName": true
          }
        },
        "name": "vertical"
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
        "name": "batch"
      },
      {
        "dataType": [
          "text"
        ],
        "moduleConfig": {
          "text2vec-openai": {
            "skip": true,
            "vectorizePropertyName": true
          }
        },
        "name": "url"
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
        "name": "description"
      }
    ]
  }

  client.schema.classCreator().withClass(schemaObj).do().then((res: any) => {
    console.log(res);
    })
    .catch((err: Error) => {
    console.error(err)
    });

  data.forEach((company: Company) => {

    // Create an object
    const obj = {
      class: 'Company',
      properties: {
        Name: company.name,
        Industry: company.vertical,
        FoundingYear: company.year,
        BatchYear: company.batch,
        WebsiteUrl: company.url,
        Description: company.description,
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
  .withClassName('Company')
  .withFields('name industry foundingYear batchYear websiteUrl description _additional {certainty}')
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

import { TSV } from 'tsv';
const tsv = TSV.stringify(JSON.parse(fs.readFileSync('embeddings.json', 'utf8')))
fs.writeFileSync('embeddings.tsv', tsv)

async function createTsv() {
  const characters = await csv().fromFile('./companies.csv');

  const meta = TSV.stringify(JSON.parse(fs.readFileSync('companymeta.json', 'utf8')))
  fs.writeFileSync('companymeta.tsv', meta)
}

async function getAllVectors() {
  client.graphql
  .get()
  .withClassName('Company')
  .withFields('name industry foundingYear batchYear websiteUrl description _additional {vector}')
  .withLimit(1000)
  .do()
  .then((res: any) => {
    const companyVectors = res.data.Get.Company.map((company: any, i: number) => {
      return company._additional.vector
    })
    fs.writeFileSync('companyvectors.json', JSON.stringify(companyVectors, null, 2));
    console.log(companyVectors.length)

    const companyMeta = res.data.Get.Company.map((company: any, i: number) => {
      return {
        name: company.name,
        industry: company.industry,
        foundingYear: company.foundingYear,
        batchYear: company.batchYear,
        websiteUrl: company.websiteUrl,
        description: company.description,
      }
    })
    //fs.writeFileSync('companymeta.json', JSON.stringify(companyMeta, null, 2));
    console.log(companyMeta.length)
  })
  .catch((err: Error) => {
    console.error(err)
  });
}

//importCompanies();
//similarText('Bilbo Baggins')
//start('A mobile wallet that allows you to pay everywhere credit cards are accepted.  Yes, we solder stuff.')
//createTsv()
//getAllVectors()