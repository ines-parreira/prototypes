import React from 'react'

import client from '@repo/api-resources'
import { render } from '@repo/testing'
import { cleanup, screen } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'

import type { EmailMigrationInboundVerification } from 'models/integration/types'

import MigrationInProgress from '../EmailMigration/MigrationInProgress'
import * as migrationUtils from '../EmailMigration/utils'

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
})
