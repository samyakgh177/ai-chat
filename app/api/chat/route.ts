import { convertToModelMessages, streamText , createIdGenerator , type UIMessage } from "ai";
import { CHAT_SYSTEM_PROMPT } from "@/lib/prompt";
import { prisma } from "@/lib/db";
import { MessageRole } from "@/lib/generated/prisma/enums";
import { currentUser } from "@/modules/authentication/actions";

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { NextRequest } from "next/server";

const apiKey = process.env.OPENROUTER_API_KEY || "";
const openRouter = createOpenRouter({
  apiKey,
});

/**
 * Convert DB message to UI format for AI SDK
 */
function dbMessageToUI(msg: any) {
  try {
    const parts = JSON.parse(msg.content);
    const textParts = parts.filter((p: any) => p.type === "text");

    if (textParts.length === 0) return null;

    return {
      id: msg.id,
      role: msg.messageRole.toLowerCase(),
      parts: textParts,
      createdAt: msg.createdAt,
    };
  } catch {
    return {
      id: msg.id,
      role: msg.messageRole.toLowerCase(),
      parts: [{ type: "text", text: msg.content }],
      createdAt: msg.createdAt,
    };
  }
}

const generateMessageId = createIdGenerator({prefix:"msg" , size:16})

/**
 * Convert message parts to JSON string for DB storage
 */
function partsToJSON(message: { parts?: unknown; content?: string }) {
  if (Array.isArray(message.parts)) {
    return JSON.stringify(message.parts);
  }
  return JSON.stringify([{ type: "text", text: message.content ?? "" }]);
}

export async function POST(req: NextRequest) {
  try {
    if (!apiKey) {
      return Response.json(
        { error: "OpenRouter API key is not configured. Please set OPENROUTER_API_KEY in your environment." },
        { status: 500 }
      );
    }

    // Safety Guardrail 1: Authenticate the user
    const user = await currentUser();
    if (!user) {
      return Response.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const {
      chatId,
      messages,
      model,
      skipUserMessage,
    } = await req.json();

    // Safety Guardrail 2: Input validation
    if (!chatId || typeof chatId !== "string") {
      return Response.json({ error: "Missing or invalid chatId" }, { status: 400 });
    }

    if (!model || typeof model !== "string") {
      return Response.json({ error: "Missing or invalid model identifier" }, { status: 400 });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "Messages payload cannot be empty" }, { status: 400 });
    }

    if (messages.length > 80) {
      return Response.json(
        { error: "Conversation history exceeds safety limit (max 80 messages)." },
        { status: 400 }
      );
    }

    // Safety Guardrail 3: Chat ownership check
    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId: user.id },
    });

    if (!chat) {
      return Response.json(
        { error: "Chat not found or access denied." },
        { status: 404 }
      );
    }

    // Safety Guardrail 4: Prompt length cap (prevent budget drain)
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      let promptLength = 0;
      if (Array.isArray(lastUserMsg.parts)) {
        for (const p of lastUserMsg.parts) {
          if (p?.type === "text" && typeof p.text === "string") {
            promptLength += p.text.length;
          }
        }
      } else if (typeof lastUserMsg.content === "string") {
        promptLength = lastUserMsg.content.length;
      }

      const MAX_PROMPT_CHARS = 12000;
      if (promptLength > MAX_PROMPT_CHARS) {
        return Response.json(
          {
            error: `Message exceeds the maximum safety limit of ${MAX_PROMPT_CHARS.toLocaleString()} characters.`,
          },
          { status: 400 }
        );
      }
    }

    const result = streamText({
      model: openRouter.chat(model),
      system: CHAT_SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
    });

    result.consumeStream();

    return result.toUIMessageStreamResponse({
      sendReasoning: true,
      originalMessages: messages,
      generateMessageId,
      onFinish: async ({ responseMessage }) => {
        try {
          const messageToSave:Array<{
                 id?: string;
            chatId: string;
            content: string;
            messageRole: MessageRole;
            messageType: "NORMAL";
            model: string;
          }> = [];

          if (!skipUserMessage) {
              const lastUserMsg = [...messages]
              .reverse()
              .find((m) => m.role === "user");
            if (lastUserMsg) {
              messageToSave.push({
                id:lastUserMsg.id,
                chatId,
                content: partsToJSON(lastUserMsg),
                messageRole: MessageRole.USER,
                messageType: "NORMAL",
                model,
              });
            }
          }

          if (responseMessage?.parts?.length > 0) {
            messageToSave.push({
              id:responseMessage.id,
              chatId,
              content: partsToJSON(responseMessage),
              messageRole: MessageRole.ASSISTANT,
              messageType: "NORMAL",
              model,
            });
          }

          if(messageToSave.length > 0){
            await prisma.message.createMany({data:messageToSave , skipDuplicates:true})
          }
        } catch (error) {
            console.error("Error saving messages" , error)
        }
      },
    });
  } catch (error) {
     console.error("Chat API error:", error);
    return Response.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

