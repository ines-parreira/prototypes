import React, { ComponentProps } from 'react'

import {
    cleanup,
    fireEvent,
    render,
    screen,
    within,
} from '@testing-library/react'
import { Provider } from 'react-redux'

import {
    migrationOutboundVerificationNotStarted,
    migrationOutboundVerificationUnverifiedDomain,
    migrationOutboundVerificationVerifiedDomain,
} from 'fixtures/emailMigration'
import * as useLocalStorageImports from 'hooks/useLocalStorage'
import {
    EmailMigrationOutboundVerification,
    OutboundVerificationType,
} from 'models/integration/types'
import { mockStore } from 'utils/testing'

import DomainVerificationAccordionItem from '../EmailMigration/DomainVerificationAccordionItem'
import MigrationDomainList from '../EmailMigration/MigrationDomainList'
import SingleSenderVerificationAccordionItem from '../EmailMigration/SingleSenderVerificationAccordionItem'

const useLocalStorageSpy = jest.spyOn(
    useLocalStorageImports,
    'default',
) as jest.Mock

jest.mock(
    '../EmailMigration/DomainVerificationAccordionItem',
    () =>
        ({
            verification,
            onVerificationMethodSwitch,
        }: ComponentProps<typeof DomainVerificationAccordionItem>) => (
            <div data-testid="domain-accordion">
                <button
                    onClick={() =>
                        onVerificationMethodSwitch(verification.name)
                    }
                >
                    verify
                </button>
            </div>
        ),
)

jest.mock(
    '../EmailMigration/SingleSenderVerificationAccordionItem',
    () =>
        ({
            verification,
            onVerificationMethodSwitch,
        }: ComponentProps<typeof SingleSenderVerificationAccordionItem>) => (
            <div data-testid="single-sender-accordion">
                <button
                    onClick={() =>
                        onVerificationMethodSwitch(verification.name)
                    }
                >
                    verify
                </button>
            </div>
        ),
)

describe('MigrationDomainList', () => {
    const renderComponent = (domains: EmailMigrationOutboundVerification[]) =>
        render(
            <Provider store={mockStore({} as any)}>
                <MigrationDomainList
                    domains={domains}
                    refreshMigrationData={jest.fn()}
                />
            </Provider>,
        )

    afterEach(cleanup)

    it('should render all domains', () => {
        renderComponent([
            migrationOutboundVerificationUnverifiedDomain,
            migrationOutboundVerificationVerifiedDomain,
        ])
        expect(screen.getAllByTestId('domain-accordion')).toHaveLength(2)
    })

    // TODO unskip when single sender verification is ready
    it.skip('should render correct verification type based on selected option', () => {
        const mockSelectedVerificationType = {
            [migrationOutboundVerificationNotStarted.name]: undefined,
            [migrationOutboundVerificationVerifiedDomain.name]:
                OutboundVerificationType.Domain,
            [migrationOutboundVerificationUnverifiedDomain.name]:
                OutboundVerificationType.SingleSender,
        }
        const mockSetSelectedVerificationType = jest.fn()
        useLocalStorageSpy.mockReturnValue([
            mockSelectedVerificationType,
            mockSetSelectedVerificationType,
        ])
        renderComponent([
            migrationOutboundVerificationNotStarted,
            migrationOutboundVerificationVerifiedDomain,
            migrationOutboundVerificationUnverifiedDomain,
        ])

        expect(screen.getAllByTestId('domain-accordion')).toHaveLength(2)

        /* selected type: undefined -> switch to Single Sender verification */
        let verifyButton = within(
            screen.getAllByTestId('domain-accordion')[0],
        ).getByRole('button', {
            name: /verify/i,
        })
        fireEvent.click(verifyButton)
        expect(mockSetSelectedVerificationType).toHaveBeenLastCalledWith({
            ...mockSelectedVerificationType,
            [migrationOutboundVerificationNotStarted.name]:
                OutboundVerificationType.SingleSender,
        })

        /* selected type: Domain verification -> switch to Single Sender verification */
        verifyButton = within(
            screen.getAllByTestId('domain-accordion')[1],
        ).getByRole('button', {
            name: /verify/i,
        })
        fireEvent.click(verifyButton)
        expect(mockSetSelectedVerificationType).toHaveBeenLastCalledWith({
            ...mockSelectedVerificationType,
            [migrationOutboundVerificationVerifiedDomain.name]:
                OutboundVerificationType.SingleSender,
        })

        /* selected type: Single Sender verification -> switch to Domain verification */
        verifyButton = within(
            screen.getAllByTestId('single-sender-accordion')[0],
        ).getByRole('button', {
            name: /verify/i,
        })
        fireEvent.click(verifyButton)
        expect(mockSetSelectedVerificationType).toHaveBeenLastCalledWith({
            ...mockSelectedVerificationType,
            [migrationOutboundVerificationUnverifiedDomain.name]:
                OutboundVerificationType.Domain,
        })
    })
})
