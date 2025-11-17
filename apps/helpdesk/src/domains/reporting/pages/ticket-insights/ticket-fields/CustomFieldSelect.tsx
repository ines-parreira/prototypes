import { useEffect, useRef, useState } from 'react'

import classnames from 'classnames'

import { LegacyButton as Button, Skeleton } from '@gorgias/axiom'
import type { ListCustomFieldsParams } from '@gorgias/helpdesk-client'

import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import type { CustomField } from 'custom-fields/types'
import css from 'domains/reporting/pages/ticket-insights/ticket-fields/CustomFieldSelect.less'
import {
    getSelectedCustomField,
    setSelectedCustomField,
} from 'domains/reporting/state/ui/stats/ticketInsightsSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'

export const SELECT_FIELD_LABEL = 'Select field'
export const TOOLTIP_CONTENT =
    'This report is available only for ticket fields of type "dropdown" that are currently active (i.e. not archived).'

export const activeParams: ListCustomFieldsParams = {
    archived: false,
    object_type: 'Ticket',
}

export const selectDropdownTextFields = (field: CustomField) =>
    (field.definition.data_type === 'text' ||
        field.definition.data_type === 'boolean') &&
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

    const { data: { data: activeFields = [] } = {}, isLoading } =
        useCustomFieldDefinitions(activeParams)
    const activeDropdownFields = activeFields
        .filter(selectDropdownTextFields)
        .filter((customField) => (filter ? filter(customField) : true))

    const selectedField = activeDropdownFields.find(
        (field) => field.id === selectedCustomField.id,
    )

    useEffect(() => {
        if (!selectedField && activeDropdownFields[0] !== undefined) {
            dispatch(
                setSelectedCustomField({
                    id: activeDropdownFields[0].id,
                    label: activeDropdownFields[0].label,
                    isLoading,
                }),
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
                                    }),
                                )
                                setIsOpen(false)
                            }}
                            option={{ value: field.id, label: field.label }}
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
