import React from 'react'

import { fireEvent, render } from '@testing-library/react'

import { Cadence } from 'models/billing/types'

import BillingFrequency, { BillingFrequencyProps } from '../BillingFrequency'

describe('BillingFrequency', () => {
    const mockSelectedCadence = Cadence.Month
    const mockOnFrequencySelect = jest.fn()

    const setup = (props?: Partial<BillingFrequencyProps>) => {
        const defaultProps: BillingFrequencyProps = {
            selectedCadence: mockSelectedCadence,
            onCadenceSelect: mockOnFrequencySelect,
            ...props,
        }

        return render(<BillingFrequency {...defaultProps} />)
    }

    it('should render correctly', () => {
        const { getByText } = setup()
        expect(getByText('Monthly')).toBeInTheDocument()
        expect(getByText('Yearly')).toBeInTheDocument()
    })

    it('should call setSelectedCadence and setSelectedPlans with the correct values when a radio button is clicked', () => {
        const { getByLabelText } = setup()
        const monthlyRadioButton = getByLabelText('Monthly', {
            selector: 'input',
        })
        const yearlyRadioButton = getByLabelText('Yearly', {
            selector: 'input',
        })

        fireEvent.click(monthlyRadioButton)
        expect(mockOnFrequencySelect).toHaveBeenCalledWith('month')

        fireEvent.click(yearlyRadioButton)
        expect(mockOnFrequencySelect).toHaveBeenCalledWith('year')
    })

    it('should show text when monthly billing is not available', () => {
        const { getByLabelText, container } = setup({
            disabledCadences: new Set([Cadence.Month]),
        })
        const monthlyRadioButton = getByLabelText('Monthly', {
            selector: 'input',
        })
        const yearlyRadioButton = getByLabelText('Yearly', {
            selector: 'input',
        })

        fireEvent.click(yearlyRadioButton)
        expect(mockOnFrequencySelect).toHaveBeenCalledWith('year')

        expect(monthlyRadioButton).toBeDisabled()
        expect(
            container.getElementsByClassName('disabledMessage')[0].textContent,
        ).toContain(
            'Monthly billing is not available for your current plan configuration.',
        )
    })

    it('should show text when yearly billing is not available', () => {
        const { getByLabelText, container } = setup({
            disabledCadences: new Set([Cadence.Year]),
        })
        const monthlyRadioButton = getByLabelText('Monthly', {
            selector: 'input',
        })
        const yearlyRadioButton = getByLabelText('Yearly', {
            selector: 'input',
        })

        fireEvent.click(monthlyRadioButton)
        expect(mockOnFrequencySelect).toHaveBeenCalledWith('month')

        expect(yearlyRadioButton).toBeDisabled()
        expect(
            container.getElementsByClassName('disabledMessage')[0].textContent,
        ).toContain(
            'Yearly billing is not available for your current plan configuration.',
        )
    })
})
