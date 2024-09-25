// ------------------------------------- MARK: Import dependencies----------------------------------------------------------------
import {
    StreamingTextResponse,
    createStreamDataTransformer,
    Message as VercelChatMessage
} from 'ai';

// Import langchain tools
import { Ollama, OllamaEmbeddings } from '@langchain/ollama';
import { PromptTemplate } from '@langchain/core/prompts';
import { HttpResponseOutputParser } from 'langchain/output_parsers';

// Import type definitions
import type { Document } from "@langchain/core/documents";

// Import database stuff
import pg_basepool from '@/app/lib/database';
import { PGVectorStore, DistanceStrategy } from "@langchain/community/vectorstores/pgvector";

// Import whatever this is
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic'

// Helper formatting function
const formatMessage = (message: VercelChatMessage) => {
    return `${message.role}: ${message.content}`
}

// Define a configuration based on the reusable pool provided as pg_basepool
// TODO: Find some way to make this configuration a pre-config located in database.ts too
const postgresConfig = {
    pool: pg_basepool,
    tableName: "simpleDocuments",
    collectionName: "documents_collection",
    collectionTableName: "collections",
    columns: {
        idColumnName: "id",
        vectorColumnName: "vector",
        contentColumnName: "content",
        metadataColumnName: "metadata",
    },
    distanceStrategy: 'cosine' as DistanceStrategy,
};

const embeddings = new OllamaEmbeddings({
    baseUrl: "http://host.docker.internal:11434"
})

//console.log(embeddings.baseUrl)

// Setting up the postgres vectordb
const pgvectorStore = await PGVectorStore.initialize(embeddings, postgresConfig);

// // exec once - creating documents
// const document1: Document = {
//     pageContent: "The powerhouse of the cell is the mitochondria",
//     metadata: { source: "https://example.com" },
// };

// const document2: Document = {
//     pageContent: "Buildings are made out of brick",
//     metadata: { source: "https://example.com" },
// };

// const document3: Document = {
//     pageContent: "Mitochondria are made out of lipids",
//     metadata: { source: "https://example.com" },
// };

// await pgvectorStore.addDocuments(
//     [document1, document2, document3],
//     { ids: [uuidv4(), uuidv4(), uuidv4()] }
// );

export async function POST(req: Request) {
    try {
        // Extract the `messages` from the body of the request
        const { messages } = await req.json();

        const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
        const currentMessageContent = messages.at(-1).content;

        // Create a simple prompt template
        const basePrompt = PromptTemplate.fromTemplate("Chat History: {chat_history}\nuser: {message}");

        const ollama = new Ollama({
            baseUrl: 'http://host.docker.internal:11434', // This should probably be an env variable
            model: 'aegis:v0.1',
            keepAlive: '30m'
        });

        // Assume model is trying to query the database
        const filter = { source: 'https://example.com' };

        const similaritySearchResults = await pgvectorStore.similaritySearch(
            "cat", // this is the mandatory query string
            2, // this is the number of results to return; it is optional.
            filter, // this is the optional filter to use.
            // you may wish to use callbacks here as well, to handle success.
        );

        for (const doc of similaritySearchResults) {
            console.log(`* ${doc.pageContent}`);
        }

        const chain = basePrompt.pipe(ollama).pipe(new HttpResponseOutputParser());

        // Convert the response into a friendly text-stream
        const stream = await chain.stream({
            chat_history: formattedPreviousMessages.join('\n'),
            message: currentMessageContent
        });

        return new StreamingTextResponse(
            stream.pipeThrough(createStreamDataTransformer()),
        );

    } catch (e: any) {
        return Response.json({ error: e.message }, { status: e.status ?? 500 });
    }
}