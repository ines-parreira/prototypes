import { useListMetafieldDefinitions } from '@gorgias/helpdesk-queries'
import type { MetafieldDefinition } from '@gorgias/helpdesk-queries'

import type { Field } from '../MetafieldsTable/types'
import type { SupportedCategories } from '../types'

type UseMetafieldDefinitionsOptions = {
    integrationId: number
    pinned: boolean
}

export function transformMetafieldDefinitionToField(
    definition: MetafieldDefinition,
): Field {
    return {
        id: definition.id,
        key: definition.key,
        name: definition.name,
        type: definition.type as Field['type'],
        category: definition.ownerType as SupportedCategories,
        isVisible: definition.isVisible,
    }
}

export function useMetafieldDefinitions({
    integrationId,
    pinned,
}: UseMetafieldDefinitionsOptions) {
    const queryResult = useListMetafieldDefinitions(
        integrationId,
        { pinned },
        {
            query: {
                select: (response) =>
                    (response?.data?.data || []).map((definition) =>
                        transformMetafieldDefinitionToField(definition),
                    ),
            },
        },
    )

    return {
        data: queryResult.data ?? [],
        isLoading: queryResult.isLoading,
        isError: queryResult.isError,
        error: queryResult.error,
    }
}
