import React from 'react'

import { userEvent } from '@repo/testing'
import { render, screen, waitFor } from '@testing-library/react'

import {
    FILTER_WARNING_ICON,
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'domains/reporting/pages/common/components/Filter/constants'
import Filter, {
    getWarningTooltip,
} from 'domains/reporting/pages/common/components/Filter/Filter'
import { NON_EXISTENT_VALUES_WARNING_MESSAGE } from 'domains/reporting/pages/common/filters/utils'
import { FILTER_VALUE_PLACEHOLDER } from 'pages/common/forms/FilterInput/constants'

describe('Filter', () => {
    const filterName = 'Test Filter'
    const filterOptionGroups = [
        {
            options: [
                { label: 'Option 1', value: 'option1' },
                { label: 'Option 2', value: 'option2' },
                { label: 'Option 3', value: 'option3' },
            ],
        },
    ]
    const selectedOptions = [
        filterOptionGroups[0].options[0],
        filterOptionGroups[0].options[1],
    ]
    const logicalOperators = [
        LogicalOperatorEnum.ONE_OF,
        LogicalOperatorEnum.NOT_ONE_OF,
    ]
    const onChangeOption = jest.fn()
    const onSelectAll = jest.fn()
    const onRemoveAll = jest.fn()
    const onChangeLogicalOperator = jest.fn()

    it('renders the filter component', () => {
        render(
            <Filter
                filterName={filterName}
                filterOptionGroups={filterOptionGroups}
                selectedOptions={selectedOptions}
                logicalOperators={logicalOperators}
                onChangeOption={onChangeOption}
                onSelectAll={onSelectAll}
                onRemoveAll={onRemoveAll}
                onChangeLogicalOperator={onChangeLogicalOperator}
                filterErrors={{
                    warningType: undefined,
                    warningMessage: undefined,
                }}
            />,
        )

        expect(screen.getByText(filterName)).toBeInTheDocument()
        expect(screen.getByText('Option 1, Option 2')).toBeInTheDocument()
    })

    it('renders the filter component with open dropdown', () => {
        const onDropdownOpenSpy = jest.fn()
        render(
            <Filter
                initializeAsOpen={true}
                filterName={filterName}
                filterOptionGroups={filterOptionGroups}
                selectedOptions={[]}
                logicalOperators={logicalOperators}
                onChangeOption={onChangeOption}
                onSelectAll={onSelectAll}
                onRemoveAll={onRemoveAll}
                onChangeLogicalOperator={onChangeLogicalOperator}
                onDropdownOpen={onDropdownOpenSpy}
            />,
        )

        expect(screen.getByText(filterName)).toBeInTheDocument()
        expect(
            screen.getByRole('option', { name: 'Option 1' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('option', { name: 'Option 2' }),
        ).toBeInTheDocument()
        expect(onDropdownOpenSpy).toHaveBeenCalled()
    })

    it('calls onChangeOption when an option is selected', () => {
        render(
            <Filter
                filterName={filterName}
                filterOptionGroups={filterOptionGroups}
                selectedOptions={[]}
                logicalOperators={logicalOperators}
                onChangeOption={onChangeOption}
                onSelectAll={onSelectAll}
                onRemoveAll={onRemoveAll}
                onChangeLogicalOperator={onChangeLogicalOperator}
            />,
        )

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        userEvent.click(screen.getByText('Option 2'))

        expect(onChangeOption).toHaveBeenCalledWith({
            label: 'Option 2',
            value: 'option2',
        })
    })

    it('calls onSelectAll when the select all button is clicked', () => {
        render(
            <Filter
                filterName={filterName}
                filterOptionGroups={filterOptionGroups}
                selectedOptions={[]}
                logicalOperators={logicalOperators}
                onChangeOption={onChangeOption}
                onSelectAll={onSelectAll}
                onRemoveAll={onRemoveAll}
                onChangeLogicalOperator={onChangeLogicalOperator}
            />,
        )

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        userEvent.click(screen.getByText('Select all'))

        expect(onSelectAll).toHaveBeenCalled()
    })

    it('calls onRemoveAll when the remove all button is clicked', () => {
        render(
            <Filter
                filterName={filterName}
                filterOptionGroups={filterOptionGroups}
                selectedOptions={selectedOptions}
                logicalOperators={logicalOperators}
                onChangeOption={onChangeOption}
                onSelectAll={onSelectAll}
                onRemoveAll={onRemoveAll}
                onChangeLogicalOperator={onChangeLogicalOperator}
            />,
        )

        userEvent.click(screen.getByText('Option 1, Option 2'))

        userEvent.click(screen.getByText('Deselect all'))

        expect(onRemoveAll).toHaveBeenCalled()
    })

    it('calls onChangeLogicalOperator when a logical operator is selected', () => {
        render(
            <Filter
                filterName={filterName}
                filterOptionGroups={filterOptionGroups}
                selectedOptions={[]}
                logicalOperators={logicalOperators}
                onChangeOption={onChangeOption}
                onSelectAll={onSelectAll}
                onRemoveAll={onRemoveAll}
                onChangeLogicalOperator={onChangeLogicalOperator}
            />,
        )

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        userEvent.click(
            screen.getByText(LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF]),
        )

        expect(onChangeLogicalOperator).toHaveBeenCalledWith(
            LogicalOperatorEnum.ONE_OF,
        )
    })

    it("does not render logical operator when we don't have logical operators", () => {
        render(
            <Filter
                filterName={filterName}
                filterOptionGroups={filterOptionGroups}
                selectedOptions={selectedOptions}
                logicalOperators={[]}
                onChangeOption={onChangeOption}
                onSelectAll={onSelectAll}
                onRemoveAll={onRemoveAll}
                onChangeLogicalOperator={onChangeLogicalOperator}
            />,
        )

        expect(
            screen.queryByText(
                LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF],
            ),
        ).not.toBeInTheDocument()
    })

    it('does not render search when showSearch is false', () => {
        const { queryByPlaceholderText } = render(
            <Filter
                filterName={filterName}
                filterOptionGroups={filterOptionGroups}
                selectedOptions={[]}
                logicalOperators={logicalOperators}
                showSearch={false}
                onChangeOption={onChangeOption}
                onSelectAll={onSelectAll}
                onRemoveAll={onRemoveAll}
                onChangeLogicalOperator={onChangeLogicalOperator}
            />,
        )

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(queryByPlaceholderText('Search')).not.toBeInTheDocument()
    })

    it('does not render quick select when showQuickSelect is false', () => {
        render(
            <Filter
                filterName={filterName}
                filterOptionGroups={filterOptionGroups}
                selectedOptions={[]}
                logicalOperators={logicalOperators}
                showQuickSelect={false}
                onChangeOption={onChangeOption}
                onSelectAll={onSelectAll}
                onRemoveAll={onRemoveAll}
                onChangeLogicalOperator={onChangeLogicalOperator}
            />,
        )

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(screen.queryByText('Select all')).not.toBeInTheDocument()
    })

    it('triggers onToggle when the dropdown is opened', () => {
        const onDropdownClosedSpy = jest.fn()
        render(
            <Filter
                filterName={filterName}
                filterOptionGroups={filterOptionGroups}
                selectedOptions={[]}
                logicalOperators={logicalOperators}
                onChangeOption={onChangeOption}
                onSelectAll={onSelectAll}
                onRemoveAll={onRemoveAll}
                onChangeLogicalOperator={onChangeLogicalOperator}
                onDropdownClosed={onDropdownClosedSpy}
            />,
        )
        expect(screen.queryByTestId('floating-overlay')).not.toBeInTheDocument()
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        expect(screen.getByTestId('floating-overlay')).toBeInTheDocument()
        expect(onDropdownClosedSpy).not.toHaveBeenCalled()
    })

    it('should close dropdown on toggle', () => {
        const onDropdownClosedSpy = jest.fn()
        render(
            <Filter
                filterName={filterName}
                filterOptionGroups={filterOptionGroups}
                selectedOptions={[]}
                logicalOperators={logicalOperators}
                onChangeOption={onChangeOption}
                onSelectAll={onSelectAll}
                onRemoveAll={onRemoveAll}
                onChangeLogicalOperator={onChangeLogicalOperator}
                onDropdownClosed={onDropdownClosedSpy}
                filterErrors={{
                    warningType: 'not-applicable',
                    warningMessage: 'warningMessage',
                }}
            />,
        )
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByTestId('floating-overlay'))

        expect(screen.queryByTestId('floating-overlay')).not.toBeInTheDocument()
        expect(onDropdownClosedSpy).toHaveBeenCalled()
    })

    it('renders the filter component with an error message passed in props', async () => {
        render(
            <Filter
                filterName={filterName}
                filterOptionGroups={filterOptionGroups}
                selectedOptions={selectedOptions}
                logicalOperators={logicalOperators}
                onChangeOption={onChangeOption}
                onSelectAll={onSelectAll}
                onRemoveAll={onRemoveAll}
                onChangeLogicalOperator={onChangeLogicalOperator}
                filterErrors={{
                    warningType: 'non-existent',
                    warningMessage: 'warningMessage',
                }}
            />,
        )

        const warningIcon = screen.getByText(FILTER_WARNING_ICON)
        userEvent.hover(warningIcon)
        await waitFor(() => {
            expect(screen.getByText('warningMessage')).toBeInTheDocument()
        })
    })

    it('renders the filter component with an error message when one of the values does not exist in the options list', async () => {
        render(
            <Filter
                filterName={filterName}
                filterOptionGroups={filterOptionGroups}
                selectedOptions={[{ label: 'New Option', value: 'new-option' }]}
                logicalOperators={logicalOperators}
                onChangeOption={onChangeOption}
                onSelectAll={onSelectAll}
                onRemoveAll={onRemoveAll}
                onChangeLogicalOperator={onChangeLogicalOperator}
            />,
        )

        const warningIcon = screen.getByText(FILTER_WARNING_ICON)
        userEvent.hover(warningIcon)
        await waitFor(() => {
            expect(
                screen.getByText(NON_EXISTENT_VALUES_WARNING_MESSAGE),
            ).toBeInTheDocument()
        })
    })

    it('calls onDropdownClosed when an option is selected and shouldCloseOnSelect is true', () => {
        const onDropdownClosedSpy = jest.fn()
        render(
            <Filter
                isMultiple={false}
                initializeAsOpen
                shouldCloseOnSelect
                filterName={filterName}
                filterOptionGroups={filterOptionGroups}
                selectedOptions={selectedOptions}
                logicalOperators={logicalOperators}
                onChangeOption={onChangeOption}
                onSelectAll={onSelectAll}
                onRemoveAll={onRemoveAll}
                onChangeLogicalOperator={onChangeLogicalOperator}
                onDropdownClosed={onDropdownClosedSpy}
            />,
        )

        userEvent.click(screen.getByText('Option 2'))

        expect(onChangeOption).toHaveBeenCalledWith({
            label: 'Option 2',
            value: 'option2',
        })
        expect(onDropdownClosedSpy).toHaveBeenCalled()
    })

    it.each(['not-applicable' as const, 'non-existent' as const])(
        'should render with warning icon',
        async (warningType) => {
            render(
                <Filter
                    filterName={filterName}
                    filterOptionGroups={filterOptionGroups}
                    selectedOptions={[]}
                    logicalOperators={logicalOperators}
                    onChangeOption={onChangeOption}
                    onSelectAll={onSelectAll}
                    onRemoveAll={onRemoveAll}
                    onChangeLogicalOperator={onChangeLogicalOperator}
                    filterErrors={{
                        warningType,
                    }}
                />,
            )
            const warningIcon = screen.getByText(FILTER_WARNING_ICON)
            userEvent.hover(warningIcon)

            expect(warningIcon).toBeInTheDocument()
            await waitFor(() => {
                expect(
                    screen.getByText(
                        getWarningTooltip(warningType, filterName),
                    ),
                ).toBeInTheDocument()
            })
        },
    )

    it('should render the warning message', async () => {
        render(
            <Filter
                filterName={filterName}
                filterOptionGroups={filterOptionGroups}
                selectedOptions={[]}
                logicalOperators={logicalOperators}
                onChangeOption={onChangeOption}
                onSelectAll={onSelectAll}
                onRemoveAll={onRemoveAll}
                onChangeLogicalOperator={onChangeLogicalOperator}
                filterErrors={{
                    warningType: 'not-applicable',
                    warningMessage: 'warningMessage',
                }}
            />,
        )
        const warningIcon = screen.getByText(FILTER_WARNING_ICON)
        userEvent.hover(warningIcon)

        expect(warningIcon).toBeInTheDocument()
        await waitFor(() => {
            expect(screen.getByText('warningMessage')).toBeInTheDocument()
        })
    })

    it('should render DropdownBody with correct key based on options length', async () => {
        const customFilterOptionGroups = [
            {
                options: [
                    { label: 'Option 1', value: 'option1' },
                    { label: 'Option 2', value: 'option2' },
                    { label: 'Option 3', value: 'option3' },
                ],
            },
        ]

        const { rerender } = render(
            <Filter
                filterName={filterName}
                initializeAsOpen
                filterOptionGroups={[]}
                selectedOptions={[]}
                logicalOperators={logicalOperators}
                onChangeOption={onChangeOption}
                onSelectAll={onSelectAll}
                onRemoveAll={onRemoveAll}
                onChangeLogicalOperator={onChangeLogicalOperator}
            />,
        )

        expect(screen.queryByText('Option 1')).not.toBeInTheDocument()
        expect(screen.queryByText('Option 2')).not.toBeInTheDocument()
        expect(screen.queryByText('Option 3')).not.toBeInTheDocument()

        rerender(
            <Filter
                filterName={filterName}
                initializeAsOpen
                filterOptionGroups={customFilterOptionGroups}
                selectedOptions={[]}
                logicalOperators={logicalOperators}
                onChangeOption={onChangeOption}
                onSelectAll={onSelectAll}
                onRemoveAll={onRemoveAll}
                onChangeLogicalOperator={onChangeLogicalOperator}
            />,
        )

        expect(screen.getByText('Option 1')).toBeInTheDocument()
        expect(screen.getByText('Option 2')).toBeInTheDocument()
        expect(screen.getByText('Option 3')).toBeInTheDocument()
    })
})
