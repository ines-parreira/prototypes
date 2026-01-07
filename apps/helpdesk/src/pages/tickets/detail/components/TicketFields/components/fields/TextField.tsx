import { useCallback, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import Label from 'custom-fields/components/Label'
import StealthInput from 'custom-fields/components/StealthInput'
import { useUpdateOrDeleteTicketFieldValue } from 'custom-fields/hooks/queries/useUpdateOrDeleteTicketFieldValue'
import type { CustomFieldState } from 'custom-fields/types'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    updateCustomFieldError,
    updateCustomFieldState,
    updateCustomFieldValue,
} from 'state/ticket/actions'
import { getTicket } from 'state/ticket/selectors'

import css from './Field.less'

type Props = {
    id: number
    label: string
    fieldState?: CustomFieldState
    placeholder?: string | null
    isRequired?: boolean
    isDisabled?: boolean
}

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<TextField />` from @gorgias/axiom instead.
 * @date 2026-01-06
 * @type ui-kit-migration
 */
export default function TextField({
    id,
    label,
    fieldState,
    placeholder,
    isRequired,
    isDisabled = false,
}: Props) {
    const dispatch = useAppDispatch()

    const ticketId = useAppSelector(getTicket).id
    const stateValue = fieldState?.value?.toString() || ''
    const hasError = fieldState?.hasError

    const [currentValue, setCurrentValue] = useState(stateValue)
    const [isActive, setActive] = useState(false)

    const handleChange = useCallback(
        (newValue: string) => {
            if (hasError && newValue !== '') {
                dispatch(updateCustomFieldError(id, false))
            }
            setCurrentValue(newValue)
        },
        [dispatch, id, hasError],
    )

    // Update the value when the state value changes
    const [previousStateValue, setPreviousStateValue] = useState(stateValue)
    if (stateValue !== previousStateValue) {
        setPreviousStateValue(stateValue)
        handleChange(stateValue)
    }

    const onError = useCallback(() => {
        setCurrentValue(stateValue)
        dispatch(
            updateCustomFieldState({
                id,
                hasError: Boolean(isRequired && !stateValue),
                value: stateValue,
            }),
        )
    }, [stateValue, dispatch, id, isRequired])
    // Only on blur
    const { mutate } = useUpdateOrDeleteTicketFieldValue(
        { onError },
        { isDisabled: !ticketId },
    )

    const inputId = `ticket-${ticketId}-custom-field-value-input-${id}`

    return (
        <Label label={label} isRequired={isRequired}>
            {!!currentValue && !isActive && (
                <Tooltip placement="left" target={inputId} autohide={false}>
                    {currentValue}
                </Tooltip>
            )}
            <div className={css.wrapper}>
                <StealthInput
                    id={inputId}
                    name={label}
                    type="text"
                    value={currentValue}
                    placeholder={placeholder || undefined}
                    onChange={handleChange}
                    hasError={hasError}
                    isDisabled={isDisabled}
                    onFocus={() => {
                        setActive(true)
                        logEvent(
                            SegmentEvent.CustomFieldTicketValueInputFocused,
                            {
                                ticketId,
                                id,
                                label,
                            },
                        )
                    }}
                    onBlur={() => {
                        setActive(false)
                        const trimmedCurrentValue = currentValue.trim()
                        setCurrentValue(trimmedCurrentValue)
                        dispatch(
                            updateCustomFieldValue(id, trimmedCurrentValue),
                        )
                        if (trimmedCurrentValue !== stateValue) {
                            mutate({
                                ticketId,
                                fieldId: id,
                                value: trimmedCurrentValue,
                            })
                        }
                    }}
                />
            </div>
        </Label>
    )
}
