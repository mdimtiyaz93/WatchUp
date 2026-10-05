import React from "react";
import { SendIcon, XIcon } from "lucide-react";

const ChatPanel = ({
  chat,
  setChat,
  setUnreadMessages,
  messages,
  message,
  setMessage,
  sendMessage,
}) => {
  if (!chat) return null;

  return (
    <div className="absolute inset-0 sm:top-0 sm:right-0 sm:left-auto sm:bottom-auto sm:h-full w-full sm:w-96 bg-white z-50 shadow-2xl border-l flex flex-col">
      <div className="flex justify-between items-center px-3 sm:px-4 py-3 border-b">
        <h2 className="font-semibold text-sm">Chat</h2>

        <button
          type="button"
          onClick={() => {
            setChat(false);
            setUnreadMessages(0);
          }}
          className="w-7 h-7 rounded-md hover:bg-slate-100 flex items-center justify-center cursor-pointer"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-2">
        {messages.length ? (
          messages.map((m, index) => (
            <div key={m.id || index} className="bg-slate-50 rounded-lg p-2">
              <p className="text-[10px] font-semibold">{m.username}</p>

              <p className="text-xs text-slate-600 mt-1 break-words">
                {m.message}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-xs text-slate-400 mt-10">
            No messages yet
          </p>
        )}
      </div>

      <form onSubmit={sendMessage} className="p-2.5 sm:p-3 border-t flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 min-w-0 border rounded-lg px-2.5 py-1.5 text-xs outline-none"
        />

        <button
          type="submit"
          disabled={!message.trim()}
          className="w-8 h-8 shrink-0 rounded-lg bg-primary text-white flex items-center justify-center disabled:opacity-40 cursor-pointer"
        >
          <SendIcon className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;
