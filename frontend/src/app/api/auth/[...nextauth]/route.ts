import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Send the Google access token to your FastAPI backend
      // to exchange it for your own JWT.
      if (account) {
        try {
          const res = await fetch("http://localhost:8000/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: account.id_token }),
          });
          const data = await res.json();
          if (res.ok) {
            token.backendAccessToken = data.access_token;
            token.user = data.user;
          }
        } catch (error) {
          console.error("Error exchanging token with backend:", error);
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      // Send properties to the client
      session.accessToken = token.backendAccessToken;
      session.user = { ...session.user, ...token.user };
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});

export { handler as GET, handler as POST };
