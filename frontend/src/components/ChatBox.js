import React, { useState } from "react";

function ChatBox() {
  const [selectedFriend, setSelectedFriend] = useState("John");
  const [messages, setMessages] = useState({
    John: [{ sender: "John", text: "Hey there!" }],
    Priya: [{ sender: "Priya", text: "Hi, how are you?" }],
    Aarav: [{ sender: "Aarav", text: "Let's plan alumni meet soon!" }]
  });
  const [newMessage, setNewMessage] = useState("");

  const friends = Object.keys(messages);

  const handleSend = () => {
    if (newMessage.trim() !== "") {
      setMessages({
        ...messages,
        [selectedFriend]: [
          ...messages[selectedFriend],
          { sender: "Me", text: newMessage }
        ]
      });
      setNewMessage("");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "80vh",
        border: "1px solid #ddd",
        borderRadius: "10px",
        overflow: "hidden",
        maxWidth: "900px",
        margin: "20px auto",
        boxShadow: "0px 4px 10px rgba(0,0,0,0.1)"
      }}
    >
      {/* Friends List */}
      <div
        style={{
          width: "200px",
          borderRight: "1px solid #ddd",
          background: "#f7f7f7",
          padding: "10px"
        }}
      >
        <h3>Friends</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {friends.map((friend) => (
            <li
              key={friend}
              style={{
                padding: "10px",
                cursor: "pointer",
                background: selectedFriend === friend ? "#0073e6" : "transparent",
                color: selectedFriend === friend ? "white" : "black",
                borderRadius: "5px",
                marginBottom: "5px"
              }}
              onClick={() => setSelectedFriend(friend)}
            >
              {friend}
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Window */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            flex: 1,
            padding: "15px",
            overflowY: "auto",
            background: "#fafafa"
          }}
        >
          <h3 style={{ borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>
            Chat with {selectedFriend}
          </h3>
          {messages[selectedFriend].map((msg, index) => (
            <div
              key={index}
              style={{
                margin: "8px 0",
                textAlign: msg.sender === "Me" ? "right" : "left"
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  padding: "10px",
                  borderRadius: "15px",
                  background: msg.sender === "Me" ? "#0073e6" : "#e4e6eb",
                  color: msg.sender === "Me" ? "white" : "black",
                  maxWidth: "60%"
                }}
              >
                {msg.text}
              </span>
            </div>
          ))}
        </div>

        {/* Input Box */}
        <div
          style={{
            display: "flex",
            padding: "10px",
            borderTop: "1px solid #ddd",
            background: "#fff"
          }}
        >
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "20px",
              border: "1px solid #ddd",
              outline: "none"
            }}
          />
          <button
            onClick={handleSend}
            style={{
              marginLeft: "10px",
              padding: "10px 20px",
              borderRadius: "20px",
              border: "none",
              background: "#28a745",
              color: "white",
              cursor: "pointer"
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatBox;
