import React from 'react'

import { render, screen } from '@testing-library/react'

import EmailPreview from 'pages/integrations/integration/components/email/CustomerOnboarding/EmailForwarding/EmailPreview'

describe('<EmailPreview />', () => {
    const validProps = {
        displayName: 'John Doe',
        emailAddress: 'john.doe@example.com',
    }

    const emptyProps = {
        displayName: '',
        emailAddress: '',
    }

    it('should render the email preview with default values when no props are provided', () => {
        render(<EmailPreview />)

        expect(
            screen.getByRole('heading', { name: 'Email preview' }),
        ).toBeInTheDocument()
        expect(screen.getByText('New message')).toBeInTheDocument()
        expect(screen.getByText('From')).toBeInTheDocument()
        expect(screen.getByText('To')).toBeInTheDocument()
        expect(screen.getByText('<Display name> (<>)')).toBeInTheDocument()
        expect(
            screen.getByText('Customer name (customer@email.com)'),
        ).toBeInTheDocument()
    })

    it('should render with only display name provided', () => {
        render(<EmailPreview {...validProps} emailAddress="" />)

        expect(
            screen.getByRole('heading', { name: 'Email preview' }),
        ).toBeInTheDocument()
        expect(screen.getByText('New message')).toBeInTheDocument()
        expect(screen.getByText('John Doe(<>)')).toBeInTheDocument()
        expect(
            screen.getByText('Customer name (customer@email.com)'),
        ).toBeInTheDocument()
    })

    it('should render with only email address provided', () => {
        render(<EmailPreview {...validProps} displayName="" />)

        expect(
            screen.getByRole('heading', { name: 'Email preview' }),
        ).toBeInTheDocument()
        expect(screen.getByText('New message')).toBeInTheDocument()
        expect(
            screen.getByText('<Display name> (john.doe@example.com)'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Customer name (customer@email.com)'),
        ).toBeInTheDocument()
    })

    it('should render with both display name and email address provided', () => {
        render(<EmailPreview {...validProps} />)

        expect(
            screen.getByRole('heading', { name: 'Email preview' }),
        ).toBeInTheDocument()
        expect(screen.getByText('New message')).toBeInTheDocument()
        expect(
            screen.getByText('John Doe (john.doe@example.com)'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Customer name (customer@email.com)'),
        ).toBeInTheDocument()
    })

    it('should render with empty string values', () => {
        render(<EmailPreview {...emptyProps} />)

        expect(
            screen.getByRole('heading', { name: 'Email preview' }),
        ).toBeInTheDocument()
        expect(screen.getByText('New message')).toBeInTheDocument()
        expect(screen.getByText('<Display name> (<>)')).toBeInTheDocument()
        expect(
            screen.getByText('Customer name (customer@email.com)'),
        ).toBeInTheDocument()
    })

    it('should render the email icon', () => {
        render(<EmailPreview />)

        expect(screen.getByText('email')).toBeInTheDocument()
    })

    it('should render the correct structure', () => {
        const { container } = render(<EmailPreview {...validProps} />)

        expect(container.querySelector('h6')).toBeInTheDocument()
        expect(
            screen.getByRole('heading', { name: 'Email preview' }),
        ).toBeInTheDocument()
        expect(screen.getByText('New message')).toBeInTheDocument()
        expect(screen.getByText('From')).toBeInTheDocument()
        expect(screen.getByText('To')).toBeInTheDocument()
    })

    it('should always render the same To field regardless of props', () => {
        const { rerender } = render(<EmailPreview />)
        expect(
            screen.getByText('Customer name (customer@email.com)'),
        ).toBeInTheDocument()

        rerender(<EmailPreview {...validProps} />)
        expect(
            screen.getByText('Customer name (customer@email.com)'),
        ).toBeInTheDocument()
    })

    it('should handle special characters in display name and email', () => {
        const specialProps = {
            displayName: "John O'Connor & Co.",
            emailAddress: 'john+test@example-site.com',
        }
        render(<EmailPreview {...specialProps} />)

        expect(
            screen.getByText(
                `${specialProps.displayName} (${specialProps.emailAddress})`,
            ),
        ).toBeInTheDocument()
    })
})
