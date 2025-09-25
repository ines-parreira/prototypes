import { OBJECT_TYPES } from 'custom-fields/constants'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { CustomFieldValue } from 'custom-fields/types'

import CustomerField from './CustomerField'
import { Heading } from './Heading'

type CustomerFieldsProps = {
    customerId: number
    values: Array<{ id: number; value: CustomFieldValue }>
}

export default function CustomerFields({
    customerId,
    values,
}: CustomerFieldsProps) {
    const {
        data: definitionsData,
        isLoading: isDefinitionLoading,
        isError: isDefinitionError,
    } = useCustomFieldDefinitions({
        archived: false,
        object_type: OBJECT_TYPES.CUSTOMER,
    })

    const isLoading = isDefinitionLoading
    const isError = isDefinitionError

    if (isLoading || isError || definitionsData?.data.length === 0) {
        return null
    }

    const customFieldDefinitions = definitionsData?.data || []

    return (
        <>
            <Heading />
            {customFieldDefinitions.map((field) => {
                return (
                    <CustomerField
                        key={field.id}
                        field={field}
                        value={values.find((v) => field.id === v.id)?.value}
                        customerId={customerId}
                    />
                )
            })}
        </>
    )
}
