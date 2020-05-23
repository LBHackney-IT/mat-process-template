import { NamedSchema, Schema, Upgrade } from "remultiform";

export const migrateSchema = <
  DBNamedSchema extends NamedSchema<string, number, Schema>
>(
  upgrade: Upgrade<DBNamedSchema["schema"]>,
  schemaMigrations: {
    [_: number]:
      | ((upgrade: Upgrade<DBNamedSchema["schema"]>) => void)
      | undefined;
  }
): void => {
  if (upgrade.newVersion === undefined) {
    return;
  }

  let version = upgrade.oldVersion;

  while (version < upgrade.newVersion) {
    const migration = schemaMigrations[version];

    if (migration) {
      migration(upgrade);
    }

    version++;
  }
};
