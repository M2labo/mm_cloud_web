import React, { useState } from 'react';
import { Header } from '../../components/Header/Header';

interface Message {
  sender: string;
  text: string;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (message: string) => {
    const newMessages = [...messages, { sender: 'You', text: message }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('https://74faxwvpqzn2svgvohxjxdsek40jdbrq.lambda-url.ap-northeast-1.on.aws/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({ text: message }),
      });

      if (response.ok) {
        const responseData = await response.text();
        setMessages([...newMessages, { sender: 'MM', text: responseData }]);
      } else {
        setMessages([...newMessages, { sender: 'System', text: 'Failed to get response from AI.' }]);
      }
    } catch (error) {
      setMessages([...newMessages, { sender: 'System', text: 'Failed to get response from AI.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs p-3 rounded-lg ${message.sender === 'You' ? 'bg-blue-200' : 'bg-gray-300'}`}
              >
                <p className="text-black">{message.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {isLoading && <div className="h-1 bg-blue-500"><div className="w-full h-full animate-pulse"></div></div>}
      <div className="p-4 flex items-center space-x-4 border-t border-gray-200">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter your message"
          className="flex-1 p-2 border border-gray-300 rounded-lg"
        />
        <button
          onClick={handleSend}
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
