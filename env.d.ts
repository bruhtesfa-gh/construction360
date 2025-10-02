declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      NODE_ENV: 'development' | 'production' | 'staging' | 'test';
      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;
      AWS_REGION?: string;
      AWS_ACCESS_KEY_ID?: string;
      AWS_SECRET_ACCESS_KEY?: string;
      EMAIL_FROM_NAME?: string;
      EMAIL_FROM_ADDRESS?: string;
    }
  }
}

export {};