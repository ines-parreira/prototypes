import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Cadence } from 'models/billing/types'
import { getCadenceName, isOtherCadenceDowngrade } from 'models/billing/utils'

import BillingFrequency, { BillingFrequencyProps } from '../BillingFrequency'

const getRadioButton = (cadence: Cadence) => {
    // The component used wraps a radio input inside a div with forced aria labels
    // this means getByRole finds multiple, so we need to filter these down to what
    // we are really looking for - i.e. the radio component
    const components = screen.getAllByRole('radio', {
        name: getCadenceName(cadence),
    })
    return components.find((el) => el.getAttribute('type') === 'radio')
}

describe('BillingFrequency', () => {
    const mockOnFrequencySelect = jest.fn()

    const setup = (props?: Partial<BillingFrequencyProps>) => {
        const defaultProps: BillingFrequencyProps = {
            currentCadence: Cadence.Month,
            selectedCadence: Cadence.Month,
            allowDowngrades: false,
            onCadenceSelect: mockOnFrequencySelect,
            ...props,
        }

        return render(<BillingFrequency {...defaultProps} />)
    }

    const cadenceValues = Object.values(Cadence)
    it('assumes correctly the cadence enum is ordered from lowest to highest', () => {
        // This test only exists to ensure the assumption in the component is correct
        // without this test we'd have to either have this logic in the component - which
        // then coverage would object to the `: -1` branch not being covered - or we'd
        // have to blindly trust the assumption, and risk incorrect ordering of radio buttons
        const orderedCadences = Object.values(Cadence).sort((a, b) =>
            isOtherCadenceDowngrade(a, b) ? 1 : -1,
        )
        expect(orderedCadences).toEqual(cadenceValues)
    })

    it('should render correctly', () => {
        setup()

        for (const cadence of cadenceValues) {
            const radioButton = getRadioButton(cadence)
            expect(radioButton).toBeInTheDocument()
        }
    })

    it.each(cadenceValues)(
        'should not allow selection of cadence downgrades when allowDowngrades is false [currentCadence=%s]',
        (currentCadence: Cadence) => {
            setup({
                currentCadence,
                allowDowngrades: false,
            })

            for (const cadence of cadenceValues) {
                const radioButton = getRadioButton(cadence)

                if (isOtherCadenceDowngrade(currentCadence, cadence)) {
                    expect(radioButton).toBeDisabled()
                } else {
                    expect(radioButton).not.toBeDisabled()
                }
            }
        },
    )

    it.each(cadenceValues)(
        'should allow selection of cadence downgrades when allowDowngrades is true [currentCadence=%s]',
        (currentCadence: Cadence) => {
            setup({
                currentCadence,
                allowDowngrades: true,
            })

            for (const cadence of cadenceValues) {
                const radioButton = getRadioButton(cadence)
                expect(radioButton).not.toBeDisabled()
            }
        },
    )

    it.each(cadenceValues)(
        'should not allow selecting disabled cadences [cadence=%s]',
        (cadence: Cadence) => {
            setup({
                disabledCadences: new Set([cadence]),
            })

            const radioButton = getRadioButton(cadence)
            expect(radioButton).toBeDisabled()

            const otherCadenceValues = cadenceValues.filter(
                (value: Cadence) => value !== cadence,
            )
            for (const cadence of otherCadenceValues) {
                const radioButton = getRadioButton(cadence)
                expect(radioButton).not.toBeDisabled()
            }

            expect(
                screen.getByText(
                    `${getCadenceName(cadence)} billing is not available for your current plan configuration.`,
                    { exact: false },
                ),
            ).toBeInTheDocument()
        },
    )

    it('should call onCadenceSelect with the correct values when a radio button is clicked', async () => {
        setup()

        for (const cadence of cadenceValues) {
            const radioButton = getRadioButton(cadence)
            if (!radioButton) continue

            await act(() => userEvent.click(radioButton))
            expect(mockOnFrequencySelect).toHaveBeenCalledWith(cadence)
        }
    })
})
