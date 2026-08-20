export async function POST(request: Request) {
  const { name, email, message } = await request.json();

  if (!name || !email || !message) {
    return Response.json(
      { error: "Name, email, and message are all required." },
      { status: 400 },
    );
  }

  console.log("Contact form submission:", { name, email, message });

  return Response.json({ ok: true });
}
