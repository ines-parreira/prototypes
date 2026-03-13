---
targets:
  - '*'
---
# /generate-query-hook - SDK Query Hook Generator

Generate wrapper hooks for SDK queries following established patterns.

## Usage

```
/generate-query-hook <hook-name> [options]
```

## Arguments

- `<hook-name>` - Name of the hook to create (e.g., `useGetMacro`, `useListTeams`)

## Options

- `--service=helpdesk` - Use helpdesk SDK (default)
- `--service=knowledge` - Use knowledge-service SDK
- `--service=help-center` - Use help-center SDK
- `--service=convert` - Use convert SDK
- `--service=ecommerce-storage` - Use ecommerce-storage SDK
- `--with-transform` - Add data transformation
- `--with-options` - Add configurable query options

## Instructions

When the user runs this command:

1. **Determine SDK package** based on hook name or `--service` option:
    - Default: `@gorgias/helpdesk-queries`
    - Knowledge service: `@gorgias/knowledge-service-queries`
    - Help center: `@gorgias/help-center-queries`
    - Convert: `@gorgias/convert-queries`
    - Ecommerce storage: `@gorgias/ecommerce-storage-queries`

2. **Identify the primitive hook** to wrap:
    - `useGetXxx` wraps `useGetXxx` primitive
    - `useListXxx` wraps `useListXxx` primitive

3. **Generate the hook file**:

### Basic Query Hook Template

```typescript
import { useGetMacro as useGetMacroPrimitive } from '@gorgias/helpdesk-queries'

/**
 * Fetches a macro by ID with configured caching
 */
export function useGetMacro(macroId: number | undefined) {
    const { data, ...rest } = useGetMacroPrimitive(macroId, {
        query: {
            enabled: macroId !== undefined,
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
        },
    })

    return {
        ...rest,
        data: data?.data,
    }
}
```

### Query Hook with Transform

```typescript
import { useListMacros as useListMacrosPrimitive } from '@gorgias/helpdesk-queries'
import type { Macro } from '@gorgias/helpdesk-types'

interface TransformedMacro extends Macro {
    displayName: string
}

/**
 * Fetches macros list with display name transformation
 */
export function useListMacros(params?: { page?: number; limit?: number }) {
    const { data, ...rest } = useListMacrosPrimitive(params, {
        query: {
            staleTime: 2 * 60 * 1000, // 2 minutes
            select: (response) => ({
                ...response,
                data: response.data.map(
                    (macro): TransformedMacro => ({
                        ...macro,
                        displayName: macro.name || `Macro #${macro.id}`,
                    }),
                ),
            }),
        },
    })

    return {
        ...rest,
        data: data?.data,
        meta: data?.meta,
    }
}
```

### Query Hook with Configurable Options

```typescript
import type { UseQueryOptions } from '@tanstack/react-query'

import { useGetTeam as useGetTeamPrimitive } from '@gorgias/helpdesk-queries'
import type { GetTeamResponse } from '@gorgias/helpdesk-types'

interface UseGetTeamOptions {
    enabled?: boolean
    staleTime?: number
    onSuccess?: (data: GetTeamResponse) => void
}

/**
 * Fetches a team by ID with configurable options
 */
export function useGetTeam(
    teamId: number | undefined,
    options: UseGetTeamOptions = {},
) {
    const { enabled = true, staleTime = 5 * 60 * 1000, onSuccess } = options

    const { data, ...rest } = useGetTeamPrimitive(teamId, {
        query: {
            enabled: enabled && teamId !== undefined,
            staleTime,
            onSuccess,
        },
    })

    return {
        ...rest,
        data: data?.data,
    }
}
```

### Knowledge Service Query Hook

```typescript
import { useGetArticle as useGetArticlePrimitive } from '@gorgias/knowledge-service-queries'

/**
 * Fetches an article by ID from the knowledge service
 */
export function useGetArticle(articleId: string | undefined) {
    const { data, ...rest } = useGetArticlePrimitive(articleId, {
        query: {
            enabled: articleId !== undefined,
            staleTime: 10 * 60 * 1000, // 10 minutes
        },
    })

    return {
        ...rest,
        data: data?.data,
    }
}
```

### Key Patterns

1. **Naming**: Keep same name as primitive, import primitive with `Primitive` suffix

    ```typescript
    import { useGetXxx as useGetXxxPrimitive } from '@gorgias/helpdesk-queries'
    export function useGetXxx() { ... }
    ```

2. **Data extraction**: Extract nested data structure

    ```typescript
    return {
        ...rest,
        data: data?.data,  // Extract from { data: { data: T } }
    }
    ```

3. **Enabled condition**: Handle undefined IDs

    ```typescript
    enabled: id !== undefined
    ```

4. **Cache configuration**: Set appropriate stale/cache times

    ```typescript
    staleTime: 5 * 60 * 1000,  // How long data is "fresh"
    cacheTime: 10 * 60 * 1000, // How long to keep in cache
    ```

5. **No UI concerns**: Never include toasts, navigation, or other UI logic
