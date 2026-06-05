---
name: rest-api-sdk
description: >
  Guide for using the Gorgias REST API TypeScript SDK packages. Use when
  developers need help with: (1) understanding available SDK services and
  packages (helpdesk, help-center, convert, knowledge-service, workflows,
  ecommerce-storage), (2) using client request handlers to call API endpoints,
  (3) using React Query hooks (queries/mutations) from the queries packages, (4)
  writing tests with MSW-based mocks and fixtures from the mocks packages, (5)
  configuring the SDK client (baseURL, headers, interceptors), (6) working with
  query keys for cache invalidation, (7) understanding package naming
  conventions (e.g. @gorgias/helpdesk-client, @gorgias/helpdesk-queries), or any
  question about consuming @gorgias/* SDK packages in application code.
---
# Gorgias REST API SDK Guide

## Available Services

| Service             | Client                              | Queries                              | Mocks                              |
|---------------------|-------------------------------------|--------------------------------------|------------------------------------|
| Helpdesk            | `@gorgias/helpdesk-client`          | `@gorgias/helpdesk-queries`          | `@gorgias/helpdesk-mocks`          |
| Help Center         | `@gorgias/help-center-client`       | `@gorgias/help-center-queries`       | `@gorgias/help-center-mocks`       |
| Convert             | `@gorgias/convert-client`           | `@gorgias/convert-queries`           | `@gorgias/convert-mocks`           |
| Knowledge Service   | `@gorgias/knowledge-service-client` | `@gorgias/knowledge-service-queries` | `@gorgias/knowledge-service-mocks` |
| Workflows           | `@gorgias/workflows-client`         | `@gorgias/workflows-queries`         | `@gorgias/workflows-mocks`         |
| Ecommerce Storage   | `@gorgias/ecommerce-storage-client` | `@gorgias/ecommerce-storage-queries` | `@gorgias/ecommerce-storage-mocks` |

Each service also has `-spec`, `-types`, and `-validators` packages (typically internal/build-time).

## Package Types & Naming

Given an operation `operationId: getTicket` on a schema `Ticket`:

| Package        | What                   | Naming                                     | Example                  | Depends on |
|----------------|------------------------|--------------------------------------------|--------------------------|------------|
| `-client`      | Request handlers       | `camelCase(operationId)`                   | `getTicket()`            | `-types`   |
| `-queries`     | React Query read hooks | `use + PascalCase(operationId)`            | `useGetTicket()`         | `-client`  |
| `-queries`     | React Query mutations  | `use + PascalCase(operationId)`            | `useCreateTicket()`      | `-client`  |
| `-mocks`       | Fixture generators     | `mock + PascalCase(schemaName)`            | `mockTicket()`           | `-spec`    |
| `-mocks`       | MSW request handlers   | `mock + PascalCase(operationId) + Handler` | `mockGetTicketHandler()` | `-spec`    |
| `-types`       | TypeScript types       | `PascalCase(schemaName)`                   | `Ticket`                 | `-spec`    |
| `-validators`  | AJV validators         | —                                          | —                        | `-spec`    |
| `-spec`        | OpenAPI spec           | —                                          | —                        | —          |

## Quick Start

```tsx
// 1. Configure the client (once, at app init)
import { setDefaultConfig } from '@gorgias/helpdesk-client'
setDefaultConfig({ baseURL: 'https://api.gorgias.com' })

// 2. Use a handler directly
import { getTicket } from '@gorgias/helpdesk-client'
const response = await getTicket(ticketId)
const ticket = response.data // fully typed

// 3. Or use React Query hooks
import { useGetTicket } from '@gorgias/helpdesk-queries'
const { data, isLoading, error } = useGetTicket(ticketId)

// 4. Test with mocks
import { mockGetTicketHandler } from '@gorgias/helpdesk-mocks'
const getTicketMock = mockGetTicketHandler()
server.use(getTicketMock.handler)
```

## OpenAPI Spec Files

To look up available operations, schemas, parameters, or response types for a service, read its spec file:

| Service             | Spec Path                                          |
|---------------------|----------------------------------------------------|
| Helpdesk            | `packages/helpdesk/spec/src/spec-doc.yml`          |
| Help Center         | `packages/help-center/spec/src/spec-doc.yml`       |
| Convert             | `packages/convert/spec/src/spec-doc.yml`           |
| Knowledge Service   | `packages/knowledge-service/spec/src/spec-doc.yml` |
| Workflows           | `packages/workflows/spec/src/spec-doc.yml`         |
| Ecommerce Storage   | `packages/ecommerce-storage/spec/src/spec-doc.yml` |
| Gorgias Chat        | `packages/gorgias-chat/spec/src/spec-doc.yml`      |

These are OpenAPI 3.0 YAML files. Use them to find `operationId`s (which map to handler/hook/mock names), request/response schemas, path parameters, and query parameters.

## Detailed Guides

Load the appropriate reference based on the developer's need:

- **Client usage** (handlers, HTTP options, configuration, interceptors): Read [references/client.md](references/client.md)
- **React Query hooks** (read queries, mutations, query keys, cache invalidation, options): Read [references/queries.md](references/queries.md)
- **Testing with mocks** (fixtures, MSW handlers, overriding responses, error paths, request assertions): Read [references/mocks.md](references/mocks.md)
