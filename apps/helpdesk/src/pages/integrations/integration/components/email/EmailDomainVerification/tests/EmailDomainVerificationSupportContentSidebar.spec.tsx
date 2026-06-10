import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import EmailDomainVerificationSupportContentSidebar from '../EmailDomainVerificationSupportContentSidebar'

describe('EmailDomainVerificationSupportContentSidebar', () => {
    const renderComponent = () =>
        render(<EmailDomainVerificationSupportContentSidebar />)

    it('default state - should display dropdown, default selection and links', () => {
        renderComponent()

        const combobox = screen.getByRole('combobox', {
            name: 'Domain verification guide',
        })
        expect(combobox).toHaveTextContent('Standard guidelines')

        expect(screen.getByText('Verify Your Email Domain')).toBeInTheDocument()
        expect(screen.getByText('Domain Verification FAQs')).toBeInTheDocument()
    })

    it('should update the selection based on dropdown choice', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(
            screen.getByRole('combobox', { name: 'Domain verification guide' }),
        )
        await user.click(await screen.findByRole('option', { name: 'GoDaddy' }))

        expect(
            screen.getByRole('combobox', { name: 'Domain verification guide' }),
        ).toHaveTextContent('GoDaddy')

        expect(screen.getByText('Verify Your Email Domain')).toBeInTheDocument()
        expect(screen.getByText('Domain Verification FAQs')).toBeInTheDocument()
    })

    it('should display all options in the dropdown', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(
            screen.getByRole('combobox', { name: 'Domain verification guide' }),
        )

        expect(await screen.findAllByRole('option')).toHaveLength(11)
    })
})
