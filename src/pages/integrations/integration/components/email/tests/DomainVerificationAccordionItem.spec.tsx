import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react'
import React from 'react'
import {migrationOutboundVerificationUnverifiedDomain} from 'fixtures/emailMigration'
import {EmailMigrationOutboundVerification} from 'models/integration/types'
import DomainVerificationAccordionItem from '../EmailMigration/DomainVerificationAccordionItem'

jest.mock('../EmailDomainVerification/components/RecordsTable', () => () => (
    <div data-testid="records-table" />
))

const mockCreateDomainVerification = jest.fn()
jest.mock('../hooks/useCreateDomainVerification', () => () => ({
    isLoading: false,
    createDomainVerification: mockCreateDomainVerification,
}))

describe('DomainVerificationAccordionItem', () => {
    const onVerificationMethodSwitch = jest.fn()
    const refreshMigrationData = jest.fn()

    const renderComponent = (
        verification: EmailMigrationOutboundVerification
    ) =>
        render(
            <DomainVerificationAccordionItem
                verification={verification}
                refreshMigrationData={refreshMigrationData}
                onVerificationMethodSwitch={onVerificationMethodSwitch}
            />
        )

    afterEach(cleanup)

    // TODO unskip when single sender verification will be available
    it.skip('should display records table and "switch verification type" button', () => {
        renderComponent(migrationOutboundVerificationUnverifiedDomain)

        expect(screen.getByTestId('records-table')).toBeVisible()
        fireEvent.click(
            screen.getByRole('link', {
                name: /verify emails with your business address/i,
            })
        )
        expect(onVerificationMethodSwitch).toHaveBeenCalled()
    })

    it('should display "Verify Domain" button when domain verification has not started', async () => {
        renderComponent({
            ...migrationOutboundVerificationUnverifiedDomain,
            domain: {},
        })

        const verifyDomainButton = screen.getByRole('button', {
            name: /verify domain/i,
        })

        expect(verifyDomainButton).toBeVisible()

        fireEvent.click(verifyDomainButton)
        expect(mockCreateDomainVerification).toHaveBeenCalled()

        await waitFor(() => expect(refreshMigrationData).toHaveBeenCalled())
    })
})
