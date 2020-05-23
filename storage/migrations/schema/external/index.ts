import { Upgrade } from "remultiform";
import { ExternalDatabaseSchema } from "../../../ExternalDatabaseSchema";
import from0 from "./from0";

export default {
  0: from0,
} as {
  [n: number]:
    | ((upgrade: Upgrade<ExternalDatabaseSchema["schema"]>) => void)
    | undefined;
};
