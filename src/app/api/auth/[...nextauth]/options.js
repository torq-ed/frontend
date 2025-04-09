import { NextAuthOptions } from "next-auth";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import RedditProvider from "next-auth/providers/reddit";

export const authOptions = {
    adapter: MongoDBAdapter(clientPromise),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
        }),
        // RedditProvider({
        //     clientId: process.env.REDDIT_CLIENT_ID,
        //     clientSecret: process.env.REDDIT_CLIENT_SECRET,
        // }),
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
                const collection = db.collection("users");

                // Check if user is signing in with Discord to get the Discord ID
                const discordId = account?.provider === "discord" ? account.providerAccountId : null;
                
                // Check if the user already exists
                const existingUser = await collection.findOne({ email: user.email });
                
                if (!existingUser) {
                    // Add the user to the database with Discord ID and Reddit username
                    await collection.insertOne({ 
                        email: user.email,
                        discordId: discordId
                    });
                } else {
                    // Update fields if needed
                    const updates = {};
                    
                    if (account?.provider === "discord" && existingUser.discordId !== discordId) {
                        updates.discordId = discordId;
                    }
                    
                    
                    // Only update if there are changes
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

