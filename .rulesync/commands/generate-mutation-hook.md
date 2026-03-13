---
targets:
  - '*'
---
# /generate-mutation-hook - SDK Mutation Hook Generator

Generate mutation hooks with cache management following established patterns.

## Usage

```
/generate-mutation-hook <hook-name> [options]
```

## Arguments

- `<hook-name>` - Name of the mutation hook (e.g., `useDeleteMacro`, `useUpdateTeam`)

## Options

- `--service=helpdesk` - Use helpdesk SDK (default)
- `--service=knowledge` - Use knowledge-service SDK
- `--service=help-center` - Use help-center SDK
- `--service=convert` - Use convert SDK
- `--service=ecommerce-storage` - Use ecommerce-storage SDK
- `--with-optimistic-update` - Include optimistic update logic
- `--list-query=<queryKey>` - Specify the list query to invalidate

## Instructions

When the user runs this command:

1. **Determine mutation type** from hook name:
    - `useDelete*` - Delete mutation
    - `useUpdate*` - Update mutation
    - `useCreate*` - Create mutation

2. **Determine SDK package** based on `--service` option:
    - Default: `@gorgias/helpdesk-queries`
    - Knowledge service: `@gorgias/knowledge-service-queries`
    - Help center: `@gorgias/help-center-queries`
    - Convert: `@gorgias/convert-queries`
    - Ecommerce storage: `@gorgias/ecommerce-storage-queries`

3. **Generate the mutation hook file**:

### Basic Delete Mutation

```typescript
import { useQueryClient } from '@tanstack/react-query'

import {
    queryKeys,
    useDeleteMacro as useDeleteMacroPrimitive,
} from '@gorgias/helpdesk-queries'

/**
 * Deletes a macro and invalidates related caches
 */
export function useDeleteMacro() {
    const queryClient = useQueryClient()

    return useDeleteMacroPrimitive({
        mutation: {
            onSettled: () => {
                void queryClient.invalidateQueries({
                    queryKey: queryKeys.macros.listMacros(),
                })
            },
        },
    })
}
```

### Update Mutation with Cache Invalidation

```typescript
import { useQueryClient } from '@tanstack/react-query'

import {
    queryKeys,
    useUpdateTeam as useUpdateTeamPrimitive,
} from '@gorgias/helpdesk-queries'

/**
 * Updates a team and invalidates related caches
 */
export function useUpdateTeam() {
    const queryClient = useQueryClient()

    return useUpdateTeamPrimitive({
        mutation: {
            onSettled: (_data, _error, variables) => {
                // Invalidate both list and detail queries
                void queryClient.invalidateQueries({
                    queryKey: queryKeys.teams.listTeams(),
                })
                void queryClient.invalidateQueries({
                    queryKey: queryKeys.teams.getTeam(variables.id),
                })
            },
        },
    })
}
```

### Delete Mutation with Optimistic Update

```typescript
import { useQueryClient } from '@tanstack/react-query'

import {
    queryKeys,
    useDeleteMacro as useDeleteMacroPrimitive,
} from '@gorgias/helpdesk-queries'
import type { ListMacrosResponse } from '@gorgias/helpdesk-types'

/**
 * Deletes a macro with optimistic cache update
 */
export function useDeleteMacro() {
    const queryClient = useQueryClient()
    const listQueryKey = queryKeys.macros.listMacros()

    return useDeleteMacroPrimitive({
        mutation: {
            onMutate: async (variables) => {
                // Cancel outgoing refetches
                await queryClient.cancelQueries({ queryKey: listQueryKey })

                // Snapshot previous value
                const previousMacros =
                    queryClient.getQueryData<ListMacrosResponse>(listQueryKey)

                // Optimistically remove from list
                if (previousMacros) {
                    queryClient.setQueryData<ListMacrosResponse>(listQueryKey, {
                        ...previousMacros,
                        data: previousMacros.data.filter(
                            (macro) => macro.id !== variables.id,
                        ),
                    })
                }

                return { previousMacros }
            },
            onError: (_error, _variables, context) => {
                // Rollback on error
                if (context?.previousMacros) {
                    queryClient.setQueryData(
                        listQueryKey,
                        context.previousMacros,
                    )
                }
            },
            onSettled: async () => {
                // Always refetch to ensure consistency
                await queryClient.invalidateQueries({ queryKey: listQueryKey })
            },
        },
    })
}
```

