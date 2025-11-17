import { useCustomFieldDefinition } from 'custom-fields/hooks/queries/useCustomFieldDefinition'
import type { CustomField } from 'custom-fields/types'

export const CustomFieldName = ({
    customFieldId,
}: {
    customFieldId: CustomField['id']
}) => {
    const { data, isLoading } = useCustomFieldDefinition(customFieldId)
    if (isLoading) return null

    return (
        <span>
            {data?.deactivated_datetime ? <strong>Archived </strong> : ''}
            Field {data?.label}
        </span>
    )
}
