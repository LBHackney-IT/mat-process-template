import {
  makeNextRouterUrls,
  makeUrlFromSlug,
} from "@hackney/mat-process-utils";
import {
  Button,
  Container,
  Header,
  Heading,
  HeadingLevels,
  Link,
  Main,
  Paragraph,
  Tag,
} from "lbh-frontend-react";
import NextHead from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React from "react";
import basePath from "../config/basePath";
import processShortName from "../config/processShortName";
import { repeatingStepSlugs, Slug, stepSlugs } from "../helpers/Slug";

interface BaseProps {
  title?: string;
  heading?: string;
  pausable?: boolean;
  children: React.ReactNode;
}

interface TitledProps extends BaseProps {
  title: string;
}

interface HeadedProps extends BaseProps {
  heading: string;
}

export type MainLayoutProps = TitledProps | HeadedProps;

export const MainLayout = ({
  title,
  heading,
  pausable,
  children,
}: MainLayoutProps): React.ReactElement => {
  const router = useRouter();

  const fullTitle = `${
    title || heading
  } - ${processShortName} - Manage a tenancy`;

  const { href, as } = makeNextRouterUrls(
    router,
    makeUrlFromSlug(router, Slug.Pause, basePath),
    basePath,
    stepSlugs,
    repeatingStepSlugs
  );

  const pauseButton = (
    <Button
      className="pause-button lbh-button--secondary govuk-button--secondary"
      disabled={!href.pathname || !as.pathname}
      data-testid="pause"
    >
      Pause process
    </Button>
  );

  return (
    <>
      <NextHead>
        <title>{fullTitle}</title>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Montserrat:200,300,400,500,700&display=swap"
        />
        <link rel="manifest" href={`${basePath}/manifest.webmanifest`} />
        <link rel="shortcut icon" href={`${basePath}/favicons/favicon.ico`} />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href={`${basePath}/favicons/favicon-16x16.png`}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href={`${basePath}/favicons/favicon-32x32.png`}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="48x48"
          href={`${basePath}/favicons/favicon-48x48.png`}
        />
        <link
          rel="apple-touch-icon"
          sizes="57x57"
          href={`${basePath}/favicons/apple-touch-icon-57x57.png`}
        />
        <link
          rel="apple-touch-icon"
          sizes="60x60"
          href={`${basePath}/favicons/apple-touch-icon-60x60.png`}
        />
        <link
          rel="apple-touch-icon"
          sizes="72x72"
          href={`${basePath}/favicons/apple-touch-icon-72x72.png`}
        />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href={`${basePath}/favicons/apple-touch-icon-76x76.png`}
        />
        <link
          rel="apple-touch-icon"
          sizes="114x114"
          href={`${basePath}/favicons/apple-touch-icon-114x114.png`}
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href={`${basePath}/favicons/apple-touch-icon-120x120.png`}
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href={`${basePath}/favicons/apple-touch-icon-144x144.png`}
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href={`${basePath}/favicons/apple-touch-icon-152x152.png`}
        />
        <link
          rel="apple-touch-icon"
          sizes="167x167"
          href={`${basePath}/favicons/apple-touch-icon-167x167.png`}
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={`${basePath}/favicons/apple-touch-icon-180x180.png`}
        />
        <link
          rel="apple-touch-icon"
          sizes="1024x1024"
          href={`${basePath}/favicons/apple-touch-icon-1024x1024.png`}
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          href={`${basePath}/favicons/apple-touch-startup-image-640x1136.png`}
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          href={`${basePath}/favicons/apple-touch-startup-image-750x1334.png`}
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          href={`${basePath}/favicons/apple-touch-startup-image-828x1792.png`}
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          href={`${basePath}/favicons/apple-touch-startup-image-1125x2436.png`}
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          href={`${basePath}/favicons/apple-touch-startup-image-1242x2208.png`}
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          href={`${basePath}/favicons/apple-touch-startup-image-1242x2688.png`}
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          href={`${basePath}/favicons/apple-touch-startup-image-1536x2048.png`}
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          href={`${basePath}/favicons/apple-touch-startup-image-1668x2224.png`}
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          href={`${basePath}/favicons/apple-touch-startup-image-1668x2388.png`}
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          href={`${basePath}/favicons/apple-touch-startup-image-2048x2732.png`}
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          href={`${basePath}/favicons/apple-touch-startup-image-1620x2160.png`}
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
          href={`${basePath}/favicons/apple-touch-startup-image-1136x640.png`}
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
          href={`${basePath}/favicons/apple-touch-startup-image-1334x750.png`}
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
          href={`${basePath}/favicons/apple-touch-startup-image-1792x828.png`}
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
          href={`${basePath}/favicons/apple-touch-startup-image-2436x1125.png`}
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
          href={`${basePath}/favicons/apple-touch-startup-image-2208x1242.png`}
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
          href={`${basePath}/favicons/apple-touch-startup-image-2688x1242.png`}
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
          href={`${basePath}/favicons/apple-touch-startup-image-2048x1536.png`}
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
          href={`${basePath}/favicons/apple-touch-startup-image-2224x1668.png`}
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
          href={`${basePath}/favicons/apple-touch-startup-image-2388x1668.png`}
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
          href={`${basePath}/favicons/apple-touch-startup-image-2732x2048.png`}
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
          href={`${basePath}/favicons/apple-touch-startup-image-2160x1620.png`}
        />
      </NextHead>
      <Header serviceName="Manage a tenancy"></Header>
      <Main>
        <Container>
          <div className="phase-banner">
            <Paragraph>
              <Tag>BETA</Tag> This is a new service – your{" "}
              <Link href={process.env.FEEDBACK_FORM_URL || ""} target="_blank">
                feedback
              </Link>{" "}
              will help us to improve it.
            </Paragraph>
            <hr />
          </div>
          <div className="heading">
            {pausable &&
              (href.pathname && as.pathname ? (
                <NextLink href={href} as={as}>
                  {pauseButton}
                </NextLink>
              ) : (
                pauseButton
              ))}
            {heading && <Heading level={HeadingLevels.H1}>{heading}</Heading>}
          </div>
          {children}
        </Container>
      </Main>
      <style jsx>{`
        :global(#main-content) {
          padding-top: 0;
        }

        .phase-banner {
          margin-top: 1.5em;
        }

        .phase-banner :global(.lbh-tag) {
          margin-right: 1em;
        }

        .heading :global(.pause-button) {
          float: right;
          margin-top: 0;
          margin-left: 2em;
        }
      `}</style>
    </>
  );
};
