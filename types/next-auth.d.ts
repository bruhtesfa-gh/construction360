import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      builderId: string;
      builderName: string;
      role: string;
      defaultRegionId?: string | null;
    };
  }

  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    builderId: string;
    builderName: string;
    role: string;
    defaultRegionId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    builderId?: string;
    builderName?: string;
    role?: string;
    defaultRegionId?: string | null;
  }
}