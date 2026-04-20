import { useMemo } from 'react'

import type { SLAPolicyFilter } from '@gorgias/helpdesk-types'
import { ObjectType } from '@gorgias/helpdesk-types'

import { isDropdownInput } from 'custom-fields/helpers/typeGuards'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import useListTags from 'tags/useListTags'

import type { ConditionItem } from '../views/ConditionsSelect/types'
import { mapFiltersToConditions } from './mapConditionFilters'

export default function useResolveConditions(filters?: SLAPolicyFilter[]): {
    conditions: ConditionItem[]
    isLoading: boolean
} {
    const hasFilters = !!filters && filters.length > 0

    const tagsQuery = useListTags(undefined, { enabled: hasFilters })
    const tags = useMemo(
        () => tagsQuery.data?.pages?.flatMap((page) => page.data.data) ?? [],
        [tagsQuery.data],
    )

    const customFieldsQuery = useCustomFieldDefinitions(
        { archived: false, object_type: ObjectType.Ticket },
        { query: { enabled: hasFilters } },
    )
    const fields = useMemo(() => {
        const data = customFieldsQuery.data
        if (!data) return []
        return (Array.isArray(data) ? data : data.data).filter(isDropdownInput)
    }, [customFieldsQuery.data])

    const isLoading =
        hasFilters && (tagsQuery.isLoading || customFieldsQuery.isLoading)

    const conditions = useMemo(() => {
        if (!hasFilters || isLoading) return []
        return mapFiltersToConditions(filters, { tags, fields })
    }, [hasFilters, isLoading, filters, tags, fields])

    return { conditions, isLoading }
}
