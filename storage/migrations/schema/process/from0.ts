import { Upgrade } from "remultiform";
import { ProcessDatabaseSchema } from "../../../ProcessDatabaseSchema";

export default (upgrade: Upgrade<ProcessDatabaseSchema["schema"]>): void => {
  upgrade.createStore("lastModifiedAt");
  upgrade.createStore("submittedAt");
  upgrade.createStore("review");
  upgrade.createStore("managerNotes");
};
