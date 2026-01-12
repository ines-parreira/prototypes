import { useCallback } from 'react'

import { Skeleton } from '@gorgias/axiom'

import {
    getNumberOrUndefined,
    isNumberInput,
    isTextInput,
} from '../../InfobarCustomerFields/utils'
import { useUpdateOrDeleteTicketFieldValue } from './InfobarTicketFields/hooks/useUpdateOrDeleteTicketFieldValue'
import { InfobarTicketFields } from './InfobarTicketFields/InfobarTicketFields'
import { useInitializeTicketFieldsStore } from './InfobarTicketFields/store/useInitializeTicketFieldsStore'
import { useTicketFieldsStore } from './InfobarTicketFields/store/useTicketFieldsStore'
import type { FieldEventHandlerParams } from './InfobarTicketFields/utils/constants'

type TicketInfobarTicketFieldsProps = {
    ticketId: string
}

export function TicketInfobarTicketFields({
    ticketId,
}: TicketInfobarTicketFieldsProps) {
    const { isLoading: isLoadingFieldsStore } =
        useInitializeTicketFieldsStore(ticketId)
    const fields = useTicketFieldsStore((state) => state.fields)

    const updateFieldValue = useTicketFieldsStore(
        (state) => state.updateFieldValue,
    )

    const { updateOrDeleteCustomerFieldValue } =
        useUpdateOrDeleteTicketFieldValue(Number(ticketId))

    const handleChange = useCallback(
        ({ field, nextValue }: FieldEventHandlerParams) => {
            /**
             * We only save text input values on the text input blur event to avoid
             * unnecessary API calls when the user is typing.
             */
            if (isTextInput(field.fieldDefinition)) {
                const textValue = nextValue?.toString()
                updateFieldValue(field.fieldDefinition.id, textValue)
                return
            }

            /**
             * The Axiom NumberField component onChange event triggers when the
             * user leaves the input, we which enable us to save the change here
             */
            if (isNumberInput(field.fieldDefinition)) {
                const numberValue = getNumberOrUndefined(nextValue)
                updateFieldValue(field.fieldDefinition.id, numberValue)
                return updateOrDeleteCustomerFieldValue({
                    fieldId: field.fieldDefinition.id,
                    value: numberValue,
                })
            }

            updateFieldValue(field.fieldDefinition.id, nextValue)
            return updateOrDeleteCustomerFieldValue({
                fieldId: field.fieldDefinition.id,
                value: nextValue,
            })
        },
        [updateFieldValue, updateOrDeleteCustomerFieldValue],
    )

    const handleBlur = useCallback(
        ({ field, nextValue }: FieldEventHandlerParams) => {
            if (isTextInput(field.fieldDefinition)) {
                const textValue = nextValue?.toString()?.trim()
                updateFieldValue(field.fieldDefinition.id, textValue)
                return updateOrDeleteCustomerFieldValue({
                    fieldId: field.fieldDefinition.id,
                    value: textValue,
                })
            }
        },
        [updateFieldValue, updateOrDeleteCustomerFieldValue],
    )

    if (isLoadingFieldsStore) {
        return <Skeleton count={3} />
    }

    return (
        <InfobarTicketFields
            key={`ticket-fields-form-${ticketId}`}
            onFieldChange={handleChange}
            onFieldBlur={handleBlur}
            fields={fields}
        />
    )
}
