import { render, screen, waitFor } from '@testing-library/react'
import _times from 'lodash/times'

import FilterValue, {
    getTooltipLabels,
} from 'pages/common/forms/FilterInput/FilterValue'
import { userEvent } from 'utils/testing/userEvent'

describe('FilterValue', () => {
    it('renders without errors', () => {
        render(<FilterValue optionsLabels={[]} onClick={jest.fn()} />)
    })

    it('displays the provided values', () => {
        const optionsLabels = ['value1', 'value2', 'value3']
        render(
            <FilterValue optionsLabels={optionsLabels} onClick={jest.fn()} />,
        )

        expect(screen.getByText(optionsLabels.join(', '))).toBeInTheDocument()
    })

    it('calls the onClick callback when a value is clicked', () => {
        const onClickMock = jest.fn()
        render(<FilterValue optionsLabels={['value1']} onClick={onClickMock} />)

        const filterValueElement = screen.getByText('value1')
        userEvent.click(filterValueElement)

        expect(onClickMock).toHaveBeenCalled()
    })

    it('calls the onTrailIconClick callback when the icon is clicked', () => {
        const onTrailIconClickMock = jest.fn()
        render(
            <FilterValue
                optionsLabels={['value1']}
                onClick={jest.fn()}
                onTrailIconClick={onTrailIconClickMock}
                trailIcon="close"
            />,
        )

        const removeButton = screen.getByText('close')
        userEvent.click(removeButton)

        expect(onTrailIconClickMock).toHaveBeenCalled()
    })

    it('should not call the onTrailIconClick when the icon is clicked', () => {
        const onTrailIconClickMock = jest.fn()
        render(
            <FilterValue
                optionsLabels={['value1']}
                onClick={jest.fn()}
                onTrailIconClick={onTrailIconClickMock}
                trailIcon="close"
                isDisabled
            />,
        )

        const removeButton = screen.getByText('close')
        userEvent.click(removeButton)

        expect(onTrailIconClickMock).not.toHaveBeenCalled()
    })

    it('displays the prefix when it is provided', () => {
        render(
            <FilterValue
                optionsLabels={['value1']}
                prefix={<div data-testid="prefix">Prefix</div>}
                onClick={jest.fn()}
            />,
        )

        expect(screen.queryByTestId('prefix')).toBeInTheDocument()
    })

    it('shows the tooltip when the filter value is too long', async () => {
        Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
            configurable: true,
            value: 120,
        })

        render(
            <FilterValue
                optionsLabels={['value1']}
                onClick={jest.fn()}
                maxWidth={100}
            />,
        )

        const filterValueElement = screen.getByText('value1')
        userEvent.hover(filterValueElement)

        await waitFor(() =>
            expect(screen.getByRole('tooltip')).toBeInTheDocument(),
        )
    })

    it('shows the tooltip text when hovering over the trail icon', async () => {
        Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
            configurable: true,
            value: 120,
        })

        const valueLabel = 'value1'
        const tooltipText = 'Tooltip text'
        render(
            <FilterValue
                optionsLabels={[valueLabel]}
                onClick={jest.fn()}
                trailIcon="close"
                trailIconTooltipText={tooltipText}
                maxWidth={100}
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
            expect(removeTooltip).toHaveTextContent(tooltipText)
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
        const result = getTooltipLabels(optionsLabels, '')
        expect(result).toEqual(expectedString)
    })

    it('should return a string with the first 20 labels separated by commas and a message indicating the number of remaining labels when the number of labels is greater than 20', () => {
        const optionsLabels = generateLabels(25)
        const result = getTooltipLabels(optionsLabels, '')
        const expectedString = `${generateLabels(20).join(',\n')},\n5 more...`
        expect(result).toEqual(expectedString)
    })

    it('should return an empty string when the optionsLabels array is empty', () => {
        const optionsLabels: string[] = []
        const result = getTooltipLabels(optionsLabels, 'placeholder')
        expect(result).toEqual('placeholder')
    })
})
