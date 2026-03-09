import type { ComponentProps } from 'react'
import React, { useMemo, useState } from 'react'

import { flatMap } from 'lodash'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import Filter from 'domains/reporting/pages/common/components/Filter/Filter'
import type { DropdownOption } from 'domains/reporting/pages/types'

const storyConfig: Meta = {
    title: 'Stats/Filter',
    component: Filter,
}

const Template: StoryFn<ComponentProps<typeof Filter>> = (props) => {
    const [selectedValues, setSelectedValues] = useState(props.selectedOptions)

    const [selectedLogicalOperator, setSelectedLogicalOperator] =
        useState<LogicalOperatorEnum | null>(
            props.selectedLogicalOperator || null,
        )

    const allValues = useMemo(
        () => flatMap(props.filterOptionGroups, (option) => option.options),
        [props.filterOptionGroups],
    )

    const onChangeOption = (option: DropdownOption) => {
        if (props.isMultiple === false) {
            setSelectedValues([option])
        } else {
            setSelectedValues((prev) => {
                if (prev.includes(option)) {
                    return prev.filter((value) => value !== option)
                }
                return [...prev, option]
            })
        }
    }

    const onSelectAll = () => {
        setSelectedValues(allValues)
    }

    const onRemoveAll = () => {
        setSelectedValues([])
    }

    return (
        <Filter
            {...props}
            selectedOptions={selectedValues}
            onChangeOption={onChangeOption}
            onRemoveAll={onRemoveAll}
            onSelectAll={onSelectAll}
            onChangeLogicalOperator={(value) =>
                setSelectedLogicalOperator(value as LogicalOperatorEnum)
            }
            selectedLogicalOperator={selectedLogicalOperator}
        />
    )
}

const defaultFilterOptionGroups = [
    {
        options: [
            { label: 'Tag value1', value: 'tag1' },
            { label: 'Tag value2', value: 'tag2' },
            { label: 'Tag value3', value: 'tag3' },
        ],
    },
]

const defaultProps: Partial<ComponentProps<typeof Filter>> = {
    filterName: 'Tag',
    filterOptionGroups: defaultFilterOptionGroups,
    selectedOptions: [defaultFilterOptionGroups[0].options[0]],
    isPersistent: false,
    selectedLogicalOperator: LogicalOperatorEnum.ONE_OF,
    logicalOperators: [
        LogicalOperatorEnum.ONE_OF,
        LogicalOperatorEnum.NOT_ONE_OF,
        LogicalOperatorEnum.ALL_OF,
    ],
    onRemove: () => ({}),
}

export const Default = Template.bind({})
Default.args = defaultProps

export const Persistent = Template.bind({})
Persistent.args = {
    ...defaultProps,
    isPersistent: true,
}

export const LongFilterName = Template.bind({})
LongFilterName.args = {
    ...defaultProps,
    filterName: 'This is a long filter name that should be truncated',
}

const longFilterOptions = [
    {
        options: [
            {
                label: 'This is a long filter value that should be truncated',
                value: 'tag1',
            },
            {
                label: 'This is another long filter value that should be truncated',
                value: 'tag2',
            },
        ],
    },
]

export const LongFilterValue = Template.bind({})
LongFilterValue.args = {
    ...defaultProps,
    filterOptionGroups: longFilterOptions,
    selectedOptions: longFilterOptions[0].options,
}

export const FilterWithoutLogicalOperator = Template.bind({})
FilterWithoutLogicalOperator.args = {
    ...defaultProps,
    logicalOperators: [],
    selectedLogicalOperator: null,
}

export const FilterWithoutValues = Template.bind({})
FilterWithoutValues.args = {
    ...defaultProps,
    selectedOptions: [],
}

export const FilterWithMultipleSections = Template.bind({})
FilterWithMultipleSections.args = {
    ...defaultProps,
    filterOptionGroups: [
        {
            title: 'Section 1',
            options: [
                { label: 'Tag value1', value: 'tag1' },
                { label: 'Tag value2', value: 'tag2' },
                { label: 'Tag value3', value: 'tag3' },
            ],
        },
        {
            title: 'Section 2',
            options: [
                { label: 'Tag value4', value: 'tag4' },
                { label: 'Tag value5', value: 'tag5' },
                { label: 'Tag value6', value: 'tag6' },
            ],
        },
    ],
    selectedOptions: [],
}

export const FilterWithSingleSelect = Template.bind({})
FilterWithSingleSelect.args = {
    ...defaultProps,
    isMultiple: false,
}

export const FilterWithWarning = Template.bind({})
FilterWithWarning.args = {
    ...defaultProps,
    filterErrors: { warningType: 'non-existent' },
}

export default storyConfig
