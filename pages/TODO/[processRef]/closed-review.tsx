import {
  getProcessRef,
  SubmitButtons,
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
import React from "react";
import basePath from "../../../config/basePath";
import processName from "../../../config/processName";
import { PageTitle } from "../../../helpers/PageTitle";
import { repeatingStepSlugs, Slug, stepSlugs } from "../../../helpers/Slug";
import { MainLayout } from "../../../layouts/MainLayout";
import { Storage } from "../../../storage/Storage";

const ReviewPage: NextPage = () => {
  const router = useRouter();
  const processRef = getProcessRef(router);

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
  const managerNotes = useDataValue(
    Storage.ProcessContext,
    "managerNotes",
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
      title={PageTitle.ClosedReview}
      heading={`Review ${processName}`}
    >
      <SummaryList
        className="govuk-summary-list--no-border mat-tenancy-summary"
        rows={summaryRows}
      />
      <Paragraph>Date of visit: {submittedAtString}</Paragraph>
      <Textarea
        name="manager-comment"
        label={{
          children: (
            <Heading level={HeadingLevels.H2}>Manager&apos;s comment</Heading>
          ),
        }}
        value={managerNotes.result || ""}
        rows={4}
        disabled
      />
      <SubmitButtons
        buttons={[
          {
            slug: Slug.Pause,
            value: "Exit process",
          },
        ]}
        basePath={basePath}
        stepSlugs={stepSlugs}
        repeatingStepSlugs={repeatingStepSlugs}
        onSubmit={
          // eslint-disable-next-line @typescript-eslint/require-await
          async (): Promise<boolean> => true
        }
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
