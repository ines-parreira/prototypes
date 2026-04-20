import { useCallback, useMemo } from 'react'

import { ObjectType } from '@gorgias/helpdesk-types'

import { buildTreeOfChoices } from 'custom-fields/components/MultiLevelSelect/helpers/buildTreeOfChoices'
import type { ChoicesTree } from 'custom-fields/components/MultiLevelSelect/types'
import { isDropdownInput } from 'custom-fields/helpers/typeGuards'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import type {
    CustomField,
    CustomFieldInputSettingsDropdown,
    CustomFieldValue,
} from 'custom-fields/types'
import useListTags from 'tags/useListTags'

export default function useConditionsData(searchQuery: string) {
    const tagsQuery = useListTags(
        searchQuery ? { search: searchQuery } : undefined,
    )

    const tags = useMemo(
        () => tagsQuery.data?.pages?.flatMap((page) => page.data.data) ?? [],
        [tagsQuery.data],
    )

    const customFieldsQuery = useCustomFieldDefinitions({
        archived: false,
        object_type: ObjectType.Ticket,
    })

    const dropdownFields = useMemo(() => {
        const data = customFieldsQuery.data
        if (!data) return []
        const fields = (Array.isArray(data) ? data : data.data) as CustomField[]
        return fields.filter(isDropdownInput).map((field) => {
            if (field.definition.data_type === 'boolean') {
                return {
                    ...field,
                    definition: {
                        ...field.definition,
                        input_settings: {
                            ...field.definition.input_settings,
                            choices: ['Yes', 'No'] as CustomFieldValue[],
                        },
                    },
                } as CustomField
            }
            return field
        })
    }, [customFieldsQuery.data])

    const getFieldChoices = useCallback(
        (fieldId: number): string[] => {
            const field = dropdownFields.find((f) => f.id === fieldId)
            if (!field) return []
            return (
                (
                    field.definition
                        .input_settings as CustomFieldInputSettingsDropdown
                ).choices?.filter((c): c is string => typeof c === 'string') ??
                []
            )
        },
        [dropdownFields],
    )

    const getFieldTree = useCallback(
        (fieldId: number): ChoicesTree => {
            const choices = getFieldChoices(fieldId)
            return buildTreeOfChoices(choices)
        },
        [getFieldChoices],
    )

    return {
        tags,
        isLoadingTags: tagsQuery.isFetching && !tagsQuery.isFetchingNextPage,
        onLoadMoreTags: tagsQuery.fetchNextPage,
        shouldLoadMoreTags:
            (tagsQuery.hasNextPage && !tagsQuery.isFetchingNextPage) ?? false,
        dropdownFields,
        isLoadingFields: customFieldsQuery.isLoading,
        getFieldChoices,
        getFieldTree,
    }
}
