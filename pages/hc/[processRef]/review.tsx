import {
  getProcessRef,
  Notes,
  PostVisitActionInput,
  SubmitButtons,
} from "@hackney/mat-process-utils";
import formatDate from "date-fns/format";
import { Paragraph } from "lbh-frontend-react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { TransactionMode } from "remultiform";
import basePath from "../../../config/basePath";
import processName from "../../../config/processName";
import { PageTitle } from "../../../helpers/PageTitle";
import { repeatingStepSlugs, Slug, stepSlugs } from "../../../helpers/Slug";
import { MainLayout } from "../../../layouts/MainLayout";
import { Storage } from "../../../storage/Storage";

const ReviewPage: NextPage = () => {
  const router = useRouter();
  const [reviewNotes, setReviewNotes] = useState<Notes>([
    { value: "", isPostVisitAction: false },
  ]);

  return (
    <MainLayout
      title={PageTitle.Review}
      heading={`Review ${processName}`}
      pausable
    >
      <Paragraph>
        The Tenancy and Household Check has now been completed. Please review
        the answers with all present tenants and ask them to sign.
      </Paragraph>
      <PostVisitActionInput
        value={reviewNotes}
        onValueChange={(notes): void => setReviewNotes(notes)}
        required={false}
        disabled={false}
        label={{ value: "Any other notes to be added?" }}
        name="review-notes"
      />
      <Paragraph>
        Date of visit: {formatDate(new Date(), "d MMMM yyyy")}
      </Paragraph>
      <SubmitButtons
        buttons={[
          {
            slug: Slug.Submit,
            value: "Save and finish process",
          },
        ]}
        basePath={basePath}
        stepSlugs={stepSlugs}
        repeatingStepSlugs={repeatingStepSlugs}
        onSubmit={async (): Promise<boolean> => {
          const processRef = getProcessRef(router);

          if (!processRef) {
            return false;
          }

          const processDatabase = await Storage.ProcessContext?.database;

          if (!processDatabase) {
            return false;
          }

          await processDatabase.transaction(
            ["review", "submittedAt"],
            async (stores) => {
              const review = await stores.review.get(processRef);

              await stores.review.put(processRef, {
                ...review,
                notes: reviewNotes,
              });

              await stores.submittedAt.put(
                processRef,
                new Date().toISOString()
              );
            },
            TransactionMode.ReadWrite
          );

          return true;
        }}
      />
    </MainLayout>
  );
};

export default ReviewPage;
