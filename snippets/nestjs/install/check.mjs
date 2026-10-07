// Runs once the SDK is installed: the install check for the Get started page.
import { docuconfValidate, Describe } from "@docuconf/nestjs";
console.log(typeof docuconfValidate === "function" && typeof Describe === "function" ? "ok" : "missing exports");
