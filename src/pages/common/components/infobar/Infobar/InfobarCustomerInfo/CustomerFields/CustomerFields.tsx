import React from 'react'

import { OBJECT_TYPES } from 'custom-fields/constants'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { useCustomFieldValues } from 'custom-fields/hooks/queries/useCustomFieldValues'

import CustomerField from './CustomerField'
import { Heading } from './Heading'

import css from './CustomerFields.less'

export default function CustomerFields({ customerId }: { customerId: number }) {
    const {
        data: definitionsData,
        isLoading: isDefinitionLoading,
        isError: isDefinitionError,
    } = useCustomFieldDefinitions({
        archived: false,
        object_type: OBJECT_TYPES.CUSTOMER,
    })

    const {
        data: valuesData,
        isLoading: isValueLoading,
        isError: isValueError,
    } = useCustomFieldValues({
        object_type: OBJECT_TYPES.CUSTOMER,
        holderId: customerId,
    })

    const isLoading = isDefinitionLoading || isValueLoading
    const isError = isDefinitionError || isValueError

    if (isLoading || isError || definitionsData?.data.length === 0) {
        return null
    }

    const customFieldDefinitions = definitionsData?.data || []
    const customFieldValues = valuesData?.data || []

    return (
        <div className={css.customerFieldsContainer}>
            <Heading />
            {customFieldDefinitions.map((field) => {
                return (
                    <CustomerField
                        key={field.id}
                        field={field}
                        value={
                            customFieldValues.find(
                                ({ field: valueField }) =>
                                    field.id === valueField.id,
                            )?.value
                        }
                        customerId={customerId}
                    />
                )
            })}
        </div>
    )
}
