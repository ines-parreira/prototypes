import React from 'react'

import { cleanup, render, screen } from '@testing-library/react'

import type { EmailMigrationInboundVerification } from 'models/integration/types'
import { EmailMigrationInboundVerificationStatus } from 'models/integration/types'

import EmailForwardingTable from '../EmailMigration/EmailForwardingTable'

jest.mock('fixtures/emailMigration.ts', () => ({ migrations: undefined }))

const mockMigrations = [
    {
        integration: {
            id: 1,
            meta: {
                address: 'support1@customer.com',
            },
        },
        status: EmailMigrationInboundVerificationStatus.Initiated,
    },
    {
        integration: {
            id: 2,
            meta: {
                address: 'support2@customer.com',
            },
        },
        status: EmailMigrationInboundVerificationStatus.InboundPartialSuccess,
    },
] as unknown as EmailMigrationInboundVerification[]

jest.mock('../EmailMigration/EmailForwardingButton', () => () => (
    <div data-testid="cta" />
))

describe('EmailForwardingTable', () => {
    const renderComponent = (migrations = mockMigrations) => {
        return render(<EmailForwardingTable migrations={migrations} />)
    }

    afterEach(cleanup)

    it('renders the email address for each migration', () => {
        renderComponent()
        mockMigrations.forEach((migration) => {
            expect(
                screen.getByText(migration.integration.meta.address),
            ).toBeInTheDocument()
        })
    })

    it('renders the verification status for each migration', () => {
        renderComponent()
        const verificationStatuses = screen.getAllByTestId(
            'email-verification-status',
        )
        expect(verificationStatuses.length).toBe(mockMigrations.length)
    })

    it('renders the CTA for each migration', () => {
        renderComponent()
        const forwardingButtons = screen.getAllByTestId('cta')
        expect(forwardingButtons.length).toBe(mockMigrations.length)
    })

    it('renders the empty state row when there are no unverified migrations', () => {
        renderComponent([])
        expect(
            screen.getByText(
                "All set! You don't have any email forwarding to set up.",
            ),
        )
    })
})
