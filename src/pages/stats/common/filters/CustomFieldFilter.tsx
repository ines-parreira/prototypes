import _noop from 'lodash/noop'
import React, {useEffect, useMemo} from 'react'

import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {FilterComponentKey} from 'models/stat/types'
import Filter from 'pages/stats/common/components/Filter'
import {FilterLabels} from 'pages/stats/common/filters/constants'
import {
    activeParams,
    selectDropdownTextFields,
} from 'pages/stats/ticket-insights/ticket-fields/CustomFieldSelect'
import {DropdownOption} from 'pages/stats/types'
import {
    getSelectedCustomField,
    setSelectedCustomField,
} from 'state/ui/stats/ticketInsightsSlice'

import {logSegmentEvent} from './helpers'

export const CUSTOM_FIELD_FILTER_NAME =
    FilterLabels[FilterComponentKey.CustomField]

export const CustomFieldFilter = () => {
    const selectedCustomField = useAppSelector(getSelectedCustomField)
    const dispatch = useAppDispatch()

    const {data: {data: activeFields = []} = {}, isLoading} =
        useCustomFieldDefinitions(activeParams)
    const activeDropdownFields = activeFields.filter(selectDropdownTextFields)
    const options = useMemo(
        () =>
            activeDropdownFields.map((field) => ({
                value: String(field.id),
                label: field.label,
            })),
        [activeDropdownFields]
    )
    const selectedField = activeDropdownFields.find(
        (field) => field.id === selectedCustomField.id
    )
    const selectedOptions = useMemo(() => {
        return (selectedField ? [selectedField] : []).map((field) => ({
            value: String(field.id),
            label: field.label,
        }))
    }, [selectedField])

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

    const onOptionChange = (opt: DropdownOption) => {
        dispatch(
            setSelectedCustomField({
                id: Number(opt.value),
                label: opt.label,
                isLoading,
            })
        )
    }

    const handleDropdownClosed = () => {
        logSegmentEvent(`tf_${CUSTOM_FIELD_FILTER_NAME}`, null)
    }

    return (
        <Filter
            filterName={CUSTOM_FIELD_FILTER_NAME}
            isPersistent={true}
            isMultiple={false}
            showSearch={false}
            showQuickSelect={false}
            filterOptionGroups={[{options}]}
            selectedOptions={selectedOptions}
            logicalOperators={[]}
            selectedLogicalOperator={null}
            onChangeOption={onOptionChange}
            onSelectAll={_noop}
            onRemoveAll={_noop}
            onChangeLogicalOperator={_noop}
            onDropdownClosed={handleDropdownClosed}
        />
    )
}
