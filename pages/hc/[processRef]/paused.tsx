import { Button, PageAnnouncement, Paragraph } from "lbh-frontend-react";
import { NextPage } from "next";
import React from "react";
import processName from "../../../config/processName";
import { PageTitle } from "../../../helpers/PageTitle";
import { MainLayout } from "../../../layouts/MainLayout";

const PausedPage: NextPage = () => {
  return (
    <MainLayout title={PageTitle.Paused}>
      <PageAnnouncement title="Process paused">
        <Paragraph>
          The {processName} has been paused and saved to your work tray ready to
          continue later.
        </Paragraph>
      </PageAnnouncement>

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

export default PausedPage;
