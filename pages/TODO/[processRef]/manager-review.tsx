import {
  getProcessRef,
  ManagerSubmitButtons,
  useDatabase,
  useDataValue,
} from "@hackney/mat-process-utils";
import formatDate from "date-fns/format";
import {
  Heading,
  HeadingLevels,
  Paragraph,
  SummaryList,
  Textarea,
} from "lbh-frontend-react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useState } from "react";
import basePath from "../../../config/basePath";
import processName from "../../../config/processName";
import { PageTitle } from "../../../helpers/PageTitle";
import { repeatingStepSlugs, Slug, stepSlugs } from "../../../helpers/Slug";
import {
  approveProcess,
  declineProcess,
} from "../../../helpers/transferProcess";
import { MainLayout } from "../../../layouts/MainLayout";
import { Storage } from "../../../storage/Storage";

const ReviewPage: NextPage = () => {
  const router = useRouter();
  const processRef = getProcessRef(router);
  const processDatabase = useDatabase(Storage.ProcessContext);
  const [managerNotes, setReviewComment] = useState("");

  const officerFullName = useDataValue(
    Storage.ExternalContext,
    "officer",
    processRef,
    (values) => (processRef ? values[processRef]?.fullName : undefined)
  );
  const submittedAt = useDataValue(
    Storage.ProcessContext,
    "submittedAt",
    processRef,
    (values) => (processRef ? values[processRef] : undefined)
  );

  const submittedAtString = submittedAt.loading
    ? "Loading..."
    : submittedAt.result &&
      formatDate(new Date(submittedAt.result), "d MMMM yyyy");

  const summaryRows = [
    {
      key: "Completed by",
      value: officerFullName.loading ? "Loading..." : officerFullName.result,
    },
    {
      key: "Date completed",
      value: submittedAtString,
    },
  ];

  return (
    <MainLayout
      title={PageTitle.ManagerReview}
      heading={`Review ${processName}`}
    >
      <SummaryList
        className="govuk-summary-list--no-border mat-tenancy-summary"
        rows={summaryRows}
      />
      <Paragraph>Date of visit: {submittedAtString}</Paragraph>
      <Textarea
        name="review-comment"
        label={{
          children: (
            <Heading level={HeadingLevels.H2}>Manager&apos;s comment</Heading>
          ),
        }}
        onChange={(textValue: string): void => setReviewComment(textValue)}
        value={managerNotes}
        rows={4}
      />
      <ManagerSubmitButtons
        targetSlug={Slug.Submit}
        basePath={basePath}
        stepSlugs={stepSlugs}
        repeatingStepSlugs={repeatingStepSlugs}
        disabled={!processRef || !processDatabase.result}
        onApprove={async (): Promise<boolean> => {
          if (!processRef || !processDatabase.result) {
            return false;
          }

          await approveProcess(router);
          await processDatabase.result.put(
            "managerNotes",
            processRef,
            managerNotes
          );

          return true;
        }}
        onDecline={async (): Promise<boolean> => {
          if (!processRef || !processDatabase.result) {
            return false;
          }

          await declineProcess(router);
          await processDatabase.result.put(
            "managerNotes",
            processRef,
            managerNotes
          );

          return true;
        }}
      />
      <style jsx>{`
        :global(.mat-tenancy-summary dt, .mat-tenancy-summary dd) {
          padding-bottom: 0 !important;
        }
      `}</style>
    </MainLayout>
  );
};

export default ReviewPage;
