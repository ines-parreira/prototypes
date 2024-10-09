import classnames from 'classnames'
import React, {useEffect, useRef, useState} from 'react'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'

import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import {CustomField, ListParams} from 'custom-fields/types'
import Button from 'pages/common/components/button/Button'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import {
    getSelectedCustomField,
    setSelectedCustomField,
} from 'state/ui/stats/ticketInsightsSlice'
import css from 'pages/stats/ticket-insights/ticket-fields/CustomFieldSelect.less'

export const SELECT_FIELD_LABEL = 'Select field'
export const TOOLTIP_CONTENT =
    'This report is available only for ticket fields of type "dropdown" that are currently active (i.e. not archived).'

export const activeParams: ListParams = {
    archived: false,
    object_type: 'Ticket',
}

export const selectDropdownTextFields = (field: CustomField) =>
    field.definition.data_type === 'text' &&
    field.definition.input_settings.input_type === 'dropdown'

export const CustomFieldSelect = ({
    filter,
}: {
    filter?: (customField: CustomField) => boolean
}) => {
    const selectedCustomField = useAppSelector(getSelectedCustomField)
    const dispatch = useAppDispatch()

    const [isOpen, setIsOpen] = useState(false)
    const buttonRef = useRef(null)

    const {data: {data: activeFields = []} = {}, isLoading} =
        useCustomFieldDefinitions(activeParams)
    const activeDropdownFields = activeFields
        .filter(selectDropdownTextFields)
        .filter((customField) => (filter ? filter(customField) : true))

    const selectedField = activeDropdownFields.find(
        (field) => field.id === selectedCustomField.id
    )

    useEffect(() => {
        if (!selectedField && activeDropdownFields[0] !== undefined) {
            dispatch(
                setSelectedCustomField({
                    id: activeDropdownFields[0].id,
                    label: activeDropdownFields[0].label,
                    isLoading,
                })
            )
        }
    }, [activeDropdownFields, isLoading, dispatch, selectedField])

    return isLoading ? (
        <Skeleton inline width={160} />
    ) : (
        <div className={css.wrapper}>
            <Button
                onClick={() => setIsOpen(!isOpen)}
                ref={buttonRef}
                intent={'secondary'}
                className={css.button}
            >
                <span className={css.buttonText}>
                    {selectedField?.label || SELECT_FIELD_LABEL}
                </span>
                <i className={'material-icons'}>arrow_drop_down</i>
            </Button>

            <Dropdown
                isOpen={isOpen}
                onToggle={setIsOpen}
                target={buttonRef}
                value={selectedCustomField.id}
            >
                <DropdownBody>
                    {activeDropdownFields.map((field) => (
                        <DropdownItem
                            key={field.id}
                            className={classnames(css.dropdownItem)}
                            onClick={() => {
                                dispatch(
                                    setSelectedCustomField({
                                        id: field.id,
                                        label: field.label,
                                        isLoading,
                                    })
                                )
                                setIsOpen(false)
                            }}
                            option={{value: field.id, label: field.label}}
                        >
                            <span className={css.dropdownItemContent}>
                                {field.label}
                            </span>
                        </DropdownItem>
                    ))}
                </DropdownBody>
            </Dropdown>
            <IconTooltip
                className={css.tooltip}
                tooltipProps={{
                    placement: 'right',
                }}
            >
                {TOOLTIP_CONTENT}
            </IconTooltip>
        </div>
    )
}
