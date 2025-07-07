import { ComponentProps } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { assumeMock } from 'utils/testing'

import BusinessHoursDisplay from '../BusinessHoursDisplay'
import IntegrationRowsField from '../IntegrationRowsField'

jest.mock('../BusinessHoursDisplay')
const BusinessHoursDisplayMock = assumeMock(BusinessHoursDisplay)

const defaultProps = {
    onChange: jest.fn(),
    value: [],
    onItemClick: jest.fn(),
    numItems: 3,
}

const renderComponent = (
    props: Partial<ComponentProps<typeof IntegrationRowsField>>,
) => {
    return render(<IntegrationRowsField {...defaultProps} {...props} />)
}

describe('IntegrationRowsField', () => {
    beforeEach(() => {
        BusinessHoursDisplayMock.mockReturnValue(
            <div data-testid="business-hours">BusinessHoursDisplay</div>,
        )
    })

    it('renders correct number of rows based on numItems', () => {
        renderComponent({
            numItems: 3,
        })

        const checkboxes = screen.getAllByRole('checkbox')
        expect(checkboxes).toHaveLength(3)
    })

    it('renders all cells in each row', () => {
        renderComponent({
            numItems: 1,
        })

        expect(screen.getByRole('checkbox')).toBeInTheDocument()
        expect(screen.getByTestId('business-hours')).toBeInTheDocument()
        expect(screen.getByText('Customer service')).toBeInTheDocument()
        expect(screen.getByText('Store Name')).toBeInTheDocument()
    })

    it('renders checkbox as checked when index is in value array', () => {
        renderComponent({
            value: [0, 2],
        })

        const checkboxes = screen.getAllByRole('checkbox')
        expect(checkboxes[0]).toBeChecked()
        expect(checkboxes[1]).not.toBeChecked()
        expect(checkboxes[2]).toBeChecked()
    })

    it('calls onChange with added item when clicking unchecked row', () => {
        renderComponent({
            value: [1],
        })

        const checkboxes = screen.getAllByRole('checkbox')
        fireEvent.click(checkboxes[0])

        expect(defaultProps.onChange).toHaveBeenCalledWith([1, 0])
    })

    it('calls onChange with removed item when clicking checked row', () => {
        renderComponent({
            value: [0, 1, 2],
        })

        const checkboxes = screen.getAllByRole('checkbox')
        fireEvent.click(checkboxes[1])

        expect(defaultProps.onChange).toHaveBeenCalledWith([0, 2])
    })

    it('calls onItemClick when provided and row is clicked', () => {
        renderComponent({
            value: [],
            numItems: 1,
        })

        const checkbox = screen.getByRole('checkbox')
        fireEvent.click(checkbox)

        expect(defaultProps.onItemClick).toHaveBeenCalled()
    })

    it('handles empty value array correctly', () => {
        renderComponent({
            value: [],
            numItems: 2,
        })

        const checkboxes = screen.getAllByRole('checkbox')
        expect(checkboxes).toHaveLength(2)
        expect(checkboxes[0]).not.toBeChecked()
        expect(checkboxes[1]).not.toBeChecked()
    })
})
