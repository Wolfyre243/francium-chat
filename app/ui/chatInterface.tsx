'use client';

// Import Components
import { Input } from "@/app/ui/input";
import { useChat } from "ai/react"
import { useRef } from 'react';
import { ChatBox } from '@/app/ui/chatBox';

export default function Chat(){

    const { messages, input, handleInputChange, handleSubmit } = useChat({
        api: 'api/chat', //TODO: add the api route here
        onError: (e) => {
            console.log(e);
        }
    })

    const chatParent = useRef<HTMLUListElement>(null);

    // Get the version because we can
    const version = require('@/package.json').version;

    return (
        <main className="p-5 h-screen flex flex-col">
            {/* Website Header */}
            <header className="p-3 h-fit">
                <h1 className="text-3xl text-center mb-2">Project Francium</h1>
                <h2 className="text-md text-center">Chat Interface MK v{version}</h2>
            </header>

            {/* List of chats */}
            <section className="h-full my-3 flex flex-col overflow-scroll scrollbar-hide overflow-x-hidden">
                <ul ref={chatParent} className="w-3/4 m-auto mt-1">
                    {messages.map((message, index) => (
                        <div key={index}>
                            {message.role === 'user' ? ( // If user message:
                                // TODO: Turn this into a component instead
                                <li key={message.id} className="flex flex-row justify-end">
                                    <ChatBox className="bg-blue-400" role={message.role}>
                                        <p>{message.content}</p>
                                    </ChatBox>
                                </li>
                            ) : ( // If assistant message:
                                <li className="flex flex-row">
                                    <ChatBox className="bg-zinc-800" role={message.role}>
                                        <p>{message.content}</p>
                                    </ChatBox>
                                </li>
                            )
                            }
                        </div>
                    ))}
                </ul>
            </section>

            
            {/* Input next query */}
            <section className="h-fit flex">
                <form onSubmit={handleSubmit} className="flex flex-row w-full gap-x-4 px-10 py-2">
                    <Input className="w-full rounded-lg bg-neutral-800 p-2" placeholder="Your input..." type="text" value={input} onChange={handleInputChange} />
                    <button className="text-lg px-10 py-3 rounded-lg bg-blue-500" type="submit">
                        Submit
                    </button>
                </form>
            </section>

        </main>
    );
}