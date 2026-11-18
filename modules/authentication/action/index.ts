"use server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const currentUser = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session?.user?.id,
    },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

export const seedDemoUserChats = async (userId: string) => {
  try {
    const existing = await prisma.chat.findFirst({
      where: { userId },
    });

    const LING_MODEL = "inclusionai/ling-3.2-flash:free";

    // If an older demo chat exists with a non-free or legacy model, update it to Ling 3.2
    if (existing) {
      if (existing.model !== LING_MODEL) {
        await prisma.chat.update({
          where: { id: existing.id },
          data: { model: LING_MODEL },
        });
        await prisma.message.updateMany({
          where: { chatId: existing.id },
          data: { model: LING_MODEL },
        });
      }
      return;
    }

    await prisma.chat.create({
      data: {
        userId,
        title: "👋 Welcome to NexusChat Demo",
        model: LING_MODEL,
        messages: {
          create: [
            {
              content: JSON.stringify([
                {
                  type: "text",
                  text: "Hello! What can NexusChat do?",
                },
              ]),
              messageRole: "USER",
              messageType: "NORMAL",
              model: LING_MODEL,
            },
            {
              content: JSON.stringify([
                {
                  type: "text",
                  text: "Welcome to **NexusChat**! 🚀\n\nHere are standout features you can test right now:\n\n- **Multi-Model Routing**: Switch dynamically between leading models using the selector below (currently running on **Ling 3.2 Flash**).\n- **Real-Time Token & Cost Counter**: Click the usage badge at the top right to inspect prompt/completion token metrics and cost calculations.\n- **Fuzzy Search**: Press `Cmd+K` (or `Ctrl+K`) to search across conversation titles instantly.\n- **Export Engine**: Export any conversation directly to clean Markdown (`.md`), JSON, or your clipboard.\n\nType a message below or start a new chat to test it out!",
                },
              ]),
              messageRole: "ASSISTANT",
              messageType: "NORMAL",
              model: LING_MODEL,
            },
          ],
        },
      },
    });
  } catch (error) {
    console.error("Error seeding demo chat:", error);
  }
};

export const requireAuth = async()=>{
   const session = await auth.api.getSession({
    headers: await headers(),
  });

  if(!session){
    return redirect("/sign-in")
  }

  if (session.user.email === "demo.guest@nexuschat.io") {
    await seedDemoUserChats(session.user.id);
  }

  return session
}


export const requireUnAuth = async()=>{
   const session = await auth.api.getSession({
    headers: await headers(),
  });

  if(session){
    return redirect("/")
  }

  return null;
}