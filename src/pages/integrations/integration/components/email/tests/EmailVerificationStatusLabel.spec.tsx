import {cleanup, render, screen} from '@testing-library/react'
import React, {ComponentProps} from 'react'

import EmailVerificationStatusLabel, {
    EmailVerificationStatus,
} from '../EmailVerificationStatusLabel'

describe('EmailVerificationStatusLabel', () => {
    const renderComponent = (
        props: ComponentProps<typeof EmailVerificationStatusLabel>
    ) => render(<EmailVerificationStatusLabel {...props} />)

    afterEach(cleanup)

    it.each([
        {
            status: EmailVerificationStatus.Unverified,
            icon: 'close',
            label: 'Not verified',
        },
        {
            status: EmailVerificationStatus.Pending,
            icon: 'autorenew',
            label: 'In progress',
        },
        {
            status: EmailVerificationStatus.Failed,
            icon: 'error',
            label: 'Failed',
        },
        {
            status: EmailVerificationStatus.Success,
            icon: 'check_circle',
            label: 'Verified',
        },
    ])('displays correct state', (state) => {
        renderComponent({status: state.status})

        const icon = screen.getByText(state.icon)
        expect(icon).toBeVisible()
        expect(icon).toHaveClass(state.status.toLowerCase())
        expect(screen.getByText(state.label)).toBeVisible()
    })

    it.each(['small', 'normal'] as ComponentProps<
        typeof EmailVerificationStatusLabel
    >['size'][])('should have "size" className', (size) => {
        renderComponent({status: EmailVerificationStatus.Unverified, size})
        expect(screen.getByTestId('email-verification-status')).toHaveClass(
            size as string
        )
    })
})
