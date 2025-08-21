import { fireEvent, render } from '@testing-library/react'

import { Cadence, cadenceNames } from 'models/billing/types'

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
        expect(getByText(cadenceNames[Cadence.Month])).toBeInTheDocument()
        expect(getByText(cadenceNames[Cadence.Year])).toBeInTheDocument()
    })

    it('should call setSelectedCadence and setSelectedPlans with the correct values when a radio button is clicked', () => {
        const { getByLabelText } = setup()
        const monthlyRadioButton = getByLabelText(cadenceNames[Cadence.Month], {
            selector: 'input',
        })
        const yearlyRadioButton = getByLabelText(cadenceNames[Cadence.Year], {
            selector: 'input',
        })

        fireEvent.click(monthlyRadioButton)
        expect(mockOnFrequencySelect).toHaveBeenCalledWith(Cadence.Month)

        fireEvent.click(yearlyRadioButton)
        expect(mockOnFrequencySelect).toHaveBeenCalledWith(Cadence.Year)
    })

    it('should show text when monthly billing is not available', () => {
        const { getByLabelText, container } = setup({
            disabledCadences: new Set([Cadence.Month]),
        })
        const monthlyRadioButton = getByLabelText(cadenceNames[Cadence.Month], {
            selector: 'input',
        })
        const yearlyRadioButton = getByLabelText(cadenceNames[Cadence.Year], {
            selector: 'input',
        })

        fireEvent.click(yearlyRadioButton)
        expect(mockOnFrequencySelect).toHaveBeenCalledWith(Cadence.Year)

        expect(monthlyRadioButton).toBeDisabled()
        expect(
            container.getElementsByClassName('disabledMessage')[0].textContent,
        ).toContain(
            `${cadenceNames[Cadence.Month]} billing is not available for your current plan configuration.`,
        )
    })

    it('should show text when yearly billing is not available', () => {
        const { getByLabelText, container } = setup({
            disabledCadences: new Set([Cadence.Year]),
        })
        const monthlyRadioButton = getByLabelText(cadenceNames[Cadence.Month], {
            selector: 'input',
        })
        const yearlyRadioButton = getByLabelText(cadenceNames[Cadence.Year], {
            selector: 'input',
        })

        fireEvent.click(monthlyRadioButton)
        expect(mockOnFrequencySelect).toHaveBeenCalledWith(Cadence.Month)

        expect(yearlyRadioButton).toBeDisabled()
        expect(
            container.getElementsByClassName('disabledMessage')[0].textContent,
        ).toContain(
            `${cadenceNames[Cadence.Year]} billing is not available for your current plan configuration.`,
        )
    })
})
