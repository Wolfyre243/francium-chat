import pg from "pg";
//import { db_password } from '@/secrets/db-config.json'

// const pg_config = {
//     postgresConnectionOptions: {
//         type: "postgres",
//         host: "127.0.0.1",
//         port: 5432,
//         user: "francium-admin",
//         password: db_password,
//         database: "database-atlantis",
//     } as PoolConfig,

//     tableName: "simpleDocuments",

//     columns: {
//         idColumnName: "id",
//         vectorColumnName: "vector",
//         contentColumnName: "content",
//         metadataColumnName: "metadata",
//     },

//     distanceStrategy: 'cosine' as DistanceStrategy,

// }

const pg_basepool = new pg.Pool({
    host: "172.23.0.1", // use 127.0.0.1 if in dev environment
    port: 5432,
    user: "francium-admin",
    password: "wispwolf243",
    database: "database-atlantis",
})

// const vectorStore = await PGVectorStore.initialize(embeddings, pg_config)

export default pg_basepool;
