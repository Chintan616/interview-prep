export default {
  "interview-prep": {
    input: {
      target: "./openapi.yaml",
    },
    output: {
      mode: "single",
      target: "./src/generated/hooks.js",
      schemas: "./src/generated/schemas.js",
      client: "react-query",
      httpClient: "axios",
      override: {
        mutator: {
          path: "./src/axios-instance.js",
          name: "axiosInstance",
        },
        query: {
          useQuery: true,
          useMutation: true,
        },
      },
    },
  },
};
