import React, {ComponentProps, useCallback} from 'react'

import {useUpdateOrDeleteTicketFieldValue} from 'hooks/customField/useUpdateOrDeleteTicketFieldValue'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {CustomFieldState, CustomFieldValue} from 'models/customField/types'
import {
    updateCustomFieldError,
    updateCustomFieldState,
    updateCustomFieldValue,
} from 'state/ticket/actions'
import Tooltip from 'pages/common/components/Tooltip'
import Label from 'pages/tickets/detail/components/TicketFields/components/Label'
import {getTicket} from 'state/ticket/selectors'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {isCustomFieldValueEmpty} from 'utils/customFields'

import MultiLevelSelect from './MultiLevelSelect'
import {getLabel} from './helpers/getLabels'

type Props = Omit<
    ComponentProps<typeof MultiLevelSelect>,
    'onChange' | 'onFocus' | 'value' | 'prediction' | 'hasError' | 'inputId'
> & {
    fieldState?: CustomFieldState
    isRequired?: boolean
}

export const createInputId = (ticketId: string | number, id: string | number) =>
    `ticket-${ticketId}-custom-field-value-input-${id}`

export default function DropdownField(props: Props) {
    const dispatch = useAppDispatch()
    const ticketId = useAppSelector(getTicket).id

    const id = props.id
    const value = props.fieldState?.value
    const isValueEmpty = isCustomFieldValueEmpty(value)
    const hasError = props.fieldState?.hasError
    const inputId = createInputId(ticketId, id)

    // Log an event in Semgent when the dropdown is focused
    const handleFocus = () => {
        logEvent(SegmentEvent.CustomFieldTicketValueDropdownFocused, {
            ticketId,
            id,
            label: props.label,
        })
    }

    // Update the field in the back-end when the value changes
    const onError = useCallback(() => {
        dispatch(
            updateCustomFieldState({
                id,
                hasError: Boolean(
                    (props.isRequired && isValueEmpty) || hasError
                ),
                value,
            })
        )
    }, [value, isValueEmpty, dispatch, id, props.isRequired, hasError])
    const {mutate} = useUpdateOrDeleteTicketFieldValue(
        {onError},
        {isDisabled: !ticketId}
    )
    const handleChange = useCallback(
        (newValue: CustomFieldValue) => {
            dispatch(updateCustomFieldValue(id, newValue))
            if (isCustomFieldValueEmpty(newValue && props.isRequired)) {
                dispatch(updateCustomFieldError(id, true))
            } else {
                dispatch(updateCustomFieldError(id, false))
            }
            mutate([
                {
                    fieldType: 'Ticket',
                    holderId: ticketId,
                    fieldId: id,
                    value: newValue,
                },
            ])
        },
        [dispatch, id, mutate, ticketId, props.isRequired]
    )

    return (
        <>
            <Label label={props.label} isRequired={props.isRequired}>
                {!isValueEmpty && (
                    <Tooltip placement="left" target={inputId} autohide={false}>
                        {getLabel(value)}
                    </Tooltip>
                )}
            </Label>
            <MultiLevelSelect
                value={value}
                hasError={hasError}
                prediction={props.fieldState?.prediction}
                inputId={inputId}
                onChange={handleChange}
                onFocus={handleFocus}
                {...props}
            />
        </>
    )
}
