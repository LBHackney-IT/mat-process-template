import * as router from "next/router";
import React from "react";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import basePath from "../../../../config/basePath";
import LoadingPage from "../../../../pages/hc/[processRef]/loading";
import { databaseSchemaVersion } from "../../../../storage/databaseSchemaVersion";
import { processStoreNames } from "../../../../storage/ProcessDatabaseSchema";
import { Storage } from "../../../../storage/Storage";
import { promiseToWaitForNextTick } from "../../../helpers/promiseToWaitForNextTick";
import { spyOnConsoleError } from "../../../helpers/spyOnConsoleError";

const originalExternalContext = Storage.ExternalContext;
const originalProcessContext = Storage.ProcessContext;

beforeEach(() => {
  sessionStorage.setItem(
    `${basePath}/test-process-ref:processApiJwt`,
    "test-process-api-jwt"
  );
  sessionStorage.setItem(
    `${basePath}/test-process-ref:matApiJwt`,
    "test-mat-api-jwt"
  );
  sessionStorage.setItem(
    `${basePath}/test-process-ref:matApiData`,
    "test-mat-api-data"
  );

  Storage.ExternalContext = {
    ...jest.fn()(),
    database: {
      ...jest.fn()(),
      put: jest.fn(),
    },
  };

  Storage.ProcessContext = {
    ...jest.fn()(),
    database: {
      ...jest.fn()(),
      db: { version: databaseSchemaVersion },
      get: (): undefined => undefined,
      put: jest.fn(),
      transaction: async (_, tx): Promise<void> => {
        await tx(
          processStoreNames.reduce(
            (stores, storeName) => ({
              ...stores,
              [storeName]: {
                ...jest.fn()(),
                put: jest.fn(),
                delete: jest.fn(),
              },
            }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            {} as any
          )
        );
      },
    },
  };

  jest.spyOn(router, "useRouter").mockImplementation(() => ({
    ...jest.fn()(),
    query: { processRef: "test-process-ref" },
  }));
});

afterEach(() => {
  sessionStorage.clear();

  Storage.ExternalContext = originalExternalContext;
  Storage.ProcessContext = originalProcessContext;
});

it("renders correctly when online", async () => {
  fetchMock.mockResponse(
    ({ method, url }): Promise<string> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let body: any = {};

      if (
        url.includes("/api/v1/processes") &&
        url.includes("/images/") &&
        method === "GET"
      ) {
        body = {
          base64Image: "data:image/jpeg;base64,someimagedata",
        };
      } else if (url.includes("/api/v1/processes") && method === "GET") {
        body = {
          processData: {
            dateCreated: new Date(2019, 1),
            dateLastModified: new Date(2019, 3),
            dataSchemaVersion: 0,
            processData: {
              property: {
                outside: {
                  images: ["image:imageid.jpeg"],
                },
              },
            },
          },
        };
      } else if (url.includes("/api/v1/tenancies") && method === "GET") {
        body = {
          results: {
            tenuretype: "Secure",
            tenancyStartDate: "2019-01-01",
          },
        };
      } else if (url.includes("/api/v1/residents") && method === "GET") {
        body = {
          results: [
            {
              fullAddressDisplay:
                "FLAT 1\r\n1 TEST STREET\r\nTEST TOWN TT1 1TT",
              responsible: true,
              fullName: "TestTenant1",
            },
            {
              fullAddressDisplay:
                "FLAT 1\r\n1 TEST STREET\r\nTEST TOWN TT1 1TT",
              responsible: true,
              fullName: "TestTenant2",
            },
            {
              fullAddressDisplay:
                "FLAT 1\r\n1 TEST STREET\r\nTEST TOWN TT1 1TT",
              responsible: false,
              fullName: "TestHouseholdMember1",
            },
            {
              fullAddressDisplay:
                "FLAT 1\r\n1 TEST STREET\r\nTEST TOWN TT1 1TT",
              responsible: false,
              fullName: "TestHouseholdMember2",
            },
          ],
        };
      }

      return Promise.resolve(JSON.stringify(body));
    }
  );

  let component: ReactTestRenderer | undefined = undefined;

  await act(async () => {
    component = create(<LoadingPage />);

    await promiseToWaitForNextTick();
  });

  expect(component).toMatchInlineSnapshot(`
    Array [
      <header
        className="lbh-header"
      >
        <div
          className="lbh-header__main"
        >
          <div
            className="govuk-container lbh-container lbh-container lbh-header__wrapper"
          >
            <div
              className="lbh-header__title"
            >
              <svg
                className="lbh-header__logo"
                focusable="false"
                height="37px"
                role="presentation"
                viewBox="0 0 208 37"
                width="208px"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>
                  Hackney logo
                </title>
                <g
                  fill="currentColor"
                  fillRule="evenodd"
                  stroke="none"
                >
                  <path
                    d="M36,15.9985404 C36,9.03922642 32.0578091,3.00529101 26.2909886,0 L26.2909886,12.0328407 L9.70901142,12.0328407 L9.70901142,0 C3.94073354,3.00529101 0,9.03922642 0,15.9985404 C0,22.9607736 3.94073354,28.9961686 9.70901142,32 L9.70901142,19.9671593 L26.2909886,19.9671593 L26.2909886,32 C32.0578091,28.9961686 36,22.959314 36,15.9985404"
                  />
                  <polyline
                    points="42 1 50.8590247 1 50.8590247 11.1301668 59.1380971 11.1301668 59.1380971 1 68 1 68 30 59.1380971 30 59.1380971 18.5708703 50.8590247 18.5708703 50.8590247 30 42 30 42 1"
                  />
                  <path
                    d="M91.0145371,16.1849059 C91.0145371,12.1530391 91.0951926,8 80.9296736,8 C75.887975,8 70.2303622,8.96793653 69.9854629,14.8548948 L77.5274802,14.8548948 C77.5700077,13.9417743 78.0612726,12.6824471 80.5615914,12.6824471 C81.8711426,12.6824471 83.2246876,13.2089699 83.2246876,14.6327454 C83.2246876,15.9728542 82.1175083,16.2974231 81.0117955,16.5008196 C76.870505,17.2725723 69,17.028785 69,23.6889384 C69,28.0756672 72.4021933,30 76.5038893,30 C79.1259245,30 81.6247768,29.4359714 83.346404,27.5145236 L83.4299923,27.5145236 C83.3874649,28.0367189 83.5121143,28.8849256 83.7159526,29.4489542 L92,29.4489542 C91.0951926,28.116058 91.0145371,26.3403056 91.0145371,24.7679496 L91.0145371,16.1849059 Z M83.2246876,21.986755 C83.1015047,24.1635303 81.6687707,25.2526392 79.8224943,25.2526392 C78.3486993,25.2526392 77.2811145,24.2832601 77.2811145,23.3167661 C77.2811145,21.9059734 78.2255164,21.4631172 80.027799,21.0606518 C81.1335119,20.8197495 82.2406912,20.5355714 83.2246876,20.053767 L83.2246876,21.986755 L83.2246876,21.986755 Z"
                  />
                  <path
                    d="M106.908596,16.4807453 C106.823548,15.6320934 106.532598,14.9465328 105.989491,14.5149905 C105.489653,14.0719019 104.780928,13.8308732 103.905092,13.8308732 C100.735971,13.8308732 100.274927,16.4865184 100.274927,19.0223709 C100.274927,21.5567802 100.735971,24.1691268 103.905092,24.1691268 C105.697048,24.1691268 106.948881,22.7604802 107.115991,21.1136915 L115,21.1136915 C114.206228,26.8074526 109.577879,30 103.737982,30 C97.2236782,30 92,25.6383914 92,19.0165978 C92,12.4020206 97.2236782,8 103.737982,8 C109.409277,8 114.249497,10.7061602 114.749335,16.4807453 L106.908596,16.4807453"
                  />
                  <polyline
                    points="115 1 123.245818 1 123.245818 15.0160369 128.483831 8.93525108 137.794201 8.93525108 130.104448 16.8806756 139 30 129.106802 30 124.7014 22.3510574 123.245818 23.8959607 123.245818 30 115 30 115 1"
                  />
                  <path
                    d="M139,8.55177515 L146.79367,8.55177515 L146.79367,11.2677515 L146.873792,11.2677515 C148.375712,9.1183432 150.528804,8 153.736591,8 C157.531453,8 161,10.3579882 161,15.285503 L161,30 L152.920805,30 L152.920805,18.7559172 C152.920805,16.2781065 152.63528,14.5414201 150.284068,14.5414201 C148.904516,14.5414201 147.077738,15.2426036 147.077738,18.6745562 L147.077738,30 L139,30 L139,8.55177515"
                    id="Fill-18"
                  />
                  <path
                    d="M185,20.7649334 C185,12.6088781 181.402905,8 173.076217,8 C166.446107,8 162,12.9305619 162,19.0338994 C162,26.0618976 167.055025,30 173.763237,30 C178.531883,30 182.938938,27.9097764 184.557414,23.411973 L177.076846,23.411973 C176.436109,24.4130877 175.020123,24.9064324 173.727078,24.9064324 C171.219092,24.9064324 169.845051,23.1811684 169.641114,20.7649334 L185,20.7649334 Z M169.684505,16.621992 C170.046095,14.3485673 171.420136,13.0906826 173.802289,13.0906826 C175.864797,13.0906826 177.318388,14.6731362 177.318388,16.621992 L169.684505,16.621992 L169.684505,16.621992 Z"
                  />
                  <path
                    d="M200.955311,28.5221077 C200.298901,30.3958684 199.56337,32.7989483 198.29304,34.3912803 C196.164103,37.0407925 192.887912,37 189.733333,37 L186.048352,37 L186.048352,30.5577263 L187.92967,30.5577263 C188.750183,30.5577263 189.813919,30.6408425 190.389744,30.3550393 C190.880586,30.1115234 191.1663,29.7032331 191.1663,28.7670818 C191.1663,27.7463561 188.054212,19.964052 187.604396,18.7406393 L184,9 L192.681319,9 L196.082051,21.1451774 L196.164103,21.1451774 L199.604396,9 L208,9 L200.955311,28.5221077"
                  />
                </g>
              </svg>
              <span
                className="lbh-header__logo-text"
              >
                Hackney
              </span>
              <span
                className="lbh-header__service-name"
              >
                Manage a tenancy
              </span>
            </div>
          </div>
        </div>
      </header>,
      <main
        className="govuk-main-wrapper lbh-main-wrapper"
        id="main-content"
        role="main"
      >
        <div
          className="govuk-container lbh-container"
        >
          <div
            className="phase-banner"
          >
            <p
              className="lbh-body"
            >
              <strong
                className="govuk-tag lbh-tag"
              >
                BETA
              </strong>
               This is a new service – your
               
              <a
                className="govuk-link lbh-link"
                href="https://feedback.form"
                target="_blank"
              >
                feedback
              </a>
               
              will help us to improve it.
            </p>
            <hr />
          </div>
          <div
            className="heading"
          >
            <h1
              className="lbh-heading-h1"
            >
              Home Check
            </h1>
          </div>
          <h2
            className="lbh-heading-h2"
          >
            Loading
          </h2>
          <p
            className="lbh-body"
          >
            The system is fetching the information you need for this process.
          </p>
          <label
            className="jsx-1951065838 govuk-label lbh-label"
          >
            Ready (updated)
            <div
              className="jsx-1951065838"
            >
              <div
                className="jsx-1951065838"
                style={
                  Object {
                    "width": "100%",
                  }
                }
              />
            </div>
          </label>
          <button
            aria-disabled={false}
            className="govuk-button lbh-button"
            data-testid="submit"
            disabled={false}
            onClick={[Function]}
          >
            Go
          </button>
        </div>
      </main>,
      <style
        jsx={true}
      >
        
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
          
      </style>,
    ]
  `);
});

