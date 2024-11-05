import noop from 'lodash/noop'

import React, {useCallback} from 'react'

import {connect} from 'react-redux'

import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import {CustomField} from 'custom-fields/types'
import {getCustomFieldValueSerializer} from 'models/reporting/queryFactories/utils'
import {CustomFieldFilter} from 'models/stat/types'
import Filter from 'pages/stats/common/components/Filter'
import {
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'pages/stats/common/components/Filter/constants'
import {customFieldsFilterLogicalOperators} from 'pages/stats/common/filters/constants'
import {
    emptyCustomFieldFilter,
    logSegmentEvent,
} from 'pages/stats/common/filters/helpers'
import {RemovableFilter} from 'pages/stats/common/filters/types'
import {
    activeParams,
    selectDropdownTextFields,
} from 'pages/stats/ticket-insights/ticket-fields/CustomFieldSelect'
import {DropdownOption} from 'pages/stats/types'

import {
    getCustomFieldFilterById,
    getCustomFieldSavedFilterById,
} from 'state/stats/selectors'
import {mergeCustomFieldsFilter} from 'state/stats/statsSlice'
import {RootState} from 'state/types'
import {statFiltersClean, statFiltersDirty} from 'state/ui/stats/actions'
import {upsertSavedFilterCustomFieldFilter} from 'state/ui/stats/filtersSlice'

type DispatchProps = {
    dispatchUpdate: (value: CustomFieldFilter) => void
    dispatchStatFiltersDirty?: () => void
    dispatchStatFiltersClean?: () => void
}

type OwnProps = {
    value?: CustomFieldFilter
    filterName: string
    customFieldId: number
}

type Props = OwnProps & DispatchProps & RemovableFilter

const getOptions = (activeFields: CustomField[], customFieldId: number) => {
    const dropdownFieldDefinition: CustomField | undefined = activeFields
        .filter(selectDropdownTextFields)
        .find((field) => field.id === customFieldId)

    const fieldOptions: DropdownOption[] = []
    if (
        dropdownFieldDefinition &&
        dropdownFieldDefinition.definition.data_type === 'text' &&
        dropdownFieldDefinition.definition.input_settings.input_type ===
            'dropdown'
    ) {
        fieldOptions.push(
            ...dropdownFieldDefinition.definition.input_settings.choices.map(
                (opt) => ({
                    value: getCustomFieldValueSerializer(customFieldId)(opt),
                    label: `${opt}`,
                })
            )
        )
    }

    return fieldOptions
}

export default function CustomFieldsFilter({
    value: inputValue,
    dispatchUpdate,
    dispatchStatFiltersDirty = noop,
    dispatchStatFiltersClean = noop,
    initializeAsOpen = false,
    onRemove,
    filterName,
    customFieldId,
}: Props) {
    const value = inputValue ?? emptyCustomFieldFilter(customFieldId)
    const {data: {data: activeFields = []} = {}} =
        useCustomFieldDefinitions(activeParams)

    const options = getOptions(activeFields, customFieldId)

    const selectedOptions = options.filter((option) =>
        value.values.includes(option.value)
    )

    const handleFilterValuesChange = useCallback(
        (values: string[]) => {
            dispatchStatFiltersDirty()
            dispatchUpdate({
                customFieldId,
                values,
                operator: value.operator,
            })
        },
        [
            customFieldId,
            dispatchStatFiltersDirty,
            dispatchUpdate,
            value.operator,
        ]
    )

    const handleFilterOperatorChange = useCallback(
        (operator: LogicalOperatorEnum) => {
            dispatchUpdate({
                customFieldId,
                values: value.values,
                operator: operator,
            })
        },
        [customFieldId, dispatchUpdate, value.values]
    )

    const onOptionChange = (opt: DropdownOption) => {
        if (value.values.includes(opt.value)) {
            handleFilterValuesChange(
                value.values.filter((tagId) => String(tagId) !== opt?.value)
            )
        } else {
            handleFilterValuesChange([...value.values, opt.value])
        }
    }

    const handleDropdownOpen = () => {
        dispatchStatFiltersDirty()
    }

    const handleDropdownClosed = () => {
        logSegmentEvent(
            `tf_${filterName}`,
            LogicalOperatorLabel[value.operator]
        )
        dispatchStatFiltersClean()
    }

    return (
        <Filter
            filterName={filterName}
            filterOptionGroups={[{options}]}
            selectedOptions={selectedOptions}
            logicalOperators={customFieldsFilterLogicalOperators}
            selectedLogicalOperator={value.operator}
            onChangeOption={onOptionChange}
            onSelectAll={() => {
                handleFilterValuesChange(options.map((tag) => tag.value))
            }}
            onRemoveAll={() => {
                handleFilterValuesChange([])
            }}
            onRemove={() => {
                dispatchUpdate(emptyCustomFieldFilter(customFieldId))
                onRemove?.()
            }}
            onChangeLogicalOperator={handleFilterOperatorChange}
            onDropdownOpen={handleDropdownOpen}
            onDropdownClosed={handleDropdownClosed}
            initializeAsOpen={initializeAsOpen}
        />
    )
}

export const CustomFieldsFilterWithState = connect(
    (state: RootState, ownProps: OwnProps) => ({
        value: getCustomFieldFilterById(ownProps.customFieldId)(state),
    }),
    {
        dispatchUpdate: mergeCustomFieldsFilter,
        dispatchStatFiltersDirty: statFiltersDirty,
        dispatchStatFiltersClean: statFiltersClean,
    }
)(CustomFieldsFilter)

export const CustomFieldsFilterWithSavedState = connect(
    (state: RootState, ownProps: OwnProps) => ({
        value: getCustomFieldSavedFilterById(ownProps.customFieldId)(state),
    }),
    {
        dispatchUpdate: (value: CustomFieldFilter) =>
            upsertSavedFilterCustomFieldFilter(value),
    }
)(CustomFieldsFilter)
