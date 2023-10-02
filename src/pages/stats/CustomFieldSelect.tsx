import classnames from 'classnames'
import React, {useEffect, useRef, useState} from 'react'

import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import IconTooltip from 'pages/common/forms/Label/IconTooltip'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import {ListParams} from 'models/customField/types'
import Button from 'pages/common/components/button/Button'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import {useCustomFieldDefinitions} from 'hooks/customField/useCustomFieldDefinitions'
import {
    getSelectedCustomField,
    setSelectedCustomField,
} from 'state/ui/stats/ticketInsightsSlice'
import css from './CustomFieldSelect.less'

export const SELECT_FIELD_LABEL = 'Select field'
export const TOOLTIP_CONTENT =
    'This report is available only for ticket fields of type "dropdown" that are currently active (i.e. not archived).'

const activeParams: ListParams = {
    archived: false,
    object_type: 'Ticket',
}

export const CustomFieldSelect = () => {
    const selectedCustomField = useAppSelector(getSelectedCustomField)
    const dispatch = useAppDispatch()

    const [isOpen, setIsOpen] = useState(false)
    const buttonRef = useRef(null)

    const {data: {data: activeFields = []} = {}, isLoading} =
        useCustomFieldDefinitions(activeParams)

    const selectedField = activeFields.find(
        (field) => field.id === selectedCustomField.id
    )

    useEffect(() => {
        dispatch(
            setSelectedCustomField({
                id: activeFields[0] !== undefined ? activeFields[0].id : null,
                label:
                    activeFields[0] !== undefined ? activeFields[0].label : '',
                isLoading,
            })
        )
    }, [activeFields, isLoading, dispatch])

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
                <i className={classnames('material-icons')}>arrow_drop_down</i>
            </Button>

            <Dropdown
                isOpen={isOpen}
                onToggle={setIsOpen}
                target={buttonRef}
                value={selectedCustomField.id}
            >
                {activeFields.map((field) => (
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
