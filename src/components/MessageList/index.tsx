import { useEffect, useState } from "react";
import io from "socket.io-client";

import styles from "./styles.module.scss";

import logoImage from "../../assets/logo.svg";
import { api } from "../../services/api";

interface Message {
  id: string;
  text: string;
  user: {
    avatar_url: string;
    name: string;
  };
}

const messageQueue: Message[] = [];

const socket = io("http://localhost:3001");

socket.on("new_message", (newMessage: Message) => {
  messageQueue.push(newMessage);
});

export function MessageList() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    setInterval(() => {
      if (messageQueue.length > 0) {
        setMessages((previousState) =>
          [messageQueue[0], previousState[0], previousState[1]].filter(Boolean)
        );

        messageQueue.shift();
      }
    }, 3000);
  }, []);

  useEffect(() => {
    api.get<Message[]>("messages/last-three").then((response) => {
      setMessages(response.data);
    });
  }, []);

  return (
    <div className={styles.messageListWrapper}>
      <img src={logoImage} alt="DoWhile 2021" />

      <ul className={styles.messageList}>
        {messages.map((message) => (
          <li className={styles.messageContainer} key={message.id}>
            <p className={styles.message}>{message.text}</p>
            <div className={styles.author}>
              <div className={styles.avatar}>
                <img src={message.user.avatar_url} alt={message.user.name} />
              </div>
              <span>{message.user.name}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
