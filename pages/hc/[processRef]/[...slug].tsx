import { getProcessRef, getSlugFromRoute } from "@hackney/mat-process-utils";
import { ErrorMessage } from "lbh-frontend-react";
import { NextPage } from "next";
import ErrorPage from "next/error";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { Orchestrator } from "remultiform";
import basePath from "../../../config/basePath";
import {
  repeatingStepSlugs,
  Slug,
  unpauseableStepSlugs,
} from "../../../helpers/Slug";
import { MainLayout } from "../../../layouts/MainLayout";
import { steps } from "../../../steps";
import { Storage } from "../../../storage/Storage";

const ProcessPage: NextPage = () => {
  const router = useRouter();
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const slug = getSlugFromRoute(router, basePath, repeatingStepSlugs);

  if (slug === undefined) {
    return null;
  }

  const step = steps.find(({ step }) => step.slug === slug);

  if (!step) {
    return <ErrorPage statusCode={404} />;
  }

  const content = (
    <>
      {
        // This should really be an ErrorSummary component, once one exists.
        errorMessages.map((message, i) => (
          <ErrorMessage key={i}>{message}</ErrorMessage>
        ))
      }
      <Orchestrator
        context={step.context}
        initialSlug={slug}
        steps={steps.map((step) => step.step)}
        manageStepTransitions={false}
        provideDatabase={false}
        onIncompleteStep={(missingValues?: string[]): void => {
          setErrorMessages(
            (missingValues || []).map((key) =>
              step.errors?.required
                ? step.errors.required[key]
                : "A required value is missing"
            )
          );
        }}
        onNextStep={async (): Promise<void> => {
          setErrorMessages([]);

          try {
            const processRef = getProcessRef(router);

            if (!processRef) {
              throw new Error("No process to reference");
            }

            await Storage.updateProcessLastModified(processRef);
          } catch (error) {
            // This is invisible to the user, so we should do something to
            // display it to them.
            console.error(error);
          }
        }}
      />
    </>
  );

  const pausable = !unpauseableStepSlugs.includes(step.step.slug as Slug);

  let page: React.ReactElement;

  if (step.heading) {
    page = (
      <MainLayout title={step.title} heading={step.heading} pausable={pausable}>
        {content}
      </MainLayout>
    );
  } else if (step.title) {
    page = (
      <MainLayout title={step.title} pausable={pausable}>
        {content}
      </MainLayout>
    );
  } else {
    console.error("At least one of title or heading is required");

    page = (
      <MainLayout title={slug} pausable={pausable}>
        {content}
      </MainLayout>
    );
  }

  return page;
};

export default ProcessPage;
