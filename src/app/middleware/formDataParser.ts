import { NextFunction, Request, Response } from "express";

export const formDataParser = (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
        for (const key in req.body) {
            const value = req.body[key];
            if (typeof value === "string") {
                try {
                    const parsed = JSON.parse(value);
                    if (typeof parsed === "object" && parsed !== null) {
                        // Merge the parsed object into req.body to handle cases like:
                        // data: { name: "Physics" } OR name: { name: "Physics" }
                        req.body = { ...req.body, ...parsed };
                    } else {
                        // Handle cases where a single field might be stringified (e.g. price: "10")
                        req.body[key] = parsed;
                    }
                } catch (error) {
                    // Not a JSON string, ignore and keep as original string
                }
            }
        }
    }

    // Secondary cleanup: If a field named 'data' was used specifically, ensure it's removed after merging
    if (req.body.data && typeof req.body.data === "string") {
        delete req.body.data;
    }

    console.log("Parsed and Merged Body:", req.body);
    next();
};
