import {
  isInManagerReview,
  makeNextRouterUrls,
  makeUrlFromSlug,
  ProcessStage,
  ProgressBar,
  useOnlineWithRetry,
} from "@hackney/mat-process-utils";
import {
  Button,
  ErrorMessage,
  PageAnnouncement,
  Paragraph,
} from "lbh-frontend-react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useState } from "react";
import basePath from "../../../config/basePath";
import processName from "../../../config/processName";
import { getProcessStage } from "../../../helpers/getProcessStage";
import { PageTitle } from "../../../helpers/PageTitle";
import { persistProcessData } from "../../../helpers/persistProcessData";
import { repeatingStepSlugs, Slug, stepSlugs } from "../../../helpers/Slug";
import { transferProcessToManager } from "../../../helpers/transferProcess";
import { MainLayout } from "../../../layouts/MainLayout";

const SubmitPage: NextPage = () => {
  const router = useRouter();
  const online = useOnlineWithRetry();
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState();

  const processStage = getProcessStage(router) as ProcessStage | undefined;
  const isInManagerStage = isInManagerReview(processStage);

  let content: React.ReactElement;

  if (online.loading) {
    content = (
      <Paragraph>
        We are currently checking your online status. Please wait...
      </Paragraph>
    );
  } else {
    content = (
      <PageAnnouncement title="Process submission pending">
        <Paragraph>
          {online.result
            ? "You are online."
            : "You are currently working offline."}
        </Paragraph>
        <Paragraph>
          The {processName} has been saved to your device ready to be sent{" "}
          {isInManagerStage
            ? "back to the officer."
            : "to your manager for review."}
        </Paragraph>
        <Paragraph>
          <strong>You need to be online on this device to continue.</strong>
        </Paragraph>
        <Paragraph>
          If you can&apos;t go online now, when you are next online{" "}
          <strong>on this device</strong>, please come back to this{" "}
          {processName} from your work tray and click on the &lsquo;Save and
          submit{isInManagerStage ? "" : " to manager"}&rsquo; button below that
          will become able to be clicked.
        </Paragraph>
        {!online.error && online.result && (
          <Paragraph>
            <strong>You are online</strong>, and can submit this {processName}{" "}
            {isInManagerStage
              ? "back to the officer now."
              : "to your manager now."}
          </Paragraph>
        )}
      </PageAnnouncement>
    );
  }

  const { href, as } = makeNextRouterUrls(
    router,
    makeUrlFromSlug(router, Slug.Confirmed, basePath),
    basePath,
    stepSlugs,
    repeatingStepSlugs
  );

  const disabled =
    online.loading ||
    Boolean(online.error) ||
    !online.result ||
    submitting ||
    !href.pathname ||
    !as.pathname;

  return (
    <MainLayout title={PageTitle.Submit}>
      {online.error && (
        <ErrorMessage>
          Something went wrong while checking your online status. Please reload
          the page and try again. If the problem persists, please try reopening
          this process from your worktray.
        </ErrorMessage>
      )}

      {submitError && (
        <ErrorMessage>
          Something went wrong. Please try reopening this process from your
          worktray and submitting it again.
        </ErrorMessage>
      )}

      {content}

      {submitting && (
        <ProgressBar
          progress={progress}
          incompleteLabel={submitError ? "Error" : "Submitting..."}
          completeLabel={submitError ? "Error" : "Submitted"}
        />
      )}

      {!submitting && (
        <Button
          disabled={disabled}
          preventDoubleClick
          onClick={async (): Promise<void> => {
            if (!href.pathname || !as.pathname) {
              return;
            }

            try {
              setSubmitting(true);

              await persistProcessData(router, setProgress);

              await transferProcessToManager(router);

              sessionStorage.clear();

              await router.push(href, as);
            } catch (err) {
              console.error(err);

              setSubmitError(err);
            }
          }}
          data-testid="submit"
        >
          {disabled
            ? "Waiting for connectivity..."
            : `Save and submit${isInManagerStage ? "" : " to manager"}`}
        </Button>
      )}
    </MainLayout>
  );
};

export default SubmitPage;
