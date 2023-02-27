import {cleanup, render, screen} from '@testing-library/react'
import React from 'react'
import EmailForwardingButton from '../EmailMigration/EmailForwardingButton'
import * as utils from '../EmailMigration/utils'
import {EmailVerificationStatus} from '../EmailVerificationStatusLabel'

const computeStatusSpy = jest.spyOn(
    utils,
    'computeMigrationInboundVerificationStatus'
)
const lastSentDateSpy = jest.spyOn(utils, 'isLastVerificationEmailJustSent')

describe('EmailForwardingButton', () => {
    const renderComponent = (migration = {}) =>
        render(<EmailForwardingButton migration={migration as any} />)

    afterEach(cleanup)

    it('renders the "Verify forwarding" button if the migration is unverified', () => {
        computeStatusSpy.mockReturnValue(EmailVerificationStatus.Unverified)
        renderComponent()
        expect(screen.getByText('Verify forwarding')).toBeInTheDocument()
    })

    it('renders the "Verifying" button if the last verification email was just sent', () => {
        computeStatusSpy.mockReturnValue(EmailVerificationStatus.Pending)
        lastSentDateSpy.mockReturnValue(true)
        renderComponent()
        expect(screen.getByText('Verifying')).toBeInTheDocument()
    })

    it('renders the "Retry verification" button if the migration is pending and the last verification email was not just sent', () => {
        computeStatusSpy.mockReturnValue(EmailVerificationStatus.Pending)
        lastSentDateSpy.mockReturnValue(false)
        renderComponent()
        expect(screen.getByText('Retry verification')).toBeInTheDocument()
    })
})
