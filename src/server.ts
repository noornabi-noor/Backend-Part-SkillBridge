import app from "./app";
import { prisma } from "./app/lib/prisma";
import { envVars } from "./app/config/env.config";
const port = parseInt(envVars.PORT, 10);

async function main(){
    try {
        await prisma.$connect();
        console.log("Connected to the database successfully!");

        app.listen(port, ()=>{
            // console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error("An error occured", error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();