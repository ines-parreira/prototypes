import React, {useCallback, useState} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import {CustomFieldState} from 'models/customField/types'
import {OnMutateSettings} from 'models/customField/queries'
import {
    updateCustomFieldError,
    updateCustomFieldValue,
} from 'state/ticket/actions'

import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import useAppSelector from 'hooks/useAppSelector'
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
    onChange: (
        value: CustomFieldState['value'],
        settings: OnMutateSettings
    ) => void
}

export default function TextField({
    id,
    label,
    fieldState,
    placeholder,
    onChange,
    isRequired,
}: Props) {
    const dispatch = useAppDispatch()

    const ticketId = useAppSelector(getTicket).id
    const initialValue = fieldState?.value?.toString() || ''
    const hasError = fieldState?.hasError

    const inputId = `ticket-${ticketId}-custom-field-value-input-${id}`

    const [currentValue, setCurrentValue] = useState(initialValue)
    const handleChange = useCallback(
        (newValue: string) => {
            if (hasError && newValue !== '') {
                dispatch(updateCustomFieldError(id, false))
            }
            setCurrentValue(newValue)
        },
        [dispatch, id, hasError]
    )

    const [isActive, setActive] = useState(false)

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
                onBlur={() => {
                    setActive(false)
                    setCurrentValue(currentValue.trim())
                    dispatch(updateCustomFieldValue(id, currentValue))
                    if (currentValue !== initialValue) {
                        onChange(currentValue, {
                            previousState: {
                                id,
                                hasError: Boolean(isRequired && !initialValue),
                                value: initialValue,
                            },
                            onError: () => setCurrentValue(initialValue),
                        })
                    }
                }}
            />
        </Label>
    )
}
