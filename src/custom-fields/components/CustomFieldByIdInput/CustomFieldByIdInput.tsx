import { useCustomFieldDefinition } from 'custom-fields/hooks/queries/useCustomFieldDefinition'
import Loader from 'pages/common/components/Loader/Loader'

import CustomFieldInput, { CustomFieldInputProps } from '../CustomFieldInput'

export type CustomFieldByIdInputProps = Omit<
    CustomFieldInputProps,
    'field' | 'id'
> & {
    customFieldId: number
    className?: string
}

/**
 * Wraps a <CustomFieldInput/> but takes a custom field ID rather than a custom field definition.
 */
function CustomFieldByIdInput({
    customFieldId,
    ...props
}: CustomFieldByIdInputProps) {
    const customField = useCustomFieldDefinition(customFieldId)

    if (customField.isLoading) {
        return <Loader className={props.className} minHeight="0" size="24px" />
    }

    if (!customField.data) {
        return <p className={props.className}>Missing custom field</p>
    }

    return (
        <CustomFieldInput
            field={customField.data}
            id={String(customFieldId)}
            {...props}
        />
    )
}

export default CustomFieldByIdInput
