import type { Message } from "./types";

const searchForm = document.getElementById("search-form");
const addMessageForm = document.getElementById("add-message-form");
const messagesList = document.getElementById("messages-list");
const clearButton = document.getElementById("clear-button");
const messageItemTemplate = document.getElementById(
  "message-item"
) as HTMLTemplateElement;
const messageItemExample = messageItemTemplate.content.querySelector("li");

if (
  !messagesList ||
  !searchForm ||
  !addMessageForm ||
  !messageItemExample ||
  !clearButton
) {
  throw new Error("Messages list, search form or add message form not found");
}

const renderMessage = (message: Message) => {
  const messageItem = messageItemExample.cloneNode(true) as HTMLLIElement;
  messageItem.querySelector("[data-content='content']")!.textContent =
    message.content;
  messageItem.querySelector("[data-content='createdAt']")!.textContent =
    message.createdAt.toLocaleString();
  messageItem.querySelector("[data-content='likes']")!.textContent = `${
    message?.likes
  } Like${message?.likes === 1 ? "" : "s"}`;

  messageItem
    .querySelector("form")
    ?.setAttribute("action", `/api/messages/${message?.id}`);

  handleItemForm(messageItem.querySelector("form") as HTMLFormElement);

  messagesList.appendChild(messageItem);
};

const renderMessages = (messages: Message[]) => {
  messagesList.innerHTML = "";

  messages.forEach(renderMessage);
};

const handleItemForm = (form: HTMLFormElement) => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitter = e.submitter as HTMLButtonElement;

    const action = submitter.getAttribute("value");

    const messageId = form.getAttribute("data-message-id");

    if (!messageId) {
      return;
    }

    console.log(action, messageId);

    if (action === "like") {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: { message: Message } = await response.json();

        submitter.querySelector("[data-content='likes']")!.textContent = `${
          data.message?.likes
        } Like${data.message?.likes === 1 ? "" : "s"}`;
      }
    }

    if (action === "delete") {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        form.closest("li")?.remove();
      }
    }
  });
};

clearButton.addEventListener("click", async (e) => {
  e.preventDefault();

  const input = searchForm.querySelector(
    "input[name='search']"
  ) as HTMLInputElement;
  input.value = "";

  clearButton.classList.add("hidden");

  const res = await fetch("/api/messages");
  const data: { messages: Message[] } = await res.json();

  renderMessages(data.messages);
});

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const input = searchForm.querySelector(
    "input[name='search']"
  ) as HTMLInputElement;
  const searchTerm = input.value;

  if (!searchTerm) {
    return;
  }

  clearButton.classList.remove("hidden");

  const res = await fetch(`/api/messages?search=${searchTerm}`);
  const data: { messages: Message[] } = await res.json();

  renderMessages(data.messages);
});

addMessageForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const input = addMessageForm.querySelector(
    "input[name='content']"
  ) as HTMLInputElement;

  const content = input.value;

  if (!content) {
    return;
  }

  input.value = "";

  const res = await fetch("/api/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });

  const data: { success: boolean; message: Message } = await res.json();

  renderMessage(data.message);
});

messagesList.querySelectorAll("form").forEach(handleItemForm);
