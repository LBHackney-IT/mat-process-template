import { NamedSchema, StoreNames } from "remultiform";
import { databaseSchemaVersion } from "./databaseSchemaVersion";
import { ProcessRef } from "./ProcessDatabaseSchema";

export const externalDatabaseName = `mat-process-${process.env.PROCESS_NAME}-external-${process.env.ENVIRONMENT_NAME}`;

export type ExternalDatabaseSchema = NamedSchema<
  typeof externalDatabaseName,
  typeof databaseSchemaVersion,
  {
    officer: {
      key: ProcessRef;
      value: {
        fullName: string;
      };
    };
  }
>;

const storeNames: {
  [_ in StoreNames<ExternalDatabaseSchema["schema"]>]: boolean;
} = {
  officer: true,
};

export const externalStoreNames = Object.entries(storeNames)
  .filter(([, include]) => include)
  .reduce(
    (names, [name]) => [
      ...names,
      name as StoreNames<ExternalDatabaseSchema["schema"]>,
    ],
    [] as StoreNames<ExternalDatabaseSchema["schema"]>[]
  );
