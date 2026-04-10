import { userRoles } from "../middleware/auth";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string;
                role: userRoles;
                emailVerified: boolean;
                tutorProfileId?: string | null;
                image?: string;
            };
        }
    }
}
