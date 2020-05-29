import {
  makeNextRouterUrls,
  makeUrlFromSlug,
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
import { PageTitle } from "../../../helpers/PageTitle";
import { persistProcessData } from "../../../helpers/persistProcessData";
import { repeatingStepSlugs, Slug, stepSlugs } from "../../../helpers/Slug";
import { MainLayout } from "../../../layouts/MainLayout";

const PausePage: NextPage = () => {
  const router = useRouter();
  const online = useOnlineWithRetry();
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState();

  let content: React.ReactElement;

  if (online.loading) {
    content = (
      <Paragraph>
        We are currently checking your online status. Please wait...
      </Paragraph>
    );
  } else {
    content = (
      <PageAnnouncement title="Process pause pending">
        <Paragraph>
          {online.result
            ? "You are online."
            : "You are currently working offline."}
        </Paragraph>
        <Paragraph>
          The {processName} has been saved to your device but still needs to be
          saved to your work tray so you can resume it later.
        </Paragraph>
        <Paragraph>
          <strong>You need to be online on this device to continue.</strong>
        </Paragraph>
        <Paragraph>
          If you can&apos;t go online now, when you are next online{" "}
          <strong>on this device</strong>, please come back to this{" "}
          {processName} from your work tray and click on the &lsquo;Save and
          continue later&rsquo; button below that will become able to be
          clicked.
        </Paragraph>
        {!online.error && online.result && (
          <Paragraph>
            <strong>You are online</strong>, and can save this {processName} to
            your work tray now.
          </Paragraph>
        )}
      </PageAnnouncement>
    );
  }

  const { href, as } = makeNextRouterUrls(
    router,
    makeUrlFromSlug(router, Slug.Paused, basePath),
    basePath,
    stepSlugs,
    repeatingStepSlugs
  );

  const disabled =
    online.loading ||
    Boolean(online.error) ||
    !online.result ||
    saving ||
    !href.pathname ||
    !as.pathname;

  return (
    <MainLayout title={PageTitle.Pause}>
      {online.error && (
        <ErrorMessage>
          Something went wrong while checking your online status. Please reload
          the page and try again. If the problem persists, please try reopening
          this process from your worktray.
        </ErrorMessage>
      )}

      {saveError && (
        <ErrorMessage>
          Something went wrong. Please try going back and pausing this process
          again.
        </ErrorMessage>
      )}

      {content}

      {saving && (
        <ProgressBar
          progress={progress}
          incompleteLabel={saveError ? "Error" : "Saving..."}
          completeLabel={saveError ? "Error" : "Saved"}
        />
      )}

      {!saving && (
        <>
          <Button
            disabled={disabled}
            preventDoubleClick
            onClick={async (): Promise<void> => {
              if (!href.pathname || !as.pathname) {
                return;
              }

              try {
                setSaving(true);

                await persistProcessData(router, setProgress);

                sessionStorage.clear();

                await router.push(href, as);
              } catch (err) {
                console.error(err);

                setSaveError(err);
              }
            }}
            data-testid="submit"
          >
            {disabled
              ? "Waiting for connectivity..."
              : "Save and continue later"}
          </Button>
          <Button
            className="lbh-button--secondary govuk-button--secondary"
            onClick={(): void => {
              router.back();
            }}
          >
            Cancel and continue now
          </Button>
        </>
      )}

      <style jsx>{`
        :global(button:not(:last-child)) {
          margin-right: 1em;
        }
      `}</style>
    </MainLayout>
  );
};

export default PausePage;
