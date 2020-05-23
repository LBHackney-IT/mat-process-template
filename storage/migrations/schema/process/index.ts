import { Upgrade } from "remultiform";
import { ProcessDatabaseSchema } from "../../../ProcessDatabaseSchema";
import from0 from "./from0";

export default {
  0: from0,
} as {
  [n: number]:
    | ((upgrade: Upgrade<ProcessDatabaseSchema["schema"]>) => void)
    | undefined;
};
