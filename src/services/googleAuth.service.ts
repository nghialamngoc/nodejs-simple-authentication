// services/googleAuth.service.ts
import { OAuth2Client, TokenPayload } from "google-auth-library";
import axios from "axios";

export interface GoogleUser {
  email: string;
  name: string;
  picture?: string;
  sub: string; // Google's unique identifier
  email_verified: boolean;
}

export class GoogleAuthService {
  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    });
  }

  async verifyGoogleToken(token: string): Promise<GoogleUser> {
    try {
      const { data } = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Validate data
      if (!data.email || !data.sub) {
        throw new Error("Invalid Google user data");
      }

      // Return necessary user information
      return {
        email: data.email!,
        name: data.name!,
        picture: data.picture,
        sub: data.sub,
        email_verified: data.email_verified,
      };
    } catch (error) {
      console.error("Google token verification failed:", error);
      throw new Error("Failed to verify Google token");
    }
  }
}