it("renders correctly when offline", async () => {
  fetchMock.mockReject(new Error("Request timed out"));

  const consoleErrorSpy = spyOnConsoleError();

  let component: ReactTestRenderer | undefined = undefined;

  await act(async () => {
    component = create(<LoadingPage />);

    await promiseToWaitForNextTick();
  });

  expect(consoleErrorSpy.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        [Error: Request timed out],
      ],
      Array [
        [Error: Request timed out],
      ],
      Array [
        [Error: Request timed out],
      ],
      Array [
        [Error: Request timed out],
      ],
      Array [
        [Error: Request timed out],
      ],
      Array [
        [Error: Request timed out],
      ],
      Array [
        [Error: Request timed out],
      ],
    ]
  `);

  consoleErrorSpy.mockRestore();

  expect(component).toMatchInlineSnapshot(`
    Array [
      <header
        className="lbh-header"
      >
        <div
          className="lbh-header__main"
        >
          <div
            className="govuk-container lbh-container lbh-container lbh-header__wrapper"
          >
            <div
              className="lbh-header__title"
            >
              <svg
                className="lbh-header__logo"
                focusable="false"
                height="37px"
                role="presentation"
                viewBox="0 0 208 37"
                width="208px"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>
                  Hackney logo
                </title>
                <g
                  fill="currentColor"
                  fillRule="evenodd"
                  stroke="none"
                >
                  <path
                    d="M36,15.9985404 C36,9.03922642 32.0578091,3.00529101 26.2909886,0 L26.2909886,12.0328407 L9.70901142,12.0328407 L9.70901142,0 C3.94073354,3.00529101 0,9.03922642 0,15.9985404 C0,22.9607736 3.94073354,28.9961686 9.70901142,32 L9.70901142,19.9671593 L26.2909886,19.9671593 L26.2909886,32 C32.0578091,28.9961686 36,22.959314 36,15.9985404"
                  />
                  <polyline
                    points="42 1 50.8590247 1 50.8590247 11.1301668 59.1380971 11.1301668 59.1380971 1 68 1 68 30 59.1380971 30 59.1380971 18.5708703 50.8590247 18.5708703 50.8590247 30 42 30 42 1"
                  />
                  <path
                    d="M91.0145371,16.1849059 C91.0145371,12.1530391 91.0951926,8 80.9296736,8 C75.887975,8 70.2303622,8.96793653 69.9854629,14.8548948 L77.5274802,14.8548948 C77.5700077,13.9417743 78.0612726,12.6824471 80.5615914,12.6824471 C81.8711426,12.6824471 83.2246876,13.2089699 83.2246876,14.6327454 C83.2246876,15.9728542 82.1175083,16.2974231 81.0117955,16.5008196 C76.870505,17.2725723 69,17.028785 69,23.6889384 C69,28.0756672 72.4021933,30 76.5038893,30 C79.1259245,30 81.6247768,29.4359714 83.346404,27.5145236 L83.4299923,27.5145236 C83.3874649,28.0367189 83.5121143,28.8849256 83.7159526,29.4489542 L92,29.4489542 C91.0951926,28.116058 91.0145371,26.3403056 91.0145371,24.7679496 L91.0145371,16.1849059 Z M83.2246876,21.986755 C83.1015047,24.1635303 81.6687707,25.2526392 79.8224943,25.2526392 C78.3486993,25.2526392 77.2811145,24.2832601 77.2811145,23.3167661 C77.2811145,21.9059734 78.2255164,21.4631172 80.027799,21.0606518 C81.1335119,20.8197495 82.2406912,20.5355714 83.2246876,20.053767 L83.2246876,21.986755 L83.2246876,21.986755 Z"
                  />
                  <path
                    d="M106.908596,16.4807453 C106.823548,15.6320934 106.532598,14.9465328 105.989491,14.5149905 C105.489653,14.0719019 104.780928,13.8308732 103.905092,13.8308732 C100.735971,13.8308732 100.274927,16.4865184 100.274927,19.0223709 C100.274927,21.5567802 100.735971,24.1691268 103.905092,24.1691268 C105.697048,24.1691268 106.948881,22.7604802 107.115991,21.1136915 L115,21.1136915 C114.206228,26.8074526 109.577879,30 103.737982,30 C97.2236782,30 92,25.6383914 92,19.0165978 C92,12.4020206 97.2236782,8 103.737982,8 C109.409277,8 114.249497,10.7061602 114.749335,16.4807453 L106.908596,16.4807453"
                  />
                  <polyline
                    points="115 1 123.245818 1 123.245818 15.0160369 128.483831 8.93525108 137.794201 8.93525108 130.104448 16.8806756 139 30 129.106802 30 124.7014 22.3510574 123.245818 23.8959607 123.245818 30 115 30 115 1"
                  />
                  <path
                    d="M139,8.55177515 L146.79367,8.55177515 L146.79367,11.2677515 L146.873792,11.2677515 C148.375712,9.1183432 150.528804,8 153.736591,8 C157.531453,8 161,10.3579882 161,15.285503 L161,30 L152.920805,30 L152.920805,18.7559172 C152.920805,16.2781065 152.63528,14.5414201 150.284068,14.5414201 C148.904516,14.5414201 147.077738,15.2426036 147.077738,18.6745562 L147.077738,30 L139,30 L139,8.55177515"
                    id="Fill-18"
                  />
                  <path
                    d="M185,20.7649334 C185,12.6088781 181.402905,8 173.076217,8 C166.446107,8 162,12.9305619 162,19.0338994 C162,26.0618976 167.055025,30 173.763237,30 C178.531883,30 182.938938,27.9097764 184.557414,23.411973 L177.076846,23.411973 C176.436109,24.4130877 175.020123,24.9064324 173.727078,24.9064324 C171.219092,24.9064324 169.845051,23.1811684 169.641114,20.7649334 L185,20.7649334 Z M169.684505,16.621992 C170.046095,14.3485673 171.420136,13.0906826 173.802289,13.0906826 C175.864797,13.0906826 177.318388,14.6731362 177.318388,16.621992 L169.684505,16.621992 L169.684505,16.621992 Z"
                  />
                  <path
                    d="M200.955311,28.5221077 C200.298901,30.3958684 199.56337,32.7989483 198.29304,34.3912803 C196.164103,37.0407925 192.887912,37 189.733333,37 L186.048352,37 L186.048352,30.5577263 L187.92967,30.5577263 C188.750183,30.5577263 189.813919,30.6408425 190.389744,30.3550393 C190.880586,30.1115234 191.1663,29.7032331 191.1663,28.7670818 C191.1663,27.7463561 188.054212,19.964052 187.604396,18.7406393 L184,9 L192.681319,9 L196.082051,21.1451774 L196.164103,21.1451774 L199.604396,9 L208,9 L200.955311,28.5221077"
                  />
                </g>
              </svg>
              <span
                className="lbh-header__logo-text"
              >
                Hackney
              </span>
              <span
                className="lbh-header__service-name"
              >
                Manage a tenancy
              </span>
            </div>
          </div>
        </div>
      </header>,
      <main
        className="govuk-main-wrapper lbh-main-wrapper"
        id="main-content"
        role="main"
      >
        <div
          className="govuk-container lbh-container"
        >
          <div
            className="phase-banner"
          >
            <p
              className="lbh-body"
            >
              <strong
                className="govuk-tag lbh-tag"
              >
                BETA
              </strong>
               This is a new service – your
               
              <a
                className="govuk-link lbh-link"
                href="https://feedback.form"
                target="_blank"
              >
                feedback
              </a>
               
              will help us to improve it.
            </p>
            <hr />
          </div>
          <div
            className="heading"
          >
            <h1
              className="lbh-heading-h1"
            >
              Home Check
            </h1>
          </div>
          <span
            className="govuk-error-message lbh-error-message"
          >
            <span
              className="govuk-visually-hidden"
            >
              Error
              :
            </span>
            Something went wrong. Please try reopening this process from your worktray.
          </span>
          <h2
            className="lbh-heading-h2"
          >
            Loading
          </h2>
          <p
            className="lbh-body"
          >
            The system is fetching the information you need for this process.
          </p>
          <label
            className="jsx-1951065838 govuk-label lbh-label"
          >
            Error
            <div
              className="jsx-1951065838"
            >
              <div
                className="jsx-1951065838"
                style={
                  Object {
                    "width": "60%",
                  }
                }
              />
            </div>
          </label>
          <button
            aria-disabled={true}
            className="govuk-button lbh-button"
            data-testid="submit"
            disabled={true}
            onClick={[Function]}
          >
            Loading...
          </button>
        </div>
      </main>,
      <style
        jsx={true}
      >
        
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
          
      </style>,
    ]
  `);
});
