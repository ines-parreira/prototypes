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
    const updateNumberFieldValueIfChanged = useTicketFieldsStore(
        (state) => state.updateNumberFieldValueIfChanged,
    )

    const { updateOrDeleteCustomerFieldValue } =
        useUpdateOrDeleteTicketFieldValue(Number(ticketId))

    const saveNumberFieldValue = useCallback(
        ({
            fieldId,
            nextValue,
        }: {
            fieldId: number
            nextValue: FieldEventHandlerParams['nextValue']
        }) => {
            const numberFieldValueChange = updateNumberFieldValueIfChanged(
                fieldId,
                getNumberOrUndefined(nextValue),
            )

            if (!numberFieldValueChange.hasChanged) {
                return
            }

            const value = numberFieldValueChange.value
            return updateOrDeleteCustomerFieldValue({ fieldId, value })
        },
        [updateNumberFieldValueIfChanged, updateOrDeleteCustomerFieldValue],
    )

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

            if (isNumberInput(field.fieldDefinition)) {
                return saveNumberFieldValue({
                    fieldId: field.fieldDefinition.id,
                    nextValue,
                })
            }

            updateFieldValue(field.fieldDefinition.id, nextValue)
            return updateOrDeleteCustomerFieldValue({
                fieldId: field.fieldDefinition.id,
                value: nextValue,
            })
        },
        [
            saveNumberFieldValue,
            updateFieldValue,
            updateOrDeleteCustomerFieldValue,
        ],
    )

    const handleBlur = useCallback(
        ({ field, nextValue }: FieldEventHandlerParams) => {
            if (isNumberInput(field.fieldDefinition)) {
                /**
                 * React Aria NumberField commits its typed value on blur, but the
                 * commit can be skipped when users paste then leave the field very
                 * quickly. Saving from blur as well keeps the DOM value from being
                 * lost, while saveNumberFieldValue dedupes normal commit+blur flows.
                 */
                return saveNumberFieldValue({
                    fieldId: field.fieldDefinition.id,
                    nextValue,
                })
            }

            if (isTextInput(field.fieldDefinition)) {
                const textValue = nextValue?.toString()?.trim()
                updateFieldValue(field.fieldDefinition.id, textValue)
                return updateOrDeleteCustomerFieldValue({
                    fieldId: field.fieldDefinition.id,
                    value: textValue,
                })
            }
        },
        [
            saveNumberFieldValue,
            updateFieldValue,
            updateOrDeleteCustomerFieldValue,
        ],
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
