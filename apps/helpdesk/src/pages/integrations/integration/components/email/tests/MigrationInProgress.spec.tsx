import React from 'react'

import client from '@repo/api-resources'
import { render } from '@repo/testing'
import { cleanup, screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'

import { toast } from '@gorgias/axiom'

import type { EmailMigrationInboundVerification } from 'models/integration/types'

import MigrationInProgress from '../EmailMigration/MigrationInProgress'
import * as migrationUtils from '../EmailMigration/utils'

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

const getInboundUnverifiedMigrationsSpy = jest.spyOn(
    migrationUtils,
    'getInboundUnverifiedMigrations',
)

const migration = {
    integration: { meta: {} },
} as unknown as EmailMigrationInboundVerification

jest.mock('../EmailMigration/MigrationEmailForwarding', () => () => (
    <div data-testid="migration-email-forwarding" />
))

describe('MigrationInProgress', () => {
    const mockServer = new MockAdapter(client)
    mockServer.onGet('/integrations/email/migration/integrations').reply(200, {
        data: [migration],
    })

    const renderComponent = () =>
        render(<MigrationInProgress />, {
            storeState: {
                integrations: fromJS({
                    migrations: { email: [migration] },
                }),
            } as any,
        })

    afterEach(cleanup)

    it('should default to Email Forwarding step when there are inbound unverified integrations', async () => {
        getInboundUnverifiedMigrationsSpy.mockReturnValue([migration as any])
        renderComponent()

        await screen.findByTestId('migration-pending')
        expect(screen.getByTestId('migration-email-forwarding')).toBeVisible()
    })

    it('should default to Domain Verification step when there are no inbound unverified integrations', async () => {
        getInboundUnverifiedMigrationsSpy.mockImplementation(() => [])
        renderComponent()

        await screen.findByTestId('migration-pending')
        expect(
            screen.getByTestId('migration-domain-verification'),
        ).toBeVisible()
    })

    it('should call toast.error when fetching migrations fails', async () => {
        const failingServer = new MockAdapter(client)
        failingServer
            .onGet('/integrations/email/migration/integrations')
            .reply(400, { error: { msg: 'Could not fetch migrations' } })

        getInboundUnverifiedMigrationsSpy.mockReturnValue([migration as any])
        renderComponent()

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                'Could not fetch migrations',
            )
        })

        failingServer.restore()
    })
})
