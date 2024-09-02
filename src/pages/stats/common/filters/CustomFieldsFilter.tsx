import {connect} from 'react-redux'
import React, {useCallback} from 'react'
import {useCustomFieldDefinitions} from 'hooks/customField/useCustomFieldDefinitions'
import useAppDispatch from 'hooks/useAppDispatch'
import {CustomField} from 'models/customField/types'
import {getCustomFieldValueSerializer} from 'models/reporting/queryFactories/utils'
import {CustomFieldFilter} from 'models/stat/types'
import Filter from 'pages/stats/common/components/Filter'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {customFieldsFilterLogicalOperators} from 'pages/stats/common/filters/constants'
import {emptyCustomFieldFilter} from 'pages/stats/common/filters/helpers'
import {RemovableFilter} from 'pages/stats/common/filters/types'
import {
    activeParams,
    selectDropdownTextFields,
} from 'pages/stats/CustomFieldSelect'
import {DropdownOption} from 'pages/stats/types'
import {getCustomFieldFilterById} from 'state/stats/selectors'
import {mergeCustomFieldsFilter} from 'state/stats/statsSlice'
import {RootState} from 'state/types'
import {statFiltersClean, statFiltersDirty} from 'state/ui/stats/actions'

type Props = {
    value?: CustomFieldFilter
    filterName: string
    customFieldId: number
} & RemovableFilter

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
    initialiseAsOpen = false,
    onRemove,
    filterName,
    customFieldId,
}: Props) {
    const value = inputValue ?? emptyCustomFieldFilter(customFieldId)
    const dispatch = useAppDispatch()

    const {data: {data: activeFields = []} = {}} =
        useCustomFieldDefinitions(activeParams)

    const options = getOptions(activeFields, customFieldId)

    const selectedOptions = options.filter((option) =>
        value.values.includes(option.value)
    )

    const handleFilterValuesChange = useCallback(
        (values: string[]) => {
            dispatch(statFiltersDirty())
            dispatch(
                mergeCustomFieldsFilter({
                    customFieldId,
                    values,
                    operator: value.operator,
                })
            )
        },
        [customFieldId, dispatch, value.operator]
    )

    const handleFilterOperatorChange = useCallback(
        (operator: LogicalOperatorEnum) => {
            dispatch(
                mergeCustomFieldsFilter({
                    customFieldId,
                    values: value.values,
                    operator: operator,
                })
            )
        },
        [customFieldId, dispatch, value.values]
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
        dispatch(statFiltersDirty())
    }

    const handleDropdownClosed = () => {
        dispatch(statFiltersClean())
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
                dispatch(
                    mergeCustomFieldsFilter(
                        emptyCustomFieldFilter(customFieldId)
                    )
                )
                onRemove?.()
            }}
            onChangeLogicalOperator={handleFilterOperatorChange}
            onDropdownOpen={handleDropdownOpen}
            onDropdownClosed={handleDropdownClosed}
            initialiseAsOpen={initialiseAsOpen}
        />
    )
}

export const CustomFieldsFilterFilterWithState = connect(
    (state: RootState, ownProps: Props) => ({
        value: getCustomFieldFilterById(ownProps.customFieldId)(state),
    })
)(CustomFieldsFilter)
