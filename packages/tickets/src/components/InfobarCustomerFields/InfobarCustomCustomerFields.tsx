import { OverflowListItem } from '@gorgias/axiom'
import type { TicketCustomer } from '@gorgias/helpdesk-types'
import { ObjectType } from '@gorgias/helpdesk-types'

import { useCustomFieldDefinitions } from '../../hooks/useCustomFieldDefinitions'
import { CustomCustomerField } from './components/CustomCustomerField'
import { useCustomerCustomFieldValues } from './hooks'
import type { CustomFieldValue } from './types'

import css from './InfobarCustomerFields.less'

interface InfobarCustomCustomerFieldsProps {
    customer: TicketCustomer
}

export function InfobarCustomCustomerFields({
    customer,
}: InfobarCustomCustomerFieldsProps) {
    const {
        data: definitionsData,
        isLoading: isDefinitionLoading,
        isError: isDefinitionError,
    } = useCustomFieldDefinitions({
        archived: false,
        object_type: ObjectType.Customer,
    })

    const {
        data: valuesData,
        isLoading: isValuesLoading,
        isError: isValueError,
    } = useCustomerCustomFieldValues(customer.id)

    const isLoading = isDefinitionLoading || isValuesLoading
    const isError = isDefinitionError || isValueError

    const customFieldDefinitions = definitionsData?.data || []
    const customFieldValues = valuesData?.data || []

    if (isLoading || isError || customFieldDefinitions.length === 0) {
        return null
    }

    return (
        <>
            {customFieldDefinitions.map((field) => (
                <OverflowListItem
                    key={field.id}
                    className={css.overflowListItem}
                >
                    <CustomCustomerField
                        field={field}
                        value={
                            customFieldValues.find(
                                ({ field: valueField }) =>
                                    field.id === valueField.id,
                            )?.value as CustomFieldValue
                        }
                        customerId={customer.id}
                    />
                </OverflowListItem>
            ))}
        </>
    )
}
