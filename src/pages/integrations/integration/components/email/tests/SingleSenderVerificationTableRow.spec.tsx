import {cleanup, fireEvent, render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import React, {ComponentProps} from 'react'
import {mockStore} from 'utils/testing'
import {migrationOutboundVerificationUnverifiedSingleSender} from 'fixtures/emailMigration'
import {VerificationStatus} from 'models/singleSenderVerification/types'
import SingleSenderVerificationTableRow from '../EmailMigration/SingleSenderVerificationTableRow'

const failedIntegration = {
    ...migrationOutboundVerificationUnverifiedSingleSender.integrations[0],
    sender_verification: {
        ...migrationOutboundVerificationUnverifiedSingleSender.integrations[0]
            .sender_verification,
        status: VerificationStatus.Failed,
    },
} as any

const pendingIntegration =
    migrationOutboundVerificationUnverifiedSingleSender.integrations[0]

const unverifiedIntegration = {
    ...migrationOutboundVerificationUnverifiedSingleSender.integrations[0],
    sender_verification: {},
} as any

describe('SingleSenderVerificationTableRow', () => {
    const renderComponent = (
        props: Partial<ComponentProps<typeof SingleSenderVerificationTableRow>>
    ) =>
        render(
            <Provider store={mockStore({} as any)}>
                <SingleSenderVerificationTableRow
                    hasSubmittedBulkVerification={false}
                    integration={unverifiedIntegration}
                    {...props}
                />
            </Provider>
        )

    afterEach(cleanup)

    it('should display email verification status', () => {
        renderComponent({
            integration:
                migrationOutboundVerificationUnverifiedSingleSender
                    .integrations[0],
        })
        expect(screen.getByTestId('email-verification-status')).toBeVisible()
    })

    it.each([failedIntegration, pendingIntegration])(
        'should display button to expand sender details when status is %s',
        (integration) => {
            renderComponent({integration})
            const toggleButton = screen.getByTestId(
                'toggle-sender-details-visible'
            )
            fireEvent.click(toggleButton)
            /* address container should be visible */
            expect(screen.getByTestId('address-container')).toBeVisible()
            /* delete button should be visible */
            expect(
                screen.getByRole('button', {name: /delete verification/i})
            ).toBeVisible()
        }
    )

    it('should display retry button when status is failed', () => {
        renderComponent({
            integration: failedIntegration,
            hasSubmittedBulkVerification: true,
        })
        expect(
            screen.getByRole('button', {name: /retry verification/i})
        ).toBeVisible()
    })

    it('should be able to submit address when sender details do not exist', () => {
        renderComponent({
            integration: unverifiedIntegration,
            hasSubmittedBulkVerification: true,
        })
        expect(
            screen.getByRole('button', {name: /submit address/i})
        ).toBeVisible()
    })
})
