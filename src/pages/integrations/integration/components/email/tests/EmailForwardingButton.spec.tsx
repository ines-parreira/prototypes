import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import MockAdapter from 'axios-mock-adapter'
import {mockStore} from 'utils/testing'
import client from 'models/api/resources'
import {EmailMigrationInboundVerificationStatus} from 'models/integration/types'
import {UPDATE_EMAIL_MIGRATION_VERIFICATION_STATUS} from 'state/integrations/constants'
import EmailForwardingButton from '../EmailMigration/EmailForwardingButton'
import * as utils from '../EmailMigration/utils'
import {EmailVerificationStatus} from '../EmailVerificationStatusLabel'

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

const serverMock = new MockAdapter(client)
const computeStatusSpy = jest.spyOn(
    utils,
    'computeMigrationInboundVerificationStatus'
)

const mockMigration = {integration: {id: 1, meta: {}}}

describe('EmailForwardingButton', () => {
    const renderComponent = (migration = mockMigration) =>
        render(
            <Provider store={mockStore({} as any)}>
                <EmailForwardingButton migration={migration as any} />
            </Provider>
        )

    afterEach(cleanup)

    it('Unverified status - "Verify forwarding" button', () => {
        computeStatusSpy.mockReturnValue(EmailVerificationStatus.Unverified)
        renderComponent()
        expect(screen.getByText('Verify forwarding')).toBeInTheDocument()
    })

    it.each`
        status                                | buttonText
        ${EmailVerificationStatus.Unverified} | ${'Verify forwarding'}
        ${EmailVerificationStatus.Failed}     | ${'Retry verification'}
    `(
        'Should display "$buttonText" when status is "$status" and call verify',
        async ({status, buttonText}) => {
            computeStatusSpy.mockReturnValue(status)
            serverMock
                .onPost(`/integrations/email/1/migration/verify`)
                .reply(200, {
                    status: EmailMigrationInboundVerificationStatus.InboundPending,
                })
            renderComponent()

            fireEvent.click(screen.getByText(buttonText))
            await waitFor(() =>
                expect(mockedDispatch).toHaveBeenCalledWith({
                    type: UPDATE_EMAIL_MIGRATION_VERIFICATION_STATUS,
                    integrationId: 1,
                    emailMigrationVerificationStatus:
                        EmailMigrationInboundVerificationStatus.InboundPending,
                })
            )
        }
    )
})
