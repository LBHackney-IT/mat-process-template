import { cloneDeep } from "lodash";
import dataMigrations from ".";
import { ProcessJson } from "../../ProcessDatabaseSchema";

export const migrateData = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  oldVersion: number,
  newVersion: number
): Promise<Required<ProcessJson>["processData"]> => {
  let version = oldVersion;

  data = cloneDeep(data);

  while (version < newVersion) {
    const migration = dataMigrations[version];

    if (migration) {
      data = await migration(data);
    }

    version++;
  }

  return data;
};
