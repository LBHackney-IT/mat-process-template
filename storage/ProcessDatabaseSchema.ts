import { Notes } from "@hackney/mat-process-utils";
import { NamedSchema, StoreNames } from "remultiform";
import { DeepPartial } from "utility-types";
import { databaseSchemaVersion } from "./databaseSchemaVersion";

export type ProcessRef = string;

export const processDatabaseName = `mat-process-${process.env.PROCESS_NAME}-process-${process.env.ENVIRONMENT_NAME}`;

export type ProcessDatabaseSchema = NamedSchema<
  typeof processDatabaseName,
  typeof databaseSchemaVersion,
  {
    lastModifiedAt: {
      key: ProcessRef;
      value: string;
    };

    submittedAt: {
      key: ProcessRef;
      value: string;
    };

    review: {
      key: ProcessRef;
      value: {
        notes: Notes;
      };
    };

    managerNotes: {
      key: ProcessRef;
      value: string;
    };
  }
>;

export interface ProcessJson {
  dateCreated: string;
  dateLastModified?: string;
  dataSchemaVersion: number;
  processData?: DeepPartial<
    {
      [StoreName in keyof ProcessDatabaseSchema["schema"]]: ProcessDatabaseSchema["schema"][StoreName]["value"];
    }
  >;
}

const storeNames: {
  [_ in StoreNames<ProcessDatabaseSchema["schema"]>]: boolean;
} = {
  lastModifiedAt: true,
  submittedAt: true,
  review: true,
  managerNotes: true,
};

export const processStoreNames = Object.entries(storeNames)
  .filter(([, include]) => include)
  .reduce(
    (names, [name]) => [
      ...names,
      name as StoreNames<ProcessDatabaseSchema["schema"]>,
    ],
    [] as StoreNames<ProcessDatabaseSchema["schema"]>[]
  );

export const processNotesPaths: {
  [Name in StoreNames<ProcessDatabaseSchema["schema"]>]: string[] | never[];
} = {
  lastModifiedAt: [],
  submittedAt: [],
  review: ["notes"],
  managerNotes: [],
};

export const processPostVisitActionMap: {
  [storeName in StoreNames<ProcessDatabaseSchema["schema"]>]: {
    [path: string]: { category: string; subcategory: string };
  };
} = {
  lastModifiedAt: {},
  submittedAt: {},
  review: {
    notes: {
      category: "24",
      subcategory: "100000209",
    },
  },
  managerNotes: {},
};
