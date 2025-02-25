import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import _times from 'lodash/times'

import FilterValue, {
    getTooltipLabels,
} from 'pages/stats/common/components/Filter/components/FilterValue/FilterValue'
import {
    FILTER_VALUE_MAX_WIDTH,
    FILTER_VALUE_PLACEHOLDER,
    LogicalOperatorEnum,
    REMOVE_FILTER_LABEL,
} from 'pages/stats/common/components/Filter/constants'

describe('FilterValue', () => {
    it('renders without errors', () => {
        render(
            <FilterValue
                optionsLabels={[]}
                logicalOperator={null}
                onChange={jest.fn()}
            />,
        )
    })

    it('displays the provided values', () => {
        const optionsLabels = ['value1', 'value2', 'value3']
        render(
            <FilterValue
                optionsLabels={optionsLabels}
                logicalOperator={null}
                onChange={jest.fn()}
            />,
        )

        expect(screen.getByText(optionsLabels.join(', '))).toBeInTheDocument()
    })

    it('calls the onChange callback when a value is changed', () => {
        const onChangeMock = jest.fn()
        render(
            <FilterValue
                optionsLabels={['value1']}
                logicalOperator={null}
                onChange={onChangeMock}
            />,
        )

        const filterValueElement = screen.getByText('value1')
        userEvent.click(filterValueElement)

        expect(onChangeMock).toHaveBeenCalled()
    })

    it('calls the onRemove callback when the remove button is clicked', () => {
        const onRemoveMock = jest.fn()
        render(
            <FilterValue
                optionsLabels={['value1']}
                logicalOperator={null}
                onChange={jest.fn()}
                onRemove={onRemoveMock}
            />,
        )

        const removeButton = screen.getByText('close')
        userEvent.click(removeButton)

        expect(onRemoveMock).toHaveBeenCalled()
    })

    it('should not call the onRemove when the remove button is clicked', () => {
        const onRemoveMock = jest.fn()
        render(
            <FilterValue
                optionsLabels={['value1']}
                logicalOperator={null}
                onChange={jest.fn()}
                onRemove={onRemoveMock}
                isDisabled
            />,
        )

        const removeButton = screen.getByText('close')
        userEvent.click(removeButton)

        expect(onRemoveMock).not.toHaveBeenCalled()
    })

    it('displays the logical operator when it is not provided', () => {
        render(
            <FilterValue
                optionsLabels={['value1']}
                logicalOperator={LogicalOperatorEnum.NOT_ONE_OF}
                onChange={jest.fn()}
            />,
        )

        expect(screen.queryByTestId('logical-operator')).toBeInTheDocument()
    })

    it("doesn't display the trail icon when it is set to false", () => {
        render(
            <FilterValue
                optionsLabels={['value1']}
                logicalOperator={null}
                onChange={jest.fn()}
                trailIcon={false}
            />,
        )

        expect(screen.queryByText('close')).not.toBeInTheDocument()
    })

    it('shows the tooltip when the filter value is too long', async () => {
        Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
            configurable: true,
            value: FILTER_VALUE_MAX_WIDTH,
        })

        render(
            <FilterValue
                optionsLabels={['value1']}
                logicalOperator={null}
                onChange={jest.fn()}
                trailIcon={false}
            />,
        )

        const filterValueElement = screen.getByText('value1')
        userEvent.hover(filterValueElement)

        await waitFor(() =>
            expect(screen.getByRole('tooltip')).toBeInTheDocument(),
        )
    })

    it("doesn't show the Filter content tooltip when hovering over the trail icon", async () => {
        Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
            configurable: true,
            value: FILTER_VALUE_MAX_WIDTH,
        })

        const valueLabel = 'value1'
        render(
            <FilterValue
                optionsLabels={[valueLabel]}
                logicalOperator={null}
                onChange={jest.fn()}
            />,
        )

        const removeButton = screen.getByText('close')
        const label = screen.getByText(valueLabel)

        userEvent.hover(label)
        await waitFor(() => {
            const tooltip = screen.getByRole('tooltip')

            expect(tooltip).toBeInTheDocument()
            expect(tooltip).toHaveTextContent(valueLabel)
        })

        userEvent.hover(removeButton)
        await waitFor(() => {
            const removeTooltip = screen.getByRole('tooltip')
            expect(removeTooltip).toBeInTheDocument()
            expect(removeTooltip).toHaveTextContent(REMOVE_FILTER_LABEL)
        })

        userEvent.unhover(removeButton)
        await waitFor(() => {
            const tooltip = screen.queryByRole('tooltip')
            expect(tooltip).not.toBeInTheDocument()
        })
    })
})

describe('getTooltipLabels', () => {
    const generateLabels = (length: number) => {
        return _times(length, (i) => `label ${i + 1}`)
    }
    it('should return a string with all labels separated by commas when the number of labels is less than or equal to 20', () => {
        const optionsLabels = generateLabels(3)
        const expectedString = optionsLabels.join(',\n')
        const result = getTooltipLabels(optionsLabels)
        expect(result).toEqual(expectedString)
    })

    it('should return a string with the first 20 labels separated by commas and a message indicating the number of remaining labels when the number of labels is greater than 20', () => {
        const optionsLabels = generateLabels(25)
        const result = getTooltipLabels(optionsLabels)
        const expectedString = `${generateLabels(20).join(',\n')},\n5 more...`
        expect(result).toEqual(expectedString)
    })

    it('should return an empty string when the optionsLabels array is empty', () => {
        const optionsLabels: string[] = []
        const result = getTooltipLabels(optionsLabels)
        expect(result).toEqual(FILTER_VALUE_PLACEHOLDER)
    })
})
