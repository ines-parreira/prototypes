import React from 'react'

import { render } from '@testing-library/react'

import Disclaimer from '../Disclaimer'

describe('Disclaimer', () => {
    it('renders the disclaimer', () => {
        const mockOnChange = jest.fn()
        const { getByRole } = render(
            <Disclaimer agreementChecked={false} onChange={mockOnChange} />,
        )

        const masterSubscriptionAgreementLinkElement = getByRole('link', {
            name: 'Agreement',
        })
        expect(masterSubscriptionAgreementLinkElement).toBeInTheDocument()
        expect(masterSubscriptionAgreementLinkElement).toHaveAttribute(
            'href',
            'https://www.gorgias.com/legal/master-subscription-agreement',
        )

        const checkboxElement = getByRole('checkbox', {
            name:
                'Gorgias is not required to issue you a refund when cancelling Services (as provided in our Agreement ). ' +
                'Additionally, if you cancel your Subscription, you are required to pay any fees and/or overages ' +
                'incurred before your cancellation takes effect.',
        })
        expect(checkboxElement).toBeInTheDocument()
        expect(checkboxElement).not.toBeChecked()

        checkboxElement.click()
        expect(mockOnChange).toHaveBeenCalledWith(true)
    })
})
