import { makeModule } from "~/utils/graphql";

export const TestModule = makeModule("test-module", {
  dirname: __dirname,
});
