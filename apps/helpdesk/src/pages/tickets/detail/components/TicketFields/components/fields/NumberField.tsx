import { useCallback, useEffect, useState } from 'react'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import { logEvent, SegmentEvent } from 'common/segment'
import Label from 'custom-fields/components/Label'
import StealthInput from 'custom-fields/components/StealthInput'
import { isCustomFieldValueEmpty } from 'custom-fields/helpers/isCustomFieldValueEmpty'
import { useUpdateOrDeleteTicketFieldValue } from 'custom-fields/hooks/queries/useUpdateOrDeleteTicketFieldValue'
import { CustomFieldState } from 'custom-fields/types'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    updateCustomFieldError,
    updateCustomFieldState,
    updateCustomFieldValue,
} from 'state/ticket/actions'
import { getTicket } from 'state/ticket/selectors'

import css from './Field.less'

export type Props = {
    id: CustomFieldState['id']
    label: string
    fieldState?: CustomFieldState
    min?: number
    max?: number
    isRequired?: boolean
    isDisabled?: boolean
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
    isDisabled = false,
}: Props) {
    const dispatch = useAppDispatch()

    const ticketId = useAppSelector(getTicket).id
    const isValueEmpty = isCustomFieldValueEmpty(fieldState?.value)
    const stateValue: number | undefined = isValueEmpty
        ? undefined
        : Number(fieldState?.value)
    const hasError = fieldState?.hasError

    const [currentValue, setCurrentValue] = useState(stateValue)
    const [isActive, setActive] = useState(false)

    const handleChange = useCallback(
        (newValue?: number) => {
            if (hasError && !isCustomFieldValueEmpty(newValue)) {
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
                hasError:
                    (isRequired && isValueEmpty) ||
                    (!isValueEmpty && !isInRange(stateValue, min, max)) ||
                    hasError,
                value: stateValue,
            }),
        )
    }, [hasError, isValueEmpty, stateValue, dispatch, id, isRequired, min, max])
    // Only on blur
    const { mutate } = useUpdateOrDeleteTicketFieldValue(
        { onError },
        { isDisabled: !ticketId },
    )

    const inputId = `ticket-${ticketId}-custom-field-value-number-input-${id}`

    // This piece of code ensures the current value is still in range
    // Must be inside an useEffect to avoid concurrency issues with other dispatches
    useEffect(() => {
        if (!isValueEmpty && !isInRange(stateValue, min, max)) {
            dispatch(updateCustomFieldError(id, true))
        }
    }, [stateValue, dispatch, id, isValueEmpty, min, max])

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
                    type="number"
                    min={min}
                    max={max}
                    value={
                        typeof currentValue === 'undefined' ? '' : currentValue
                    }
                    onChange={(nextValue) => {
                        handleChange(numberOrUndefined(nextValue))
                    }}
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
                        setCurrentValue(currentValue)
                        dispatch(updateCustomFieldValue(id, currentValue))
                        if (currentValue !== stateValue) {
                            mutate({
                                ticketId,
                                fieldId: id,
                                value: currentValue,
                            })
                        }
                    }}
                />
            </div>
        </Label>
    )
}
