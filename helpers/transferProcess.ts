import { getProcessRef, ProcessStage } from "@hackney/mat-process-utils";
import { NextRouter } from "next/router";
import basePath from "../config/basePath";
import { getMatApiData } from "./getMatApiData";
import { getMatApiJwt } from "./getMatApiJwt";

const transferProcess = async (
  router: NextRouter,
  stage: ProcessStage
): Promise<void> => {
  const processRef = getProcessRef(router);
  const matApiJwt = getMatApiJwt(processRef);
  const data = getMatApiData(processRef);

  const response = await fetch(
    `${basePath}/api/v1/processes/${processRef}/transfer?jwt=${matApiJwt}&processStage=${stage}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data }),
    }
  );

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }
};

const appraiseProcess = async (
  router: NextRouter,
  stage: ProcessStage
): Promise<void> => {
  const processRef = getProcessRef(router);
  const matApiJwt = getMatApiJwt(processRef);
  const data = getMatApiData(processRef);

  const response = await fetch(
    `${basePath}/api/v1/processes/${processRef}/appraise?jwt=${matApiJwt}&processStage=${stage}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data }),
    }
  );

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }
};

const transferProcessToManager = async (router: NextRouter): Promise<void> => {
  await transferProcess(router, ProcessStage.InReview);
};

const approveProcess = async (router: NextRouter): Promise<void> => {
  await transferProcess(router, ProcessStage.Approved);
  await appraiseProcess(router, ProcessStage.Approved);
};

const declineProcess = async (router: NextRouter): Promise<void> => {
  await transferProcess(router, ProcessStage.Declined);
  await appraiseProcess(router, ProcessStage.Declined);
};

export { transferProcessToManager, approveProcess, declineProcess };
