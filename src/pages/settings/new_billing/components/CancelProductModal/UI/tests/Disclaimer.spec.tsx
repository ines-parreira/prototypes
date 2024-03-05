import {render} from '@testing-library/react'
import React from 'react'
import Disclaimer from '../Disclaimer'

describe('Disclaimer', () => {
    it('renders the disclaimer', () => {
        const mockOnChange = jest.fn()
        const {getByText, getByRole} = render(
            <Disclaimer agreementChecked={false} onChange={mockOnChange} />
        )
        const disclaimerContentElement = getByText(
            "Note that previous charges won't be refunded when you cancel " +
                'unless it is legally required. All amounts shown are in USD.'
        )
        expect(disclaimerContentElement).toBeInTheDocument()

        const masterSubscriptionAgreementLinkElement = getByRole('link', {
            name: 'Master Subscription Agreement',
        })
        expect(masterSubscriptionAgreementLinkElement).toBeInTheDocument()
        expect(masterSubscriptionAgreementLinkElement).toHaveAttribute(
            'href',
            'https://www.gorgias.com/legal/master-subscription-agreement'
        )

        const termsLinkElement = getByRole('link', {name: 'Terms'})
        expect(termsLinkElement).toBeInTheDocument()
        expect(termsLinkElement).toHaveAttribute(
            'href',
            'https://www.gorgias.com/legal/terms-of-use'
        )

        const privacyPolicyLinkElement = getByRole('link', {
            name: 'Privacy Policy',
        })
        expect(privacyPolicyLinkElement).toBeInTheDocument()
        expect(privacyPolicyLinkElement).toHaveAttribute(
            'href',
            'https://www.gorgias.com/legal/privacy'
        )

        const checkboxElement = getByRole('checkbox', {
            name:
                'I agree to the Gorgias Master Subscription Agreement and Terms . ' +
                'Learn about how we use and protect your data in our Privacy Policy .',
        })
        expect(checkboxElement).toBeInTheDocument()
        expect(checkboxElement).not.toBeChecked()

        checkboxElement.click()
        expect(mockOnChange).toHaveBeenCalledWith(true)
    })
})
