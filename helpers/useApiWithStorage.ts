import { ON_SERVER } from "@hackney/mat-process-utils";
import { useAsync } from "react-async-hook";
import {
  DatabaseContext,
  NamedSchema,
  Schema,
  StoreKey,
  StoreNames,
  StoreValue,
} from "remultiform";
import { ApiEndpoint, useApi } from "./useApi";

export interface ApiWithStorageEndpoint<
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>,
  R
> extends ApiEndpoint {
  parse(data: R): StoreValue<DBSchema["schema"], StoreName>;
  databaseContext: DatabaseContext<DBSchema> | undefined;
  databaseMap: {
    storeName: StoreName;
    key: StoreKey<DBSchema["schema"], StoreName> | undefined;
  };
}

export interface UseApiWithStorageReturn<
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>
> {
  loading: boolean;
  result?: StoreValue<DBSchema["schema"], StoreName>;
  error?: Error;
}

export const useApiWithStorage = <
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>,
  R
>(
  apiEndpoint: ApiWithStorageEndpoint<DBSchema, StoreName, R>
): UseApiWithStorageReturn<DBSchema, StoreName> => {
  const { parse, databaseContext, databaseMap } = apiEndpoint;

  const api = useApi<R>(apiEndpoint);

  const storage = useAsync(async () => {
    if (ON_SERVER) {
      return;
    }

    if (api.error) {
      throw api.error;
    }

    if (api.loading) {
      return;
    }

    if (!api.result) {
      return;
    }

    if (!databaseContext) {
      return;
    }

    const { storeName, key } = databaseMap;

    if (!key) {
      return;
    }

    const value = parse(api.result);

    const db = await databaseContext.database;

    await db.put(storeName, key, value);

    return value;
  }, [api.loading, JSON.stringify(api.result), api.error?.message]);

  return {
    loading: api.loading || storage.loading,
    result: storage.result,
    error: storage.error,
  };
};
