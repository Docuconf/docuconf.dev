// Runs once the SDK is installed: the install check for the Get started page.
import { z } from "zod";
import { createEnv, toContract } from "@docuconf/t3";

const env = createEnv({
  name: "app",
  server: { PORT: z.coerce.number().int().min(1).max(65535).default(8080).describe("HTTP listen port") },
  runtimeEnv: {},
});
console.log(toContract(env).includes("PORT") ? "ok" : "no PORT in the contract");
