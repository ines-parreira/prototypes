import { useMemo } from 'react'

import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'

export const useGetCustomFieldById = (
    customFieldId?: number | string | null,
) => {
    const customFields = useCustomFieldDefinitions(
        {
            archived: false,
            object_type: 'Ticket',
        },
        {
            query: {
                enabled: !!customFieldId,
            },
        },
    )

    const activeCustomFields = useMemo(
        () =>
            customFields.data?.data.filter(
                (field) => !field.deactivated_datetime,
            ) || [],
        [customFields.data?.data],
    )

    if (!customFieldId) {
        return null
    }

    return activeCustomFields.find(
        (field) => field.id === Number(customFieldId),
    )
}
