import React from 'react'

import { cleanup, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'

import {
    migrationOutboundVerificationUnverifiedSingleSender,
    migrationOutboundVerificationVerifiedSingleSender,
} from 'fixtures/emailMigration'
import { EmailMigrationOutboundVerification } from 'models/integration/types'
import { mockStore } from 'utils/testing'

import SingleSenderVerificationAccordionItem from '../EmailMigration/SingleSenderVerificationAccordionItem'

jest.mock('@gorgias/analytics-ui-kit', () => ({
    Card: () => <div data-testid="verified-domain-card" />,
}))

describe('SingleSenderVerificationAccordionItem', () => {
    const renderComponent = (
        verification: EmailMigrationOutboundVerification,
    ) =>
        render(
            <Provider store={mockStore({} as any)}>
                <SingleSenderVerificationAccordionItem
                    verification={verification}
                    onVerificationMethodSwitch={jest.fn()}
                    onBulkSubmitClick={jest.fn()}
                    refreshMigrationData={jest.fn()}
                />
            </Provider>,
        )

    afterEach(cleanup)

    it('should display verified domain card when single sender is verified', () => {
        renderComponent(migrationOutboundVerificationVerifiedSingleSender)
        expect(screen.getByTestId('verified-domain-card')).toBeVisible()
    })

    it('should not display verified domain card when single sender is verified', () => {
        renderComponent(migrationOutboundVerificationUnverifiedSingleSender)
        expect(
            screen.queryByTestId('verified-domain-card'),
        ).not.toBeInTheDocument()
    })
})
