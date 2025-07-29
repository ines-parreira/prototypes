import { useCallback, useMemo } from 'react'

import { useCustomFieldDefinition } from 'custom-fields/hooks/queries/useCustomFieldDefinition'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import useAppDispatch from 'hooks/useAppDispatch'
import { updateCustomFieldFilterId } from 'state/views/actions'
import { Schemas } from 'types'

import {
    getCustomFieldIdFromObjectPath,
    getDefaultCustomFieldOperator,
} from '../utils'

type Props = {
    objectPath: string
    index: number
    schemas: Schemas
}

export default function useCustomFieldsFilters({
    objectPath,
    index,
    schemas,
}: Props) {
    const dispatch = useAppDispatch()

    const customFieldId = useMemo(
        () => getCustomFieldIdFromObjectPath(objectPath),
        [objectPath],
    )

    const { data: customField } = useCustomFieldDefinition(
        // @ts-ignore - customFieldId can be null - but the query is disabled in that case
        customFieldId,
        {
            query: {
                enabled: customFieldId !== null,
            },
        },
    )

    const customFields = useCustomFieldDefinitions({
        archived: false,
        object_type: 'Ticket',
    })

    const activeCustomFields = useMemo(() => {
        return (
            customFields.data?.data.filter(
                (field) => !field.deactivated_datetime,
            ) || []
        )
    }, [customFields.data?.data])

    const onCustomFieldChange = useCallback(
        (customFieldId: number) => {
            const newCustomField = activeCustomFields.find(
                (field) => field.id === customFieldId,
            )
            const newDefaultOperator = getDefaultCustomFieldOperator(
                schemas,
                newCustomField,
            )
            dispatch(
                updateCustomFieldFilterId(
                    index,
                    customFieldId,
                    newDefaultOperator,
                ),
            )
        },
        [activeCustomFields, index, schemas, dispatch],
    )

    return useMemo(
        () => ({
            customField,
            activeCustomFields,
            onCustomFieldChange,
        }),
        [activeCustomFields, customField, onCustomFieldChange],
    )
}
