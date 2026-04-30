import React from 'react'

import { render } from '@repo/testing'
import { cleanup, screen } from '@testing-library/react'

import {
    migrationOutboundVerificationUnverifiedSingleSender,
    migrationOutboundVerificationVerifiedSingleSender,
} from 'fixtures/emailMigration'
import type { EmailMigrationOutboundVerification } from 'models/integration/types'

import SingleSenderVerificationAccordionItem from '../EmailMigration/SingleSenderVerificationAccordionItem'

jest.mock('@gorgias/analytics-ui-kit', () => ({
    Card: () => <div data-testid="verified-domain-card" />,
}))

describe('SingleSenderVerificationAccordionItem', () => {
    const renderComponent = (
        verification: EmailMigrationOutboundVerification,
    ) =>
        render(
            <SingleSenderVerificationAccordionItem
                verification={verification}
                onVerificationMethodSwitch={jest.fn()}
                onBulkSubmitClick={jest.fn()}
                refreshMigrationData={jest.fn()}
            />,
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