### Create Mutation with Optimistic Update

```typescript
import { useQueryClient } from '@tanstack/react-query'

import {
    queryKeys,
    useCreateMacro as useCreateMacroPrimitive,
} from '@gorgias/helpdesk-queries'
import type { ListMacrosResponse, Macro } from '@gorgias/helpdesk-types'

/**
 * Creates a macro with optimistic cache update
 */
export function useCreateMacro() {
    const queryClient = useQueryClient()
    const listQueryKey = queryKeys.macros.listMacros()

    return useCreateMacroPrimitive({
        mutation: {
            onMutate: async (variables) => {
                await queryClient.cancelQueries({ queryKey: listQueryKey })

                const previousMacros =
                    queryClient.getQueryData<ListMacrosResponse>(listQueryKey)

                // Optimistically add with temporary ID
                if (previousMacros) {
                    const optimisticMacro: Macro = {
                        id: Date.now(), // Temporary ID
                        ...variables,
                        created_datetime: new Date().toISOString(),
                        updated_datetime: new Date().toISOString(),
                    }

                    queryClient.setQueryData<ListMacrosResponse>(listQueryKey, {
                        ...previousMacros,
                        data: [...previousMacros.data, optimisticMacro],
                    })
                }

                return { previousMacros }
            },
            onError: (_error, _variables, context) => {
                if (context?.previousMacros) {
                    queryClient.setQueryData(
                        listQueryKey,
                        context.previousMacros,
                    )
                }
            },
            onSettled: async () => {
                await queryClient.invalidateQueries({ queryKey: listQueryKey })
            },
        },
    })
}
```

### Knowledge Service Mutation

```typescript
import { useQueryClient } from '@tanstack/react-query'

import {
    queryKeys,
    useUpsertFeedback as useUpsertFeedbackPrimitive,
} from '@gorgias/knowledge-service-queries'

/**
 * Upserts feedback with cache invalidation
 */
export function useUpsertFeedback() {
    const queryClient = useQueryClient()

    return useUpsertFeedbackPrimitive({
        mutation: {
            onSettled: async (_data, _error, variables) => {
                await queryClient.invalidateQueries({
                    queryKey: queryKeys.feedback.getFeedback(
                        variables.articleId,
                    ),
                })
            },
        },
    })
}
```

### Key Patterns

1. **Naming**: Import primitive with `Primitive` suffix

    ```typescript
    import { useDeleteXxx as useDeleteXxxPrimitive } from '@gorgias/helpdesk-queries'
    ```

2. **Query keys**: Always use `queryKeys` from SDK

    ```typescript
    queryKeys.macros.listMacros()
    queryKeys.macros.getMacro(id)
    ```

3. **Optimistic updates**: Follow the pattern
    - `onMutate`: Cancel queries, snapshot, update optimistically
    - `onError`: Rollback to snapshot
    - `onSettled`: Invalidate to refetch

4. **No UI concerns**: Never include:
    - `dispatch(notify(...))` - Handle in component
    - `history.push(...)` - Handle in component
    - Toast messages - Handle in component

5. **Type safety**: Import types from SDK types package

    ```typescript
    import type { ListMacrosResponse, Macro } from '@gorgias/helpdesk-types'
    ```

6. **Suggest file location**:
    - Domain-specific: `src/[domain]/queries/useDeleteXxx.ts`
    - Grouped: `src/[domain]/queries/mutations.ts`
