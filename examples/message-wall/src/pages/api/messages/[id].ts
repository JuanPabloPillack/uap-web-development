import type { APIRoute } from "astro";
import { likeMessage, deleteMessage } from "../../../services/messages";

export const POST: APIRoute = async ({ request, params, redirect }) => {
  const { id } = params;
  const formData = await request.formData();
  const action = formData.get("action");

  if (!id) {
    return new Response("Message ID is required", { status: 400 });
  }

  if (!action) {
    return new Response("Action is required", { status: 400 });
  }

  if (action === "like") {
    await likeMessage(id);
  } else if (action === "delete") {
    await deleteMessage(id);
  }

  return redirect("/");
};

export const DELETE: APIRoute = async ({ params }) => {
  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ error: "Message ID is required" }), {
      status: 400,
    });
  }

  await deleteMessage(id);

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};

export const PUT: APIRoute = async ({ request, params }) => {
  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ error: "Message ID is required" }), {
      status: 400,
    });
  }

  const message = await likeMessage(id);

  return new Response(JSON.stringify({ message }), { status: 200 });
};
