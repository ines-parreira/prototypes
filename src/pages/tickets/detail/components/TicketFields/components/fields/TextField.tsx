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

    return (
        <Label label={label} isRequired={isRequired}>
            <StealthInput
                name={label}
                type="text"
                value={currentValue}
                placeholder={placeholder}
                onChange={handleChange}
                hasError={hasError}
                onFocus={() => {
                    logEvent(SegmentEvent.CustomFieldTicketValueInputFocused, {
                        ticketId,
                        id,
                        label,
                    })
                }}
                onBlur={() => {
                    if (currentValue === '' && isRequired) {
                        dispatch(updateCustomFieldValue(id, currentValue))
                        dispatch(updateCustomFieldError(id, true))
                    }
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
