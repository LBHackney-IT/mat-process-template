import { Upgrade } from "remultiform";
import { ExternalDatabaseSchema } from "../../../ExternalDatabaseSchema";

export default (upgrade: Upgrade<ExternalDatabaseSchema["schema"]>): void => {
  upgrade.createStore("officer");
};
