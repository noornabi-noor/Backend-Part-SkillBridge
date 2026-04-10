import { auth } from "./src/app/lib/auth";
console.log(Object.keys(auth.api).filter(k => k.toLowerCase().includes('pass') || k.toLowerCase().includes('email')));
