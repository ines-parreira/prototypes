import { useCallback } from 'react'

import {
    getNumberOrUndefined,
    InfobarTicketFields,
    isNumberInput,
    isTextInput,
    useTicketFieldsStore,
} from '@repo/tickets'
import type { FieldEventHandlerParams } from '@repo/tickets'
import { noop } from 'lodash'

export function NewTicketPageInfobarFields() {
    const fields = useTicketFieldsStore((state) => state.fields)
    const updateFieldValue = useTicketFieldsStore(
        (state) => state.updateFieldValue,
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

            /**
             * The Axiom NumberField component onChange event triggers when the
             * user leaves the input, we which enable us to save the change here
             */
            if (isNumberInput(field.fieldDefinition)) {
                const numberValue = getNumberOrUndefined(nextValue)
                updateFieldValue(field.fieldDefinition.id, numberValue)
                return
            }

            updateFieldValue(field.fieldDefinition.id, nextValue)
        },
        [updateFieldValue],
    )

    return (
        <InfobarTicketFields
            onFieldChange={handleChange}
            onFieldBlur={noop}
            fields={fields}
        />
    )
}
