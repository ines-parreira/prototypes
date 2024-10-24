import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import {PlanInterval} from 'models/billing/types'

import BillingFrequency, {BillingFrequencyProps} from '../BillingFrequency'

describe('BillingFrequency', () => {
    const mockSelectedInterval = PlanInterval.Month
    const mockOnFrequencySelect = jest.fn()

    const setup = (props?: Partial<BillingFrequencyProps>) => {
        const defaultProps: BillingFrequencyProps = {
            selectedInterval: mockSelectedInterval,
            onFrequencySelect: mockOnFrequencySelect,
            ...props,
        }

        return render(<BillingFrequency {...defaultProps} />)
    }

    it('should render correctly', () => {
        const {getByText} = setup()
        expect(getByText('Monthly')).toBeInTheDocument()
        expect(getByText('Yearly')).toBeInTheDocument()
    })

    it('should call setSelectedInterval and setSelectedPlans with the correct values when a radio button is clicked', () => {
        const {getByLabelText} = setup()
        const monthlyRadioButton = getByLabelText('Monthly', {
            selector: 'input',
        })
        const yearlyRadioButton = getByLabelText('Yearly', {selector: 'input'})

        userEvent.click(monthlyRadioButton)
        expect(mockOnFrequencySelect).toHaveBeenCalledWith('month')

        userEvent.click(yearlyRadioButton)
        expect(mockOnFrequencySelect).toHaveBeenCalledWith('year')
    })

    // Add more test cases as needed
})
