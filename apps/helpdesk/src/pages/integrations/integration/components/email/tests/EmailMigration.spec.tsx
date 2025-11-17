import React from 'react'

import { cleanup, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import type { EmailMigrationBannerStatus } from 'models/integration/types'
import { EmailMigrationStatus } from 'models/integration/types'
import { mockStore, renderWithRouter } from 'utils/testing'

import EmailMigration from '../EmailMigration/EmailMigration'

jest.mock('react-router-dom', () => {
    return {
        ...jest.requireActual('react-router-dom'),
        Redirect: jest.fn(({ to }: { to: string }) => `Redirected to ${to}`),
    } as Record<string, unknown>
})

jest.mock('../EmailMigration/StartMigrationIntegrationsTable', () => () => (
    <div data-testid="integrations-table" />
))

describe('EmailMigration', () => {
    const renderComponent = (
        migrationBannerStatus: EmailMigrationBannerStatus | null,
    ) =>
        renderWithRouter(
            <Provider
                store={mockStore({
                    integrations: fromJS({
                        integrations: [],
                        emailMigrationBannerStatus: migrationBannerStatus,
                    }),
                } as any)}
            >
                <EmailMigration />
            </Provider>,
        )

    afterEach(cleanup)

    it('should render loader when there is no info about the status of the migration', () => {
        renderComponent(null)

        expect(screen.getByTestId('loader')).toBeVisible()
    })

    it('should redirect to homepage when the status of the migration is null', () => {
        renderComponent({
            started_at: null,
            due_at: null,
            status: null,
        })

        expect(screen.getByText('Redirected to /app')).toBeVisible()
    })

    it.each([
        {
            status: EmailMigrationStatus.Enabled,
            testid: 'migration-not-started',
        },
        { status: EmailMigrationStatus.Pending, testid: 'migration-pending' },
        {
            status: EmailMigrationStatus.Completed,
            testid: 'migration-complete',
        },
    ])('Displays correct step based on the status', async (state) => {
        renderComponent({
            status: state.status,
            due_at: '',
            started_at: '',
        })

        await screen.findByTestId(state.testid)
        expect(screen.getByTestId(state.testid)).toBeVisible()
    })
})
