import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db"; // your prisma client instance

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", 
    }),
    baseURL: process.env.BETTER_AUTH_URL,
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },
    socialProviders:{
        github:{
            clientId:process.env.GITHUB_CLIENT_ID || "",
            clientSecret:process.env.GITHUB_CLIENT_SECRET || "",
        }
    }
});