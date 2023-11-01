import React, {useCallback, useState} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import {CustomFieldState} from 'models/customField/types'
import {
    updateCustomFieldError,
    updateCustomFieldState,
    updateCustomFieldValue,
} from 'state/ticket/actions'

import {logEvent, SegmentEvent} from 'common/segment'
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
        [dispatch, id, hasError]
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
            })
        )
    }, [stateValue, dispatch, id, isRequired])
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
                    if (trimmedCurrentValue !== stateValue) {
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
