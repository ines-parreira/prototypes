import {cleanup, render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import React from 'react'
import MockAdapter from 'axios-mock-adapter'
import {fromJS} from 'immutable'
import {mockStore} from 'utils/testing'
import client from 'models/api/resources'
import {EmailMigration} from 'models/integration/types'
import MigrationInProgress from '../EmailMigration/MigrationInProgress'
import * as migrationUtils from '../EmailMigration/utils'

const getInboundUnverifiedMigrationsSpy = jest.spyOn(
    migrationUtils,
    'getInboundUnverifiedMigrations'
)

const migration = {integration: {meta: {}}} as unknown as EmailMigration

jest.mock('../EmailMigration/MigrationEmailForwarding', () => () => (
    <div data-testid="migration-email-forwarding" />
))

describe('MigrationInProgress', () => {
    const mockServer = new MockAdapter(client)
    mockServer.onGet('/integrations/email/migration/integrations').reply(200, {
        data: [migration],
    })

    const renderComponent = () =>
        render(
            <Provider
                store={mockStore({
                    integrations: fromJS({
                        migrations: {email: [migration]},
                    }),
                } as any)}
            >
                <MigrationInProgress />
            </Provider>
        )

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
            screen.getByTestId('migration-domain-verification')
        ).toBeVisible()
    })
})
