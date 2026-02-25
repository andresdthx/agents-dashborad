import { formatDateTime, cn } from "@/lib/utils";
import { Bot } from "lucide-react";

interface MessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface Props {
  messages: MessageItem[];
}

export function ConversationThread({ messages }: Props) {
  if (messages.length === 0) {
    return (
      <div className="rounded-lg border border-edge bg-surface-raised p-8 text-center text-sm text-ink-3">
        Sin mensajes en la conversación
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-edge bg-surface-raised p-4 space-y-3 max-h-[520px] overflow-y-auto">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn("flex gap-2", msg.role === "assistant" ? "justify-start" : "justify-end")}
        >
          {msg.role === "assistant" && (
            <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-signal-surface border border-signal/20">
              <Bot className="h-3.5 w-3.5 text-signal" />
            </div>
          )}

          <div
            className={cn(
              "max-w-[72%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
              msg.role === "assistant"
                ? "rounded-tl-sm bg-surface border border-edge text-ink"
                : "rounded-tr-sm bg-signal-surface border border-signal/20 text-ink"
            )}
          >
            <p className="whitespace-pre-wrap">{msg.content}</p>
            <p className="mt-1 text-[10px] text-ink-4 tabular-nums">
              {formatDateTime(msg.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
