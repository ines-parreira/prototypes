import React from 'react'

import client from '@repo/api-resources'
import { render } from '@repo/testing'
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'

import { toast } from '@gorgias/axiom'

import { EmailMigrationInboundVerificationStatus } from 'models/integration/types'
import { UPDATE_EMAIL_MIGRATION_VERIFICATION_STATUS } from 'state/integrations/constants'

import EmailForwardingButton from '../EmailMigration/EmailForwardingButton'
import * as utils from '../EmailMigration/utils'
import { EmailVerificationStatus } from '../EmailVerificationStatusLabel'

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

jest.mock('@gorgias/axiom', () => {
    const actual = jest.requireActual('@gorgias/axiom')
    const toastMock = Object.assign(jest.fn(), {
        info: jest.fn(),
        success: jest.fn(),
        warning: jest.fn(),
        error: jest.fn(),
        ai: jest.fn(),
        promise: jest.fn(),
        dismiss: jest.fn(),
    })
    return {
        ...actual,
        toast: toastMock,
    }
})

const serverMock = new MockAdapter(client)
const computeStatusSpy = jest.spyOn(
    utils,
    'computeMigrationInboundVerificationStatus',
)

const mockMigration = {
    integration: { id: 1, meta: { address: 'test@gorgias.com' } },
}

describe('EmailForwardingButton', () => {
    const renderComponent = (migration = mockMigration) =>
        render(<EmailForwardingButton migration={migration as any} />)

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
        async ({ status, buttonText }) => {
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
                }),
            )
            expect(toast.info).toHaveBeenCalledWith(
                'Verifying forwarding for test@gorgias.com. This may take several minutes.',
            )
        },
    )

    it('Should call toast.error when verifying integration fails', async () => {
        computeStatusSpy.mockReturnValue(EmailVerificationStatus.Unverified)
        serverMock.onPost(`/integrations/email/1/migration/verify`).reply(400, {
            error: { msg: 'Verification failed' },
        })
        renderComponent()

        fireEvent.click(screen.getByText('Verify forwarding'))

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Verification failed')
        })
    })
})
