import * as router from "next/router";

require("jest-fetch-mock").enableMocks();

process.env.WORKTRAY_URL = "https://work.tray";
process.env.DIVERSITY_FORM_URL = "https://diversity.form";
process.env.FEEDBACK_FORM_URL = "https://feedback.form";

beforeAll(() => {
  // Run as if on the client.
  global.window = global.window || ({} as typeof global.window);
});

beforeEach(() => {
  jest.spyOn(router, "useRouter").mockImplementation(() => ({
    ...jest.fn()(),
    query: { processRef: "test-process-ref" },
  }));
});
