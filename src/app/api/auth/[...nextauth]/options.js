import { NextAuthOptions } from "next-auth";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import RedditProvider from "next-auth/providers/reddit";

export const authOptions = {
    adapter: MongoDBAdapter(clientPromise, { databaseName: "userdata" }),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true, 
        }),
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
    ],
    session: {
        strategy: "jwt",
    },
    jwt: {
        secret: process.env.JWT_SECRET,
    },
    callbacks: {
        async session({ session, token }) {
            session.user.id = token.sub;
            return session;
        },
        async signIn({ user, account }) {
            try {
                const client = await clientPromise;
                const db = client.db("userdata");
                const collection = db.collection("connections"); 
                
                const discordId = account?.provider === "discord" ? account.providerAccountId : null;
                
                const existingUser = await collection.findOne({ email: user.email });
                
                if (!existingUser) {
                    await collection.insertOne({ 
                        email: user.email,
                        discordId: discordId
                    });
                } else {
                    const updates = {};
                    
                    if (account?.provider === "discord" && existingUser.discordId !== discordId) {
                        updates.discordId = discordId;
                    }
                    
                    if (Object.keys(updates).length > 0) {
                        await collection.updateOne(
                            { email: user.email },
                            { $set: updates }
                        );
                    }
                }
                return true;
            } catch (error) {
                console.error("Error saving user to database:", error);
                return false;
            }
        },
    },
};

