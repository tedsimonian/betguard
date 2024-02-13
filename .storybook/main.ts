import type { StorybookConfig } from "@storybook/nextjs";

import { env as t3Env } from "../env.mjs";

const config: StorybookConfig = {
  stories: ["../src/components/**/*.stories.mdx", "../src/components/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials", "@storybook/addon-interactions"],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  typescript: {
    check: false,
    checkOptions: {},
    reactDocgen: false,
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  // other Storybook config...
  env: (config1) => ({
    ...config1,
    ...t3Env,
  }),
};

export default config;
