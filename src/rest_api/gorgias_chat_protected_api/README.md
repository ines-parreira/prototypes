# Gorgias Chat REST API

The Gorgias Chat API, doesn't have an OpenAPI spec at the moment, so we are using the package `postman-to-openapi` to generate a generic one base on the Chat API's Postman collection. Then, we generate Typescript definitions using the `typegen` CLI command from `openapi-client-axios`. With the OpenAPI spec and the types, we can create a client for the chat API, also using `openapi-client-axios`.

### How to use

-   Update the content of `gorgias-chat-protected-api.postman_collection.json` with the definitions from https://github.com/gorgias/gorgias-chat/blob/main/packages/api/postman/gorgias-chat-api.postman_collection.json
    -   IMPORTANT: Add/Update only the Postman definitions for the endpoints you need, discard the rest so we avoid having dead code/types
-   Run `yarn gorgiaschat:update-client`

This will update the types and definitions in `client.generated.d.ts`, so the API client will be updated

### Resources

-   https://www.npmjs.com/package/openapi-client-axios
-   https://joolfe.github.io/postman-to-openapi/
