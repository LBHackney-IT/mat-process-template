import {
  getProcessRef,
  ON_SERVER,
  useRedirectWhenOnline,
} from "@hackney/mat-process-utils";
import { Paragraph } from "lbh-frontend-react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import basePath from "../../config/basePath";
import { PageTitle } from "../../helpers/PageTitle";
import { repeatingStepSlugs, Slug, stepSlugs } from "../../helpers/Slug";
import { MainLayout } from "../../layouts/MainLayout";

const useCacheQueryParameters = (): void => {
  const router = useRouter();

  if (ON_SERVER) {
    return;
  }

  const processRef = getProcessRef(router);

  if (!processRef) {
    return;
  }

  let processApiJwt = router.query.processApiJwt as string | undefined;
  let matApiJwt = router.query.matApiJwt as string | undefined;
  let matApiData = router.query.data as string | undefined;
  let processStage = router.query.processStage as string | undefined;

  if (process.env.NODE_ENV !== "production") {
    processApiJwt = processApiJwt || process.env.TEST_PROCESS_API_JWT;
    matApiJwt = matApiJwt || process.env.TEST_MAT_API_JWT;
    matApiData = matApiData || process.env.TEST_MAT_API_DATA;
    processStage = processStage || process.env.TEST_PROCESS_STAGE;
  }

  if (processApiJwt) {
    sessionStorage.setItem(
      `${basePath}/${processRef}:processApiJwt`,
      processApiJwt
    );
  } else {
    sessionStorage.removeItem(`${basePath}/${processRef}:processApiJwt`);
  }

  if (matApiJwt) {
    sessionStorage.setItem(`${basePath}/${processRef}:matApiJwt`, matApiJwt);
  } else {
    sessionStorage.removeItem(`${basePath}/${processRef}:matApiJwt`);
  }

  if (matApiData) {
    sessionStorage.setItem(`${basePath}/${processRef}:matApiData`, matApiData);
  } else {
    sessionStorage.removeItem(`${basePath}/${processRef}:matApiData`);
  }

  if (processStage) {
    sessionStorage.setItem(
      `${basePath}/${processRef}:processStage`,
      processStage
    );
  } else {
    sessionStorage.removeItem(`${basePath}/${processRef}:processStage`);
  }
};

export const IndexPage: NextPage = () => {
  useCacheQueryParameters();

  const online = useRedirectWhenOnline(
    Slug.Loading,
    basePath,
    stepSlugs,
    repeatingStepSlugs,
    "replace"
  );

  let content: React.ReactNode;

  if (online.errors) {
    for (const error of online.errors) {
      console.error(error);
    }

    content = (
      <Paragraph>
        Something went really wrong. Please contact support.
      </Paragraph>
    );
  } else if (online.result === false) {
    content = (
      <Paragraph>You are offline. Please go online to continue.</Paragraph>
    );
  } else {
    content = (
      <Paragraph>
        We are currently checking your online status. Please wait...
      </Paragraph>
    );
  }

  return (
    <MainLayout title={PageTitle.Index} heading="TODO">
      {content}
    </MainLayout>
  );
};

export default IndexPage;
