import {
  Database,
  DatabaseContext,
  StoreValue,
  TransactionMode,
} from "remultiform";
import { v5 as uuid } from "uuid";
import { databaseSchemaVersion } from "./databaseSchemaVersion";
import {
  externalDatabaseName,
  ExternalDatabaseSchema,
} from "./ExternalDatabaseSchema";
import { migrateData } from "./migrations/data/migrateData";
import { migrateSchema } from "./migrations/migrateSchema";
import externalSchemaMigrations from "./migrations/schema/external";
import processSchemaMigrations from "./migrations/schema/process";
import {
  processDatabaseName,
  ProcessDatabaseSchema,
  ProcessJson,
  ProcessRef,
  processStoreNames,
} from "./ProcessDatabaseSchema";

interface ImageJson {
  id: string;
  image: string;
}

interface ImageIdentifier {
  id: string;
  ext: string;
}

export class Storage {
  static ExternalContext:
    | DatabaseContext<ExternalDatabaseSchema>
    | undefined = undefined;
  static ProcessContext:
    | DatabaseContext<ProcessDatabaseSchema>
    | undefined = undefined;

  static init(): void {
    const externalDatabasePromise = Database.open<ExternalDatabaseSchema>(
      externalDatabaseName,
      databaseSchemaVersion,
      {
        upgrade(upgrade) {
          migrateSchema<ExternalDatabaseSchema>(
            upgrade,
            externalSchemaMigrations
          );
        },
      }
    );

    const processDatabasePromise = Database.open<ProcessDatabaseSchema>(
      processDatabaseName,
      databaseSchemaVersion,
      {
        upgrade(upgrade) {
          migrateSchema<ProcessDatabaseSchema>(
            upgrade,
            processSchemaMigrations
          );
        },
      }
    );

    this.ExternalContext = new DatabaseContext(externalDatabasePromise);
    this.ProcessContext = new DatabaseContext(processDatabasePromise);
  }

  static async getProcessJson(
    processRef: ProcessRef
  ): Promise<
    | {
        processJson: Partial<ProcessJson>;
        imagesJson: ImageJson[];
      }
    | undefined
  > {
    if (!processRef || !this.ProcessContext) {
      return;
    }

    const processDatabase = await this.ProcessContext.database;

    let lastModifiedAt: string | undefined;

    let processData = (
      await Promise.all(
        processStoreNames.map(async (storeName) => {
          const value = await processDatabase.get(storeName, processRef);

          if (storeName === "lastModifiedAt") {
            lastModifiedAt = value as StoreValue<
              ProcessDatabaseSchema["schema"],
              typeof storeName
            >;

            return {};
          }

          return { [storeName]: value };
        })
      )
    ).reduce(
      (valuesObj, valueObj) => ({
        ...valuesObj,
        ...valueObj,
      }),
      {}
    ) as Exclude<ProcessJson["processData"], undefined>;

    let processDataString = JSON.stringify(processData);

    const imageDataUris = (
      processDataString.match(/data:image\/[\w.\-+]+.+?(?=")/g) || []
    ).filter((match, i, matches) => matches.indexOf(match) === i);
    const images = [] as ImageJson[];

    for (const image of imageDataUris) {
      const [type] = /image\/[\w.\-+]+/.exec(image) || [];

      if (!type) {
        console.error(`Skipping unexpected data URI of type ${type}`);

        continue;
      }

      const id = uuid(image, processRef);
      const ext = type.replace("image/", "");

      processDataString = processDataString
        .split(image)
        .join(`image:${id}.${ext}`);

      images.push({ id, image });
    }

    processData = JSON.parse(processDataString);

    return {
      processJson: {
        dateLastModified: lastModifiedAt,
        // Ideally we'd be exposing the version on the database directly, but
        // this hack works for now.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dataSchemaVersion: (processDatabase as any).db.version,
        processData,
      },
      imagesJson: images,
    };
  }

  static getImagesToFetch(
    processData: ProcessJson["processData"]
  ): ImageIdentifier[] {
    const processDataString = JSON.stringify(processData);

    const imageKeys = (
      processDataString.match(/image:[\w-]+?.+?(?=")/g) || []
    ).filter((match, i, matches) => matches.indexOf(match) === i);

    const images = [] as ImageIdentifier[];

    for (const image of imageKeys) {
      const [id, ext] = image.replace("image:", "").split(".", 2);

      images.push({ id, ext });
    }

    return images;
  }

  static async updateProcessData(
    processRef: ProcessRef,
    data: ProcessJson
  ): Promise<boolean> {
    const {
      dateCreated,
      dateLastModified,
      dataSchemaVersion,
      processData,
    } = data;

    if (!processData) {
      return false;
    }

    if (!dateLastModified && !dateCreated) {
      throw new Error("No last modified or created dates");
    }

    if (!this.ProcessContext || !this.ProcessContext.database) {
      throw new Error("No process database to update");
    }

    const processDatabase = await this.ProcessContext.database;

    // Ideally we'd be exposing the version on the databases directly, but
    // this hack works for now.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const schemaVersion = (processDatabase as any).db.version;

    const migratedProcessData = await migrateData(
      processData,
      dataSchemaVersion || 0,
      schemaVersion
    );

    const lastModifiedAt = new Date(dateLastModified || dateCreated);

    const isNewer = await this.isProcessNewerThanStorage(
      processRef,
      lastModifiedAt
    );

    if (isNewer) {
      const realProcessStoreNames = processStoreNames.filter(
        (storeName) => storeName !== "lastModifiedAt"
      );

      await processDatabase.transaction(
        realProcessStoreNames,
        async (stores) => {
          await Promise.all([
            ...realProcessStoreNames.map(async (storeName) => {
              const store = stores[storeName];
              const value = migratedProcessData[storeName];

              if (value === undefined) {
                await store.delete(processRef);
              } else {
                await store.put(
                  processRef,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  value as any
                );
              }
            }),
          ]);
        },
        TransactionMode.ReadWrite
      );
    }

    // Do this last so if anything goes wrong, we can try again.
    await processDatabase.put(
      "lastModifiedAt",
      processRef,
      lastModifiedAt.toISOString()
    );

    return isNewer;
  }

  static async updateProcessLastModified(processRef: string): Promise<void> {
    if (!this.ProcessContext) {
      return;
    }

    if (!this.ProcessContext.database) {
      return;
    }

    const database = await this.ProcessContext.database;

    await database.put("lastModifiedAt", processRef, new Date().toISOString());
  }

  static async isProcessNewerThanStorage(
    processRef: string,
    lastModifiedAt: Date
  ): Promise<boolean> {
    if (!this.ProcessContext) {
      return false;
    }

    const db = await this.ProcessContext.database;

    const storedLastModifiedAt = await db.get("lastModifiedAt", processRef);

    return storedLastModifiedAt === undefined
      ? true
      : lastModifiedAt > new Date(storedLastModifiedAt);
  }
}
