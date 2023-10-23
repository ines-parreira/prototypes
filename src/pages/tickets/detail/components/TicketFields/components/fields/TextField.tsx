import React, {useCallback, useState} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import {CustomFieldState} from 'models/customField/types'
import {
    updateCustomFieldError,
    updateCustomFieldState,
    updateCustomFieldValue,
} from 'state/ticket/actions'

import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import useAppSelector from 'hooks/useAppSelector'
import {useUpdateOrDeleteTicketFieldValue} from 'hooks/customField/useUpdateOrDeleteTicketFieldValue'
import {getTicket} from 'state/ticket/selectors'
import Tooltip from 'pages/common/components/Tooltip'
import StealthInput from '../StealthInput'
import Label from '../Label'

type Props = {
    id: CustomFieldState['id']
    label: string
    fieldState?: CustomFieldState
    placeholder?: string
    isRequired?: boolean
    isLarge?: boolean
}

export default function TextField({
    id,
    label,
    fieldState,
    placeholder,
    isRequired,
    isLarge = false,
}: Props) {
    const dispatch = useAppDispatch()

    const ticketId = useAppSelector(getTicket).id
    const initialValue = fieldState?.value?.toString() || ''
    const hasError = fieldState?.hasError

    const [currentValue, setCurrentValue] = useState(initialValue)
    const [isActive, setActive] = useState(false)

    // Update the value when the initial value changes
    const [previousValue, setPreviousValue] = useState(initialValue)
    if (initialValue !== previousValue) {
        setPreviousValue(initialValue)
        setCurrentValue(initialValue)
    }

    const handleChange = useCallback(
        (newValue: string) => {
            if (hasError && newValue !== '') {
                dispatch(updateCustomFieldError(id, false))
            }
            setCurrentValue(newValue)
        },
        [dispatch, id, hasError]
    )

    const onError = useCallback(() => {
        setCurrentValue(initialValue)
        dispatch(
            updateCustomFieldState({
                id,
                hasError: Boolean(isRequired && !initialValue),
                value: initialValue,
            })
        )
    }, [initialValue, dispatch, id, isRequired])
    // Only on blur
    const {mutate} = useUpdateOrDeleteTicketFieldValue(
        {onError},
        {isDisabled: !ticketId}
    )

    const inputId = `ticket-${ticketId}-custom-field-value-input-${id}`

    return (
        <Label label={label} isRequired={isRequired}>
            {!!currentValue && !isActive && (
                <Tooltip placement="left" target={inputId} autohide={false}>
                    {currentValue}
                </Tooltip>
            )}
            <StealthInput
                id={inputId}
                name={label}
                type="text"
                value={currentValue}
                placeholder={placeholder}
                onChange={handleChange}
                hasError={hasError}
                onFocus={() => {
                    setActive(true)
                    logEvent(SegmentEvent.CustomFieldTicketValueInputFocused, {
                        ticketId,
                        id,
                        label,
                    })
                }}
                isLarge={isLarge}
                onBlur={() => {
                    setActive(false)
                    const trimmedCurrentValue = currentValue.trim()
                    setCurrentValue(trimmedCurrentValue)
                    dispatch(updateCustomFieldValue(id, trimmedCurrentValue))
                    if (trimmedCurrentValue !== initialValue) {
                        mutate([
                            {
                                fieldType: 'Ticket',
                                holderId: ticketId,
                                fieldId: id,
                                value: trimmedCurrentValue,
                            },
                        ])
                    }
                }}
            />
        </Label>
    )
}
