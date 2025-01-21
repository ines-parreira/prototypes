import {Tooltip} from '@gorgias/merchant-ui-kit'
import React, {useCallback, useEffect} from 'react'

import {SegmentEvent, logEvent} from 'common/segment'
import Label from 'custom-fields/components/Label'
import MultiLevelSelect from 'custom-fields/components/MultiLevelSelect'
import {getLabel} from 'custom-fields/components/MultiLevelSelect/helpers/getLabels'
import {isOutdatedValue} from 'custom-fields/components/MultiLevelSelect/helpers/isOutdatedValue'
import {MultiLevelSelectProps} from 'custom-fields/components/MultiLevelSelect/MultiLevelSelect'
import {isCustomFieldValueEmpty} from 'custom-fields/helpers/isCustomFieldValueEmpty'
import {useUpdateOrDeleteTicketFieldValue} from 'custom-fields/hooks/queries/useUpdateOrDeleteTicketFieldValue'
import {CustomFieldState, CustomFieldValue} from 'custom-fields/types'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    updateCustomFieldError,
    updateCustomFieldState,
    updateCustomFieldValue,
} from 'state/ticket/actions'
import {getTicket} from 'state/ticket/selectors'

import css from './DropdownField.less'

type Props = Pick<MultiLevelSelectProps, 'choices' | 'isDisabled'> &
    Required<Pick<MultiLevelSelectProps, 'id' | 'label'>> & {
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
        (newValue: CustomFieldValue | undefined) => {
            dispatch(updateCustomFieldValue(id, newValue))
            if (isCustomFieldValueEmpty(newValue) && props.isRequired) {
                dispatch(updateCustomFieldError(id, true))
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

    useEffect(() => {
        if (isOutdatedValue(value, props.choices)) {
            dispatch(updateCustomFieldError(id, true))
        } else if (!isCustomFieldValueEmpty(value)) {
            dispatch(updateCustomFieldError(id, false))
        }
    }, [value, dispatch, id, props.choices])

    return (
        <div className={css.wrapper}>
            <Label
                className={css.label}
                label={props.label}
                isRequired={props.isRequired}
            >
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
        </div>
    )
}
