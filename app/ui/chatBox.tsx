export function ChatBox(
    { children, className, role }: 
    { children: React.ReactNode,
    className?: string,
    role: string},
) {
    return(
        <div className="max-w-5xl flex flex-col w-fit bg-transparent">
            <h1 className="text-neutral-600">
                {role === 'user' ? "You" : "Assistant"}
            </h1>
            <div className={"rounded-lg py-2 px-4 " + className}>
                {children}
            </div>
        </div>
    )
}