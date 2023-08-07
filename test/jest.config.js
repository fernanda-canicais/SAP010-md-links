module.exports = {
    testEnvironment: "node",
    testMatch: ["<rootDir>/test/**/*.test.js"],
    transform: {
      "^.+\\.tsx?$": "ts-jest",
    },
    setupFiles: ["jest-fetch-mock"],
    testTimeout: 10000,
  };