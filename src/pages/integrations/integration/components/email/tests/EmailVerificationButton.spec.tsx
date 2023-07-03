import {cleanup, fireEvent, render, screen} from '@testing-library/react'
import React, {ComponentProps} from 'react'
import EmailVerificationButton from '../EmailMigration/EmailVerificationButton'
import {EmailVerificationStatus} from '../EmailVerificationStatusLabel'

const commonProps = {
    isLoading: false,
    onLinkButtonClick: jest.fn(),
    onRetryClick: jest.fn(),
}

describe('EmailVerificationButton', () => {
    const renderComponent = (
        props: ComponentProps<typeof EmailVerificationButton>
    ) => render(<EmailVerificationButton {...props} />)

    afterEach(() => {
        cleanup()
        jest.resetAllMocks()
    })

    it('should display "Verify forwarding" button when status is Unverified', () => {
        renderComponent({
            ...commonProps,
            status: EmailVerificationStatus.Unverified,
        })
        const button = screen.getByRole('button', {name: 'Verify forwarding'})
        fireEvent.click(button)
        expect(commonProps.onLinkButtonClick).toHaveBeenCalledTimes(1)
    })

    it('should display "Custom Text" button when status is Unverified and linkButtonText is passed', () => {
        renderComponent({
            ...commonProps,
            status: EmailVerificationStatus.Unverified,
            linkButtonText: 'Custom Text',
        })
        const button = screen.getByRole('button', {name: 'Custom Text'})
        fireEvent.click(button)
        expect(commonProps.onLinkButtonClick).toHaveBeenCalledTimes(1)
    })

    it('should display "Retry verification" button when status is Failed', () => {
        renderComponent({
            ...commonProps,
            status: EmailVerificationStatus.Failed,
        })
        const button = screen.getByRole('button', {name: /retry verification/i})
        fireEvent.click(button)
        expect(commonProps.onRetryClick).toHaveBeenCalled()
    })

    it('should display "Verifying" button when status is Pending', () => {
        renderComponent({
            ...commonProps,
            status: EmailVerificationStatus.Pending,
        })
        const button = screen.getByRole('button', {name: /verifying/i})
        expect(button).toHaveAttribute('aria-disabled', 'true')
    })
})
