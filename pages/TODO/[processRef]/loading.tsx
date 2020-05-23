import {
  getProcessRef,
  isClosed,
  isInManagerReview,
  makeNextRouterUrls,
  makeUrlFromSlug,
  ON_SERVER,
  ProcessStage,
  ProgressBar,
} from "@hackney/mat-process-utils";
import {
  Button,
  ErrorMessage,
  Heading,
  HeadingLevels,
  Paragraph,
} from "lbh-frontend-react";
import { NextPage } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useMemo, useState } from "react";
import { useAsync } from "react-async-hook";
import basePath from "../../../config/basePath";
import processName from "../../../config/processName";
import { getMatApiData } from "../../../helpers/getMatApiData";
import { getProcessApiJwt } from "../../../helpers/getProcessApiJwt";
import { getProcessStage } from "../../../helpers/getProcessStage";
import { PageTitle } from "../../../helpers/PageTitle";
import { repeatingStepSlugs, Slug, stepSlugs } from "../../../helpers/Slug";
import { useApi } from "../../../helpers/useApi";
import {
  useApiWithStorage,
  UseApiWithStorageReturn,
} from "../../../helpers/useApiWithStorage";
import { usePrecacheAll } from "../../../helpers/usePrecacheAll";
import { MainLayout } from "../../../layouts/MainLayout";
import { ExternalDatabaseSchema } from "../../../storage/ExternalDatabaseSchema";
import { ProcessJson } from "../../../storage/ProcessDatabaseSchema";
import { Storage } from "../../../storage/Storage";

const useFetchProcessJson = (): {
  loading: boolean;
  result?: ProcessJson;
  error?: Error;
} => {
  const router = useRouter();
  const processRef = getProcessRef(router);
  const processData = useApi<{ processData: ProcessJson }>({
    endpoint: `/v1/processes/${processRef}/processData`,
    jwt: {
      sessionStorageKey:
        !ON_SERVER && processRef
          ? `${basePath}/${processRef}:processApiJwt`
          : undefined,
    },
    execute: Boolean(processRef),
  });

  return {
    loading: processData.loading,
    error: processData.error,
    result: processData.result?.processData,
  };
};

const useFetchImages = (
  processData: ProcessJson["processData"] | undefined
): {
  loading: boolean;
  result?: { id: string; ext: string; image: string }[];
  error?: Error;
  fetchedImageCount: number;
  expectedImageCount: number;
} => {
  const router = useRouter();
  const processRef = getProcessRef(router);
  const jwt = getProcessApiJwt(processRef);
  const images = processData
    ? Storage.getImagesToFetch(processData)
    : undefined;
  const [fetchedImageCount, setFetchedImageCount] = useState(0);
  const imageResults = useAsync(async () => {
    if (ON_SERVER) {
      return;
    }

    if (!images) {
      return;
    }

    if (!processRef) {
      throw new Error("Process ref is missing from session storage");
    }

    if (!jwt) {
      throw new Error("JWT is missing from session storage");
    }

    return Promise.all(
      images.map(async ({ id, ext }) => {
        const response = await fetch(
          `${basePath}/api/v1/processes/${processRef}/images/${id}/${ext}?jwt=${jwt}`,
          { method: "GET" }
        );
        const responseBody = await response.text();

        let image: { base64Image: string } | undefined = undefined;

        try {
          image = JSON.parse(responseBody);
        } catch (err) {
          if (err.name !== "SyntaxError") {
            throw err;
          }
        }

        if (!response.ok) {
          console.error(`${response.status}: ${response.statusText}`);

          throw new Error("Error accessing API");
        }

        if (image === undefined) {
          console.error(responseBody);

          throw new Error("Invalid JSON response from API");
        }

        setFetchedImageCount((count) => count + 1);

        return { id, ext, image: image.base64Image };
      })
    );
  }, [processRef, jwt, JSON.stringify(images)]);

  return {
    loading: ON_SERVER || imageResults.loading || !images,
    result: images ? imageResults.result : undefined,
    error: imageResults.error,
    fetchedImageCount,
    expectedImageCount: images ? images.length : 0,
  };
};

const useFetchProcessJsonWithImages = (): {
  loading: boolean;
  result?: ProcessJson;
  error?: Error;
  completedStepCount: number;
  expectedStepCount: number;
} => {
  const processJson = useFetchProcessJson();
  const images = useFetchImages(processJson.result?.processData);
  const processJsonWithImages = useMemo(() => {
    let loading = true;
    let error: Error | undefined;
    let result: ProcessJson | undefined = undefined;

    if (
      !processJson.loading &&
      !processJson.error &&
      processJson.result &&
      processJson.result.processData &&
      !images.loading &&
      !images.error &&
      images.result
    ) {
      try {
        if (images.result.length) {
          let processDataString = JSON.stringify(
            processJson.result.processData
          );

          for (const { id, ext, image } of images.result) {
            processDataString = processDataString.replace(
              new RegExp(`image:${id}\\.${ext}`, "g"),
              image
            );
          }

          result = {
            ...processJson.result,
            processData: JSON.parse(processDataString),
          };
        } else {
          result = processJson.result;
        }
      } catch (err) {
        error = err;
      }

      loading = false;
    }

    return { loading, result, error };
  }, [
    processJson.loading,
    processJson.error,
    processJson.result,
    images.loading,
    images.error,
    images.result,
  ]);

  const loading =
    processJson.loading || images.loading || processJsonWithImages.loading;
  const error =
    processJson.error || images.error || processJsonWithImages.error;

  return {
    loading,
    result: loading || error ? undefined : processJsonWithImages.result,
    error,
    completedStepCount:
      images.fetchedImageCount +
      (processJson.loading ? 0 : 1) +
      (processJsonWithImages.loading ? 0 : 1),
    expectedStepCount: images.expectedImageCount + 2,
  };
};

