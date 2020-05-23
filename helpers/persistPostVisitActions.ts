import { Notes } from "@hackney/mat-process-utils";
import {
  ComponentValue,
  Database,
  NamedSchema,
  Schema,
  StoreNames,
  TransactionMode,
} from "remultiform";
import basePath from "../config/basePath";
import {
  ProcessDatabaseSchema,
  ProcessJson,
  processNotesPaths,
  processPostVisitActionMap,
  ProcessRef,
} from "../storage/ProcessDatabaseSchema";
import { Storage } from "../storage/Storage";
import { getMatApiData } from "./getMatApiData";
import { getMatApiJwt } from "./getMatApiJwt";

interface NotesByPath {
  [pathName: string]: Notes;
}

interface NotesByStore {
  [storeName: string]: NotesByPath;
}

export type SchemaValues<DBSchema extends Schema> = {
  [StoreName in StoreNames<DBSchema>]?: Partial<DBSchema[StoreName]["value"]>;
};

const collectNotesByStoreName = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DBSchema extends NamedSchema<string, number, any>,
  StoreName extends StoreNames<DBSchema["schema"]>
>(
  storeName: StoreName,
  notesPaths: string[],
  data: SchemaValues<DBSchema["schema"]>
): NotesByStore => {
  const notesByStore: NotesByStore = {};

  notesByStore[storeName] = notesPaths.reduce(
    (paths, path) => ({ ...paths, [path]: [] }),
    {}
  );

  const storeValue = data[storeName];

  if (!storeValue) {
    return {};
  }

  for (const path of notesPaths) {
    const pathComponents = path.split(".");
    let valueForPath: ComponentValue<DBSchema, StoreName> = storeValue;

    while (pathComponents.length > 0) {
      if (typeof valueForPath !== "object") {
        valueForPath = undefined;

        break;
      }

      const key: keyof ComponentValue<
        DBSchema,
        StoreName
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      > = pathComponents.shift()!;

      valueForPath = valueForPath[key];
    }

    if (valueForPath !== undefined) {
      if (Array.isArray(valueForPath)) {
        notesByStore[storeName][path] = [
          ...notesByStore[storeName][path],
          ...valueForPath,
        ];
      } else {
        console.error(
          `Invalid note found at ${path} for ${storeName}: ${JSON.stringify(
            valueForPath
          )}`
        );
      }
    }
  }

  return notesByStore;
};

const getNotes = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DBSchema extends NamedSchema<string, number, any>
>(
  values: SchemaValues<DBSchema["schema"]> | undefined,
  notesPaths: {
    [Name in StoreNames<DBSchema["schema"]>]: string[] | never[];
  }
): NotesByStore => {
  if (!values) {
    return {};
  }

  return Object.entries<string[] | never[]>(notesPaths)
    .filter(([, path]) => path.length > 0)
    .reduce<NotesByStore>(
      (noteValues, [storeName, paths]) => ({
        ...noteValues,
        ...collectNotesByStoreName<DBSchema, StoreNames<DBSchema["schema"]>>(
          storeName as StoreNames<DBSchema["schema"]>,
          paths,
          values
        ),
      }),
      {}
    );
};

export const getProcessDataNotes = (
  processData: SchemaValues<ProcessDatabaseSchema["schema"]>
): NotesByStore => {
  return getNotes(processData, processNotesPaths);
};

const postValueToBackend = async (
  value: string,
  postVisitActionMap: { category: string; subcategory: string },
  processRef: string
): Promise<void> => {
  const matApiJwt = getMatApiJwt(processRef);

  const body = {
    description: value,
    category: postVisitActionMap.category,
    subcategory: postVisitActionMap.subcategory,
    data: getMatApiData(processRef),
  };

  const response = await fetch(
    `${basePath}/api/v1/processes/${processRef}/post-visit-actions?jwt=${matApiJwt}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }
};

const updateNotesCreatedAt = async <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DBSchema extends NamedSchema<string, number, any>,
  StoreName extends StoreNames<DBSchema["schema"]>
>(
  database: Database<DBSchema>,
  storeName: StoreName,
  ref: string,
  path: string,
  noteIndex: number
): Promise<void> => {
  const pathComponents = path.split(".");

  await database.transaction(
    [storeName],
    async (stores) => {
      const store = stores[storeName];

      const value = await store.get(ref);

      if (!value) {
        throw new Error("No existing value to update for note");
      }

      let notes: ComponentValue<DBSchema, StoreName> = value;

      let key: keyof ComponentValue<DBSchema, StoreName> | undefined;

      while (pathComponents.length > 0) {
        const newKey: keyof ComponentValue<
          DBSchema,
          StoreName
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        > = pathComponents.shift()!;

        key = newKey;
        notes = notes[key];
      }

      const newNotes: Notes = notes;

      newNotes[noteIndex] = {
        ...newNotes[noteIndex],
        createdAt: new Date().toISOString(),
      };

      await store.put(ref, value);
    },
    TransactionMode.ReadWrite
  );
};

export const persistPostVisitActions = async (
  processJson: Partial<ProcessJson>,
  processRef: ProcessRef
): Promise<void> => {
  const { processData } = processJson;

  const processDatabase = await Storage.ProcessContext?.database;

  if (!processDatabase) {
    throw new Error("Process database not found");
  }

  const processNotes =
    processData === undefined
      ? {}
      : getProcessDataNotes(
          processData as SchemaValues<ProcessDatabaseSchema["schema"]>
        );

  for (const [storeName, notesByPath] of Object.entries(processNotes)) {
    const storeMap =
      processPostVisitActionMap[
        storeName as StoreNames<ProcessDatabaseSchema["schema"]>
      ];

    for (const [path, notes] of Object.entries(notesByPath)) {
      const postVisitActionMap = storeMap[path];

      await Promise.all(
        notes.map(async (note, index) => {
          if (!note) {
            console.error(`Note for ${path} on ${storeName} was ${note}`);

            return;
          }

          if (note.createdAt || !note.isPostVisitAction || note.value === "") {
            return;
          }

          await postValueToBackend(note.value, postVisitActionMap, processRef);
          await updateNotesCreatedAt(
            processDatabase,
            storeName as StoreNames<ProcessDatabaseSchema["schema"]>,
            processRef,
            path,
            index
          );
        })
      );
    }
  }
};
