import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'

import {migrationOutboundVerificationUnverifiedSingleSender} from 'fixtures/emailMigration'
import {EmailMigrationSenderVerificationIntegration} from 'models/integration/types'
import {VerificationStatus} from 'models/singleSenderVerification/types'
import {mockStore} from 'utils/testing'

import SingleSenderVerificationTableRow from '../EmailMigration/SingleSenderVerificationTableRow'

const mockCreateVerification = jest.fn()
jest.mock('../hooks/useCreateSingleSenderVerification', () => () => ({
    createVerification: mockCreateVerification,
}))

const mockDeleteVerification = jest.fn()
jest.mock('../hooks/useDeleteSingleSenderVerification', () => () => ({
    deleteVerification: mockDeleteVerification,
}))

const mockNewSenderDetails = {
    address: 'address',
    city: 'city',
    country: 'country',
    state: 'state',
    zip: 'zip',
    email: 'email@gorgias.com',
}
jest.mock(
    '../EmailMigration/SingleSenderVerificationFormModal',
    () =>
        ({
            onConfirm,
        }: {
            onConfirm: (values: typeof mockNewSenderDetails) => void
        }) => (
            <div data-testid="single-sender-verification-form-modal">
                <button
                    data-testid="confirm-submit-details-button"
                    onClick={() => onConfirm(mockNewSenderDetails)}
                >
                    confirm
                </button>
            </div>
        )
)

const failedIntegration = {
    ...migrationOutboundVerificationUnverifiedSingleSender.integrations[0],
    sender_verification: {
        ...migrationOutboundVerificationUnverifiedSingleSender.integrations[0]
            .sender_verification,
        status: VerificationStatus.Failed,
    },
} as EmailMigrationSenderVerificationIntegration

const pendingIntegration =
    migrationOutboundVerificationUnverifiedSingleSender.integrations[0]

const unverifiedIntegration = {
    ...migrationOutboundVerificationUnverifiedSingleSender.integrations[0],
    sender_verification: {},
} as EmailMigrationSenderVerificationIntegration

describe('SingleSenderVerificationTableRow', () => {
    const refreshMigrationData = jest.fn()

    const renderComponent = (
        props: Partial<ComponentProps<typeof SingleSenderVerificationTableRow>>
    ) =>
        render(
            <Provider store={mockStore({} as any)}>
                <SingleSenderVerificationTableRow
                    refreshMigrationData={refreshMigrationData}
                    hasSubmittedBulkVerification={false}
                    integration={unverifiedIntegration}
                    {...props}
                />
            </Provider>
        )

    afterEach(() => {
        cleanup()
        jest.resetAllMocks()
    })

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
        async (integration) => {
            renderComponent({integration})

            const toggleButton = screen.getByTestId(
                'toggle-sender-details-visible'
            )

            fireEvent.click(toggleButton)
            /* address container should be visible */
            expect(screen.getByTestId('address-container')).toBeVisible()
            /* delete button should be visible */
            fireEvent.click(
                screen.getByRole('button', {name: /delete verification/i})
            )
            fireEvent.click(screen.getByTestId('confirm-delete-button'))

            expect(mockDeleteVerification).toHaveBeenCalledWith(integration.id)

            await waitFor(() => {
                expect(refreshMigrationData).toHaveBeenCalledTimes(1)
            })
        }
    )

    it('should display retry button when status is failed', async () => {
        renderComponent({
            integration: failedIntegration,
            hasSubmittedBulkVerification: true,
        })

        fireEvent.click(
            screen.getByRole('button', {name: /retry verification/i})
        )

        const {address, city, state, zip, country, email} =
            failedIntegration.sender_verification!
        expect(mockCreateVerification).toHaveBeenCalledWith(
            failedIntegration.id,
            {address, city, state, zip, country, email}
        )

        await waitFor(() => {
            expect(refreshMigrationData).toHaveBeenCalledTimes(1)
        })
    })

    it('should be able to submit address when sender details do not exist', () => {
        renderComponent({
            integration: unverifiedIntegration,
            hasSubmittedBulkVerification: true,
        })
        expect(
            screen.getByRole('button', {name: /submit address/i})
        ).toBeVisible()
        fireEvent.click(screen.getByTestId('confirm-submit-details-button'))
        expect(mockCreateVerification).toHaveBeenCalledWith(
            unverifiedIntegration.id,
            mockNewSenderDetails
        )
    })
})
