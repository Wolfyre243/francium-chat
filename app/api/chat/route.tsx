import {
    StreamingTextResponse,
    createStreamDataTransformer,
    Message as VercelChatMessage
} from 'ai';
import { Ollama } from '@langchain/ollama';
import { PromptTemplate } from '@langchain/core/prompts';
import { HttpResponseOutputParser } from 'langchain/output_parsers';

export const dynamic = 'force-dynamic'

const formatMessage = (message: VercelChatMessage) => {
    return `${message.role}: ${message.content}`
}

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

        /**
       * Chat models stream message chunks rather than bytes, so this
       * output parser handles serialization and encoding.*/

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