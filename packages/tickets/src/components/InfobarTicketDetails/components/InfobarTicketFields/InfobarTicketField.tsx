import { useCallback } from 'react'

import { OverflowListItem } from '@gorgias/axiom'

import { CustomCustomerFieldInput } from '../../../InfobarCustomerFields/components/CustomCustomerFieldInput'
import { FieldRow } from '../../../InfobarCustomerFields/components/FieldRow'
import type { VisibleTicketField } from './hooks/useFilteredTicketFields'
import type {
    CustomFieldState,
    CustomFieldValue,
} from './store/useTicketFieldsStore'
import type { FieldEventHandlerParams } from './utils/constants'

import css from './InfobarTicketFields.less'

type InfobarTicketFieldProps = {
    field: VisibleTicketField
    fieldState: CustomFieldState
    onFieldChange: ({ field, nextValue }: FieldEventHandlerParams) => void
    onFieldBlur: ({ field, nextValue }: FieldEventHandlerParams) => void
}

export function InfobarTicketField({
    field,
    fieldState,
    onFieldChange,
    onFieldBlur,
}: InfobarTicketFieldProps) {
    const handleChange = useCallback(
        (nextValue: CustomFieldValue | undefined) => {
            onFieldChange({ field, nextValue })
        },
        [field, onFieldChange],
    )
    const handleBlur = useCallback(
        (nextValue: CustomFieldValue | undefined) => {
            onFieldBlur({ field, nextValue })
        },
        [field, onFieldBlur],
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
                    isInvalid={fieldState?.hasError}
                />
            </FieldRow>
        </OverflowListItem>
    )
}
