import { ChromaClient, OpenAIEmbeddingFunction } from "chromadb";
import csv from "csvtojson";
import fs from "fs";

class MyEmbeddingFunction {

  constructor() {
  }

  public async generate(input: string[]): Promise<number[][]> {
    const embeddings = JSON.parse(fs.readFileSync('embeddings.json', 'utf8'));
    // limit to 50
    embeddings.length = 50;

    return embeddings;
  }
}

async function main() {
  const client = new ChromaClient();
  const generator = new MyEmbeddingFunction();

  let collection;
  //let collection = await client.getCollection("lotr-characters-3");

  const characters = await csv().fromFile('./lotr_characters.csv');

  if ( true ) {
    collection = await client.createCollection("lotr-characters-31", {}, generator);

    // Turn the CSV into arrays of ids, metadata and documents needed for embedding
    const ids = characters.map((c, i) => i.toString());
    const metadata = characters.map((c) => { return { "source": "lotr-characters.csv" }});
    const documents = characters.map((c) => {
      return Object.entries(c).map(([key, value]) => {
        if ( value ) {
          return key + ': ' + value;
        }
      }).filter((v) => v).join(', ');
    });

    // Limit all arrays to 50 to cirumvent a post limit in the API
    ids.length = 50;
    metadata.length = 50;
    documents.length = 50;

    const embeddings = JSON.parse(fs.readFileSync('embeddings.json', 'utf8'));

    if (!embeddings) {
      const embedder = new OpenAIEmbeddingFunction('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');
      const embeddings = await embedder.generate(documents);
      fs.writeFileSync('embeddings.json', JSON.stringify(embeddings)); 
    }

    const fakeEmbeddings: string[] = []
    for ( let i = 0; i < ids.length; i++ ) {
      fakeEmbeddings.push('hoi');
    }
    
    await collection.add(ids, undefined, metadata, documents);
    console.log(await collection.peek())
  }

  // const queryEmbedding = await embedder.generate(["Bilbo Baggings"]);
  // const queryEmbedding = [0.1, 0.2, 0.3]
  // const result = await collection.query(
  //   queryEmbedding,
  //   5,
  //   undefined,
  //   undefined
  // )

  // console.log(result)
}

main();