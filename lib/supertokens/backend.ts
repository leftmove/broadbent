import supertokens from "supertokens-node";
import { backendConfig } from "./backendConfig";

export function ensureSuperTokensInit() {
  if (supertokens.getInstanceOrThrowError().appInfo === undefined) {
    supertokens.init(backendConfig());
  }
}