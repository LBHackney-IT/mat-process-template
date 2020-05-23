import { v1 as uuid } from "uuid";
import { databaseSchemaVersion } from "../../storage/databaseSchemaVersion";

export const createTestProcess = async (ref = uuid()): Promise<void> => {
  process.env.TEST_PROCESS_REF = ref;

  const body = JSON.stringify({
    processRef: process.env.TEST_PROCESS_REF,
    processType: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      value: parseInt(process.env.PROCESS_TYPE_VALUE!),
      name: process.env.PROCESS_TYPE_NAME,
    },
    processDataSchemaVersion: databaseSchemaVersion,
  });

  const response = await fetch(
    `https://${process.env.PROCESS_API_HOST}${process.env.PROCESS_API_BASE_URL}/v1/processData`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.PROCESS_API_KEY || "",
      },
      body,
    }
  );

  expect(response.status).toEqual(201);
};
