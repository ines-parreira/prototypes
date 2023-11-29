import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react'
import React, {ComponentProps} from 'react'
import {
    migrationOutboundVerificationUnverifiedDomain,
    migrationOutboundVerificationVerifiedDomain,
} from 'fixtures/emailMigration'
import {EmailMigrationOutboundVerification} from 'models/integration/types'
import DomainVerificationAccordionItem from '../EmailMigration/DomainVerificationAccordionItem'

jest.mock('../EmailDomainVerification/components/RecordsTable', () => () => (
    <div data-testid="records-table" />
))

jest.mock('@gorgias/analytics-ui-kit', () => ({
    Card: () => <div data-testid="verified-domain-card" />,
}))

const mockCreateDomainVerification = jest.fn()
jest.mock('../hooks/useCreateDomainVerification', () => () => ({
    isLoading: false,
    createDomainVerification: mockCreateDomainVerification,
}))

describe('DomainVerificationAccordionItem', () => {
    const onVerificationMethodSwitch = jest.fn()
    const refreshMigrationData = jest.fn()

    const renderComponent = (
        verification: EmailMigrationOutboundVerification,
        props: Partial<
            ComponentProps<typeof DomainVerificationAccordionItem>
        > = {}
    ) =>
        render(
            <DomainVerificationAccordionItem
                verification={verification}
                refreshMigrationData={refreshMigrationData}
                onVerificationMethodSwitch={onVerificationMethodSwitch}
                isSingleSenderEnabled={true}
                {...props}
            />
        )

    afterEach(cleanup)

    it('should display records table and "switch verification type" button', () => {
        renderComponent(migrationOutboundVerificationUnverifiedDomain)

        expect(screen.getByTestId('records-table')).toBeVisible()
        fireEvent.click(
            screen.getByRole('link', {
                name: /verify emails with your business address/i,
            })
        )
        expect(onVerificationMethodSwitch).toHaveBeenCalled()
    })

    it('should display verified domain card when single sender is verified', () => {
        renderComponent(migrationOutboundVerificationVerifiedDomain, {
            isSingleSenderEnabled: false,
        })
        expect(screen.getByTestId('verified-domain-card')).toBeVisible()
    })

    it('should not display switch verification type button when single sender is disabled', () => {
        renderComponent(migrationOutboundVerificationUnverifiedDomain, {
            isSingleSenderEnabled: false,
        })

        expect(
            screen.queryByRole('link', {
                name: /verify emails with your business address/i,
            })
        ).not.toBeInTheDocument()
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