const useFetchAndStoreProcessJson = (): {
  loading: boolean;
  result?: boolean;
  error?: Error;
  completedStepCount: number;
  expectedStepCount: number;
} => {
  const router = useRouter();
  const processRef = getProcessRef(router);
  const processJson = useFetchProcessJsonWithImages();
  const offlineSync = useAsync(async () => {
    if (
      !processRef ||
      processJson.loading ||
      processJson.error ||
      !processJson.result
    ) {
      return;
    }

    return Storage.updateProcessData(processRef, processJson.result);
  }, [
    processRef,
    processJson.loading,
    processJson.error,
    JSON.stringify(processJson.result),
  ]);

  const loading = processJson.loading || offlineSync.loading;
  const error = processJson.error || offlineSync.error;

  return {
    loading,
    result: loading ? undefined : offlineSync.result,
    error,
    completedStepCount:
      processJson.completedStepCount + (offlineSync.loading ? 0 : 1),
    expectedStepCount: processJson.expectedStepCount + 1,
  };
};

const useOfficerData = (): UseApiWithStorageReturn<
  ExternalDatabaseSchema,
  "officer"
> => {
  const router = useRouter();
  const processRef = getProcessRef(router);
  const data = getMatApiData(processRef);

  return useApiWithStorage({
    endpoint: "/v1/officer",
    query: { data },
    jwt: {
      sessionStorageKey:
        !ON_SERVER && processRef
          ? `${basePath}/${processRef}:matApiJwt`
          : undefined,
    },
    execute: Boolean(processRef),
    parse(data: { fullName: string }) {
      return { fullName: data.fullName };
    },
    databaseContext: Storage.ExternalContext,
    databaseMap: {
      storeName: "officer",
      key: processRef,
    },
  });
};

export const LoadingPage: NextPage = () => {
  const router = useRouter();
  const processDataSyncStatus = useFetchAndStoreProcessJson();
  const officerData = useOfficerData();
  const precacheProcessPages = usePrecacheAll();

  const extraResults = [officerData, precacheProcessPages];

  const loading =
    processDataSyncStatus.loading ||
    extraResults.some((result) => result.loading);
  const errored =
    Boolean(processDataSyncStatus.error) ||
    extraResults.some((result) => result.error);
  const ready =
    !loading &&
    !errored &&
    processDataSyncStatus.result !== undefined &&
    extraResults.every((result) => result.result !== undefined);

  for (const result of [processDataSyncStatus, ...extraResults]) {
    if (result.error) {
      // We should give the user some way to recover from this. Perhaps we
      // should retry in this case and dedupe the error?
      console.error(result.error);
    }
  }

  const progress =
    (extraResults.filter(
      (result) =>
        !result.loading && !result.error && result.result !== undefined
    ).length +
      processDataSyncStatus.completedStepCount) /
    (extraResults.length + processDataSyncStatus.expectedStepCount);

  const processStage = getProcessStage(router) as ProcessStage | undefined;
  const isInManagerStage = isInManagerReview(processStage);
  const isInClosedStage = isClosed(processStage);

  const nextSlug = isInManagerStage
    ? Slug.ManagerReview
    : isInClosedStage
    ? Slug.ClosedReview
    : // TODO: Replace with the first step in the process.
      Slug.Review;

  const { href, as } = makeNextRouterUrls(
    router,
    makeUrlFromSlug(router, nextSlug, basePath),
    basePath,
    stepSlugs,
    repeatingStepSlugs
  );

  const button = (
    <Button
      disabled={!ready || !href.pathname || !as.pathname}
      data-testid="submit"
    >
      {ready ? "Go" : "Loading..."}
    </Button>
  );

  return (
    <MainLayout title={PageTitle.Loading} heading={processName}>
      {errored && (
        <ErrorMessage>
          Something went wrong. Please try reopening this process from your
          worktray.
        </ErrorMessage>
      )}

      <Heading level={HeadingLevels.H2}>Loading</Heading>
      <Paragraph>
        {isInManagerStage || isInClosedStage
          ? "The system is fetching the information you need for this process."
          : "The system is updating the information you need for this process so that you can go offline at any point."}
      </Paragraph>

      <ProgressBar
        progress={progress}
        incompleteLabel={errored ? "Error" : "Loading..."}
        completeLabel={
          errored
            ? "Error"
            : processDataSyncStatus.result
            ? "Ready (updated)"
            : "Ready (no update needed)"
        }
      />

      {href.pathname && as.pathname ? (
        <NextLink href={href} as={as}>
          {button}
        </NextLink>
      ) : (
        button
      )}
    </MainLayout>
  );
};

export default LoadingPage;
