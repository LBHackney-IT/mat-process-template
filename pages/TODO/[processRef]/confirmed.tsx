import { isInManagerReview, ProcessStage } from "@hackney/mat-process-utils";
import {
  Button,
  Heading,
  HeadingLevels,
  PageAnnouncement,
  Paragraph,
} from "lbh-frontend-react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import processName from "../../../config/processName";
import { getProcessStage } from "../../../helpers/getProcessStage";
import { PageTitle } from "../../../helpers/PageTitle";
import { MainLayout } from "../../../layouts/MainLayout";

const ConfirmedPage: NextPage = () => {
  const router = useRouter();
  const processStage = getProcessStage(router);
  const isInManagerStage = isInManagerReview(
    processStage as ProcessStage | undefined
  );

  const { status } = router.query;

  const managerApprovedText = `The ${processName} has been approved by you.`;
  const managerDeclinedText = `The ${processName} has been declined by you. The Housing Officer will be notified.`;
  const officerText = `The ${processName} has been submitted for manager review.`;

  const managerText = status
    ? status === "2"
      ? managerApprovedText
      : managerDeclinedText
    : "Loading...";

  return (
    <MainLayout title={PageTitle.Confirmed}>
      <PageAnnouncement title="Process submission confirmed">
        <Paragraph>{isInManagerStage ? managerText : officerText}</Paragraph>
      </PageAnnouncement>

      <Heading level={HeadingLevels.H3}>What to do next?</Heading>
      {isInManagerStage || (
        <Paragraph>
          <Button
            disabled={!process.env.DIVERSITY_FORM_URL}
            onClick={(): void => {
              if (process.env.DIVERSITY_FORM_URL) {
                location.assign(process.env.DIVERSITY_FORM_URL);
              }
            }}
          >
            Go to diversity monitoring form
          </Button>
        </Paragraph>
      )}
      <Paragraph>
        <Button
          disabled={!process.env.WORKTRAY_URL}
          onClick={(): void => {
            if (process.env.WORKTRAY_URL) {
              location.assign(process.env.WORKTRAY_URL);
            }
          }}
        >
          Return to my work tray
        </Button>
      </Paragraph>
    </MainLayout>
  );
};

export default ConfirmedPage;
