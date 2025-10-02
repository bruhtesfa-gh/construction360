import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { userRepository, builderRepository, setBuilderContext } from "./repositories";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user by email (using login_id field)
          const user = await userRepository.findByLogin(credentials.email);
          
          if (!user) {
            return null;
          }

          // Verify password
          if (!user.password_hash) {
            console.error('No password hash found for user');
            return null;
          }

          const hashedPassword = user.password_hash.toString('utf8');
          const isValidPassword = await bcrypt.compare(credentials.password, hashedPassword);
          
          if (!isValidPassword) {
            return null;
          }

          // Get builder information
          const builder = await builderRepository.findById(user.builder_id);
          
          if (!builder) {
            return null;
          }

          // Set builder context for RLS
          await setBuilderContext(user.builder_id);

          return {
            id: user.user_id,
            email: user.user_login_id,
            name: `${user.first_name} ${user.last_name}`,
            builderId: user.builder_id,
            builderName: builder.builder_name || 'Unknown Builder',
            role: 'user', // Default role - could be enhanced to map role_id to role name
            defaultRegionId: user.default_region_id,
          };
        } catch (error) {
          console.error('Auth error (FORCE REDEPLOY):', new Date().toISOString(), error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.builderId = user.builderId;
        token.builderName = user.builderName;
        token.role = user.role;
        token.defaultRegionId = user.defaultRegionId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.builderId = token.builderId as string;
        session.user.builderName = token.builderName as string;
        session.user.role = token.role as string;
        session.user.defaultRegionId = token.defaultRegionId as string;
        
        // Set builder context for this session
        if (token.builderId) {
          await setBuilderContext(token.builderId as string);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
};