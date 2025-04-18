import type { Message } from "../types";

type State = {
  messages: Message[];
};

const state: State = {
  messages: [],
};

export const getMessages = async (searchTerm?: string) => {
  if (!searchTerm) {
    return state.messages;
  }

  const normalizedSearchTerm = searchTerm.toLowerCase();
  return state.messages.filter((message) =>
    message.content.toLowerCase().includes(normalizedSearchTerm)
  );
};

export const addMessage = async (content: string) => {
  const message: Message = {
    id: crypto.randomUUID(),
    content,
    likes: 0,
    createdAt: new Date(),
  };

  state.messages.push(message);
  return message;
};

export const likeMessage = async (id: string) => {
  const message = state.messages.find((message) => message.id === id);
  if (!message) {
    throw new Error("Message not found");
  }
  message.likes++;
  return message;
};

export const deleteMessage = async (id: string) => {
  state.messages = state.messages.filter((message) => message.id !== id);
};
