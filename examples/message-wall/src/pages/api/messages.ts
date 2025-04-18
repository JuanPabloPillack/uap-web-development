import type { APIRoute } from "astro";
import { addMessage, getMessages } from "../../services/messages";

export const GET: APIRoute = async ({ url }) => {
  const searchTerm = url.searchParams.get("search");

  const messages = await getMessages(searchTerm ?? undefined);

  return new Response(JSON.stringify({ messages }), { status: 200 });
};

export const POST: APIRoute = async ({ request, redirect }) => {
  const contentType = request.headers.get("content-type");

  const content =
    contentType === "application/json"
      ? await request.json().then((data) => data.content as string)
      : await request
          .formData()
          .then((data) => data.get("content")?.toString());

  if (!content) {
    return new Response("Content is required", { status: 400 });
  }

  const message = await addMessage(content.toString());

  if (contentType === "application/json") {
    return new Response(JSON.stringify({ success: true, message }), {
      status: 200,
    });
  }

  return redirect("/");
};
