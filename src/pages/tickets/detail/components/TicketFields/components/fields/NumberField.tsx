import React, {useCallback, useEffect, useState} from 'react'

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
import {isCustomFieldValueEmpty} from 'utils/customFields'
import StealthInput from '../StealthInput'
import Label from '../Label'

export type Props = {
    id: CustomFieldState['id']
    label: string
    fieldState?: CustomFieldState
    min?: number
    max?: number
    isRequired?: boolean
}

function isInRange(value?: number, min?: number, max?: number) {
    if (isCustomFieldValueEmpty(value)) return false

    if (typeof min === 'number' && value < min) {
        return false
    }
    if (typeof max === 'number' && value > max) {
        return false
    }
    return true
}

function numberOrUndefined(value?: string) {
    if (isCustomFieldValueEmpty(value)) return undefined

    return Number(value)
}

export default function NumberField({
    id,
    label,
    fieldState,
    min,
    max,
    isRequired,
}: Props) {
    const dispatch = useAppDispatch()

    const ticketId = useAppSelector(getTicket).id
    const isValueEmpty = isCustomFieldValueEmpty(fieldState?.value)
    const initialValue: number | undefined = isValueEmpty
        ? undefined
        : Number(fieldState?.value)
    const hasError = fieldState?.hasError

    const [currentValue, setCurrentValue] = useState(initialValue)
    const [isActive, setActive] = useState(false)

    const handleChange = useCallback(
        (newValue?: number) => {
            if (hasError && !isCustomFieldValueEmpty(newValue)) {
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
                hasError:
                    (isRequired && isValueEmpty) ||
                    (!isValueEmpty && !isInRange(initialValue, min, max)) ||
                    hasError,
                value: initialValue,
            })
        )
    }, [
        hasError,
        isValueEmpty,
        initialValue,
        dispatch,
        id,
        isRequired,
        min,
        max,
    ])
    // Only on blur
    const {mutate} = useUpdateOrDeleteTicketFieldValue(
        {onError},
        {isDisabled: !ticketId}
    )

    const inputId = `ticket-${ticketId}-custom-field-value-number-input-${id}`

    // This piece of code ensures the current value is still in range
    // Must be inside an useEffect to avoid concurrency issues with other dispatches
    useEffect(() => {
        if (!isValueEmpty && !isInRange(initialValue, min, max)) {
            dispatch(updateCustomFieldError(id, true))
        }
    }, [initialValue, dispatch, id, isValueEmpty, min, max])

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
                type="number"
                min={min}
                max={max}
                value={typeof currentValue === 'undefined' ? '' : currentValue}
                onChange={(nextValue) =>
                    handleChange(numberOrUndefined(nextValue))
                }
                hasError={hasError}
                onFocus={() => {
                    setActive(true)
                    logEvent(SegmentEvent.CustomFieldTicketValueInputFocused, {
                        ticketId,
                        id,
                        label,
                    })
                }}
                onBlur={() => {
                    setActive(false)
                    setCurrentValue(currentValue)
                    dispatch(updateCustomFieldValue(id, currentValue))
                    if (currentValue !== initialValue) {
                        mutate([
                            {
                                fieldType: 'Ticket',
                                holderId: ticketId,
                                fieldId: id,
                                value: currentValue,
                            },
                        ])
                    }
                }}
            />
        </Label>
    )
}
