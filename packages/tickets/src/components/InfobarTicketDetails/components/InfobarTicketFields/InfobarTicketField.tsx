import { useCallback } from 'react'

import { OverflowListItem } from '@gorgias/axiom'

import { CustomCustomerFieldInput } from '../../../InfobarCustomerFields/components/CustomCustomerFieldInput'
import { FieldRow } from '../../../InfobarCustomerFields/components/FieldRow'
import {
    getNumberOrUndefined,
    isNumberInput,
    isTextInput,
} from '../../../InfobarCustomerFields/utils'
import type { VisibleTicketField } from './hooks/useFilteredTicketFields'
import { useUpdateOrDeleteTicketFieldValue } from './hooks/useUpdateOrDeleteTicketFieldValue'
import { useTicketFieldsStore } from './store/useTicketFieldsStore'
import type { CustomFieldValue } from './store/useTicketFieldsStore'
import { useTicketFieldStore } from './store/useTicketFieldStore'

import css from './InfobarTicketFields.less'

type InfobarTicketFieldProps = {
    field: VisibleTicketField
    ticketId: number
}

export function InfobarTicketField({
    field,
    ticketId,
}: InfobarTicketFieldProps) {
    const { fieldState } = useTicketFieldStore(field.fieldDefinition.id)
    const updateFieldValue = useTicketFieldsStore(
        (state) => state.updateFieldValue,
    )

    const { updateOrDeleteCustomerFieldValue } =
        useUpdateOrDeleteTicketFieldValue(ticketId)

    const handleChange = useCallback(
        (newValue: CustomFieldValue | undefined) => {
            /**
             * We only save text input values on the text input blur event to avoid
             * unnecessary API calls when the user is typing.
             */
            if (isTextInput(field.fieldDefinition)) {
                const textValue = newValue?.toString()
                updateFieldValue(field.fieldDefinition.id, textValue)
                return
            }

            /**
             * The Axiom NumberField component onChange event triggers when the
             * user leaves the input, we which enable us to save the change here
             */
            if (isNumberInput(field.fieldDefinition)) {
                const numberValue = getNumberOrUndefined(newValue)
                updateFieldValue(field.fieldDefinition.id, numberValue)
                return updateOrDeleteCustomerFieldValue({
                    fieldId: field.fieldDefinition.id,
                    value: numberValue,
                })
            }

            updateFieldValue(field.fieldDefinition.id, newValue)
            return updateOrDeleteCustomerFieldValue({
                fieldId: field.fieldDefinition.id,
                value: newValue,
            })
        },
        [
            field.fieldDefinition,
            updateFieldValue,
            updateOrDeleteCustomerFieldValue,
        ],
    )

    const handleBlur = useCallback(
        (newValue: CustomFieldValue | undefined) => {
            if (isTextInput(field.fieldDefinition)) {
                const textValue = newValue?.toString()?.trim()
                updateFieldValue(field.fieldDefinition.id, textValue)
                return updateOrDeleteCustomerFieldValue({
                    fieldId: field.fieldDefinition.id,
                    value: textValue,
                })
            }
        },
        [
            field.fieldDefinition,
            updateFieldValue,
            updateOrDeleteCustomerFieldValue,
        ],
    )

    return (
        <OverflowListItem className={css.overflowListItem}>
            <FieldRow
                fieldId={`ticket-field-${field.fieldDefinition.id}`}
                label={field.fieldDefinition.label}
                isRequired={field.isRequired}
            >
                <CustomCustomerFieldInput
                    id={`ticket-field-${field.fieldDefinition.id}`}
                    field={field.fieldDefinition}
                    value={fieldState?.value}
                    onChange={handleChange}
                    onBlur={handleBlur}
                />
            </FieldRow>
        </OverflowListItem>
    )
}
