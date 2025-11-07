import React from 'react'

type Message = {
  fromMe: boolean
  sender?: string
  text: string
}

interface ChatBoxProps {
  showChat: boolean
  setShowChat: React.Dispatch<React.SetStateAction<boolean>>
  chatMessages: Message[]
  newMessage: string
  setNewMessage: React.Dispatch<React.SetStateAction<string>>
  sendMessage: () => void
}

const ChatBox: React.FC<ChatBoxProps> = ({
  showChat,
  setShowChat,
  chatMessages,
  newMessage,
  setNewMessage,
  sendMessage,
}) => {
  return (
    <div>


      {/* 🪟 Chat Panel */}
      {showChat && (
        <div className="absolute left-0 top-1 w-80 h-[80vh] bg-white/95 rounded-2xl shadow-xl flex flex-col">
          <div className="px-3 py-2 font-semibold border-b bg-gray-100">
            Chat Room
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-3 py-2 rounded-lg max-w-[75%] text-sm shadow-sm ${msg.fromMe
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-800"
                    }`}
                >
                  {!msg.fromMe && (
                    <p className="font-semibold text-xs mb-1">{msg.sender}</p>
                  )}
                  <p> {msg.text}</p>

                </div>
              </div>
            ))}
          </div>

          <div className="flex p-2 border-t">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 outline-none rounded-lg px-3 py-2 border border-gray-300"
            />
            <button
              onClick={sendMessage}
              className="ml-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Send
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default ChatBox