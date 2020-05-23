import getConfig from "next/config";
import { NextRouter, useRouter } from "next/router";
import { useAsync, UseAsyncReturn } from "react-async-hook";

const {
  publicRuntimeConfig: { allRoutes },
} = getConfig();

export const precacheAll = async (router: NextRouter): Promise<boolean> => {
  await Promise.all(
    (allRoutes as string[]).map((route) =>
      // Next only prefetches on production, and blocks on development.
      process.env.NODE_ENV === "production" ? router.prefetch(route) : undefined
    )
  );

  return true;
};

export const usePrecacheAll = (): UseAsyncReturn<boolean, []> => {
  const router = useRouter();

  return useAsync(async () => precacheAll(router), []);
};
