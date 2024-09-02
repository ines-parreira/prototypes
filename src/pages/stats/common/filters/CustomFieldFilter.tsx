import _noop from 'lodash/noop'
import React, {useEffect, useMemo} from 'react'
import {useCustomFieldDefinitions} from 'hooks/customField/useCustomFieldDefinitions'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import Filter from 'pages/stats/common/components/Filter'
import {
    activeParams,
    selectDropdownTextFields,
} from 'pages/stats/CustomFieldSelect'
import {DropdownOption} from 'pages/stats/types'
import {
    getSelectedCustomField,
    setSelectedCustomField,
} from 'state/ui/stats/ticketInsightsSlice'
import {FilterKey} from 'models/stat/types'
import {FilterLabels} from 'pages/stats/common/filters/constants'

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

    return (
        <Filter
            filterName={FilterLabels[FilterKey.CustomFields]}
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
        />
    )
}
