import type { ReactNode } from 'react'

import { render, userEvent } from '@repo/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'

import { toast } from '@gorgias/axiom'

import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import { useMigrationApi } from 'pages/settings/helpCenter/hooks/useMigrationApi'
import { getMigrationClient } from 'rest_api/migration_api'
import { initialState as articlesState } from 'state/entities/helpCenter/articles/reducer'
import { initialState as categoriesState } from 'state/entities/helpCenter/categories/reducer'
import type { RootState } from 'state/types'
import { initialState as uiState } from 'state/ui/helpCenter/reducer'

import { migrationProviders } from './fixtures/migration-providers'
import {
    failedMigrationStats,
    migrationSessions,
    partiallySucceededMigrationStats,
    succeededMigrationStats,
} from './fixtures/migration-sessions'
import ImportSection, { ACTIVE_MIGRATION_UPDATE_TIMEOUT } from './ImportSection'
import { sessionHasProgressStatus } from './utils'

jest.mock(
    'pages/common/components/modal/Modal',
    () =>
        ({ children }: { children?: ReactNode }) => {
            return <div>{children}</div>
        },
)

jest.mock(
    'pages/common/components/modal/ModalBody',
    () =>
        ({ children }: { children?: ReactNode }) => {
            return <div>{children}</div>
        },
)

jest.mock(
    'pages/common/components/modal/ModalHeader',
    () =>
        ({ children }: { children?: ReactNode }) => {
            return <div>{children}</div>
        },
)

const storeState: Partial<RootState> = {
    entities: {
        helpCenter: {
            helpCenters: {
                helpCentersById: {
                    [getSingleHelpCenterResponseFixture.id]:
                        getSingleHelpCenterResponseFixture,
                },
            },
            articles: articlesState,
            categories: categoriesState,
        },
    } as any,
    ui: {
        helpCenter: { ...uiState, currentId: 1 },
    } as any,
}

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => {
    return {
        useHelpCenterApi: () => ({
            isReady: true,
            client: {},
        }),
    }
})

jest.mock('pages/settings/helpCenter/hooks/useCurrentHelpCenter')
;(useCurrentHelpCenter as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture,
)

jest.mock('@repo/api-resources/gorgiasAppsAuth', () => ({
    GorgiasAppAuthService: jest.fn().mockImplementation(() => ({
        getAccessToken: jest.fn().mockResolvedValue('Bearer mock-token'),
    })),
}))

const activeMigration = migrationSessions.find((session) =>
    sessionHasProgressStatus(session),
)!

const succeededMigration = {
    ...activeMigration,
    result: {
        ...activeMigration.result,
        progress: 100,
    },
    stats: succeededMigrationStats,
    status: 'SUCCESS',
}
// Note that the `status: SUCCESS` doesn't correlate with if there are entities failed to migrate
const failedMigration = {
    ...activeMigration,
    result: {
        ...activeMigration.result,
        progress: 100,
    },
    stats: failedMigrationStats,
    status: 'SUCCESS',
}
const partiallySucceededMigration = {
    ...activeMigration,
    result: {
        ...activeMigration.result,
        progress: 100,
    },
    stats: partiallySucceededMigrationStats,
    status: 'SUCCESS',
}
const rollbackMigration = {
    ...activeMigration,
    is_rollback: true,
}

jest.mock('pages/settings/helpCenter/hooks/useMigrationApi')

jest.useFakeTimers()

describe('<ImportSection />', () => {
    let mockAPI: MockAdapter
    beforeAll(async () => {
        const migrationClient = await getMigrationClient()

        mockAPI = new MockAdapter(migrationClient)
        ;(useMigrationApi as jest.Mock).mockImplementation(() => {
            return migrationClient
        })
    })
    beforeEach(() => {
        mockAPI.reset()
    })
    afterEach(() => {
        act(() => {
            toast.dismiss()
        })
    })

    it("displays import in progress and is able to open status modal if there's an active migration", async () => {
        mockAPI
            .onGet('/api/help_center/providers')
            .reply(200, migrationProviders)
        mockAPI.onGet('/api/sessions').reply(200, migrationSessions)
        mockAPI
            .onGet('/api/sessions/e60c7fc6-eeed-419a-996c-711241db0d26')
            .reply(200, activeMigration)

        render(<ImportSection />, { storeState })

        const importInProgress = await waitFor(() =>
            screen.getByTestId('import-in-progress-info'),
        )
        expect(importInProgress).not.toBeNull()

        const moreDetails = screen.getByTestId(
            'import-in-progress-more-details-trigger',
        )

        fireEvent.click(moreDetails)

        // Make sure it displays the progress of the active migration in the state modal
        const progressElement = screen.queryByText(
            `${activeMigration.result.progress}% Complete`,
        )

        expect(progressElement).not.toBeNull()
    })

    test('Successful migration flow', async () => {
        mockAPI
            .onGet('/api/help_center/providers')
            .reply(200, migrationProviders)

        mockAPI.onGet('/api/sessions').reply(200, [])

        // Verify credentials
        mockAPI.onPost('/api/sessions?check=true').reply(200)

        // After starting migration return a session with some progress
        mockAPI.onPost('/api/sessions').reply(200, activeMigration)

        // After the first update make the session's status successful
        mockAPI
            .onGet('/api/sessions/e60c7fc6-eeed-419a-996c-711241db0d26')
            .reply(200, succeededMigration)

        render(<ImportSection />, { storeState })

        const importArticlesButton = await waitFor(() =>
            screen.getByRole('button', { name: /Import Articles/ }),
        )
        fireEvent.click(importArticlesButton)

        const importFromAnotherProvider = await waitFor(() =>
            screen.getByTestId('import-articles-modal-file-drop-area'),
        )
        fireEvent.click(importFromAnotherProvider)

        // Choose provider
        const provider = await waitFor(() => screen.getByText(/Zendesk/))
        fireEvent.click(provider)

        // Inside migration credentials modal
        const emailInput = await waitFor(() => screen.getByLabelText(/Email/))
        const apiKeyInput = screen.getByLabelText(/API Key/)
        const submitButton = screen.getByText('Connect')

        await userEvent.type(emailInput, 'email@email.com')
        await userEvent.type(apiKeyInput, 'api-key')
        fireEvent.click(submitButton)
        const startMigrationButton = await waitFor(() =>
            screen.getByRole('button', { name: 'Start migrating' }),
        )
        fireEvent.click(startMigrationButton)

        // Make sure it displays the progress of the active migration in the state modal
        const progressElement = await waitFor(() =>
            screen.getByText(
                new RegExp(`${activeMigration.result.progress}% Complete`),
            ),
        )
        expect(progressElement).not.toBeNull()
        jest.advanceTimersByTime(ACTIVE_MIGRATION_UPDATE_TIMEOUT)

        // Should become 100% after the first update
        const fullProgressElement = await waitFor(() =>
            screen.getByText(/100% Complete/),
        )
        expect(fullProgressElement).not.toBeNull()

        const finishButton = screen.getByRole('button', {
            name: 'Finish',
        })

        fireEvent.click(finishButton)
    })

    it('shows an error toast when the sessions list fetch fails', async () => {
        mockAPI
            .onGet('/api/help_center/providers')
            .reply(200, migrationProviders)
        mockAPI.onGet('/api/sessions').reply(500, {})

        render(<ImportSection />, { storeState })

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: /facing some problems retrieving active migrations/i,
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('shows an error toast when the providers fetch fails', async () => {
        mockAPI.onGet('/api/help_center/providers').reply(500, {})
        mockAPI.onGet('/api/sessions').reply(200, [])

        render(<ImportSection />, { storeState })

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: /facing some issues with migration providers/i,
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('shows an info toast when there is an ongoing migration in the background', async () => {
        mockAPI
            .onGet('/api/help_center/providers')
            .reply(200, migrationProviders)
        mockAPI.onGet('/api/sessions').reply(200, migrationSessions)
        mockAPI
            .onGet('/api/sessions/e60c7fc6-eeed-419a-996c-711241db0d26')
            .reply(200, activeMigration)

        render(<ImportSection />, { storeState })

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: /ongoing migration in the background/i,
                }),
            ).toBeInTheDocument()
        })
    })

    it('shows a success toast with a refresh button when the active migration finishes while the modal is closed', async () => {
        mockAPI
            .onGet('/api/help_center/providers')
            .reply(200, migrationProviders)
        mockAPI.onGet('/api/sessions').reply(200, migrationSessions)
        mockAPI
            .onGet('/api/sessions/e60c7fc6-eeed-419a-996c-711241db0d26')
            .reply(200, succeededMigration)

        render(<ImportSection />, { storeState })

        await waitFor(() => screen.getByTestId('import-in-progress-info'))

        jest.advanceTimersByTime(ACTIVE_MIGRATION_UPDATE_TIMEOUT)

        await waitFor(() => {
            const successToasts = screen.getAllByRole('status', {
                name: /migration finished successfully/i,
            })
            expect(successToasts.length).toBeGreaterThan(0)
            expect(successToasts[0]).toHaveAttribute('data-intent', 'success')
        })

        expect(
            screen.getAllByRole('button', { name: /refresh/i }).length,
        ).toBeGreaterThan(0)
    })

    it('shows an error toast with a refresh button when the active migration retrieval fails while the modal is closed', async () => {
        mockAPI
            .onGet('/api/help_center/providers')
            .reply(200, migrationProviders)
        mockAPI.onGet('/api/sessions').reply(200, migrationSessions)
        mockAPI
            .onGet('/api/sessions/e60c7fc6-eeed-419a-996c-711241db0d26')
            .reply(500)

        render(<ImportSection />, { storeState })

        await waitFor(() => screen.getByTestId('import-in-progress-info'))

        jest.advanceTimersByTime(ACTIVE_MIGRATION_UPDATE_TIMEOUT)

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: /migration failed to finish importing all articles/i,
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })

        expect(
            screen.getByRole('button', { name: /refresh/i }),
        ).toBeInTheDocument()
    })

    it('shows an error toast when the migration credentials check fails', async () => {
        mockAPI
            .onGet('/api/help_center/providers')
            .reply(200, migrationProviders)
        mockAPI.onGet('/api/sessions').reply(200, [])
        mockAPI.onPost('/api/sessions?check=true').reply(400, {})
        mockAPI.onPost('/api/sessions').reply(400, {})

        render(<ImportSection />, { storeState })

        const importArticlesButton = await waitFor(() =>
            screen.getByRole('button', { name: /Import Articles/ }),
        )
        fireEvent.click(importArticlesButton)

        const importFromAnotherProvider = await waitFor(() =>
            screen.getByTestId('import-articles-modal-file-drop-area'),
        )
        fireEvent.click(importFromAnotherProvider)

        const provider = await waitFor(() => screen.getByText(/Zendesk/))
        fireEvent.click(provider)

        const emailInput = await waitFor(() => screen.getByLabelText(/Email/))
        const apiKeyInput = screen.getByLabelText(/API Key/)
        const submitButton = screen.getByText('Connect')

        await userEvent.type(emailInput, 'email@email.com')
        await userEvent.type(apiKeyInput, 'api-key')
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: /Couldn't connect to provider/i,
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('shows an error toast when the migration start fails', async () => {
        mockAPI
            .onGet('/api/help_center/providers')
            .reply(200, migrationProviders)
        mockAPI.onGet('/api/sessions').reply(200, [])
        // The credentials check POST resolves successfully, but the start POST
        // (which hits the same URL after the modal opens) is rejected.
        mockAPI.onPost('/api/sessions').replyOnce(200)
        mockAPI.onPost('/api/sessions').reply(500, {})

        render(<ImportSection />, { storeState })

        const importArticlesButton = await waitFor(() =>
            screen.getByRole('button', { name: /Import Articles/ }),
        )
        fireEvent.click(importArticlesButton)

        const importFromAnotherProvider = await waitFor(() =>
            screen.getByTestId('import-articles-modal-file-drop-area'),
        )
        fireEvent.click(importFromAnotherProvider)

        const provider = await waitFor(() => screen.getByText(/Zendesk/))
        fireEvent.click(provider)

        const emailInput = await waitFor(() => screen.getByLabelText(/Email/))
        const apiKeyInput = screen.getByLabelText(/API Key/)
        const submitButton = screen.getByText('Connect')

        await userEvent.type(emailInput, 'email@email.com')
        await userEvent.type(apiKeyInput, 'api-key')
        fireEvent.click(submitButton)

        const startMigrationButton = await waitFor(() =>
            screen.getByRole('button', { name: 'Start migrating' }),
        )
        fireEvent.click(startMigrationButton)

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: /Failed to start migration/i,
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('shows an error toast when the retry call fails', async () => {
        mockAPI
            .onGet('/api/help_center/providers')
            .reply(200, migrationProviders)
        mockAPI.onGet('/api/sessions').reply(200, [])
        mockAPI
            .onPost('/api/sessions/e60c7fc6-eeed-419a-996c-711241db0d26/retry')
            .reply(500, {})

        render(<ImportSection />, {
            storeState,
            initialEntries: [
                {
                    pathname: '/',
                    state: { autoOpenSession: failedMigration },
                },
            ] as unknown as string[],
        })

        const retryButton = await waitFor(() =>
            screen.getByRole('button', { name: /Retry/ }),
        )
        fireEvent.click(retryButton)

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: /Failed to retry migration/i,
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('shows an error toast when the revert call fails', async () => {
        mockAPI
            .onGet('/api/help_center/providers')
            .reply(200, migrationProviders)
        mockAPI.onGet('/api/sessions').reply(200, [])
        mockAPI
            .onPost(
                '/api/sessions/e60c7fc6-eeed-419a-996c-711241db0d26/rollback',
            )
            .reply(500, {})

        render(<ImportSection />, {
            storeState,
            initialEntries: [
                {
                    pathname: '/',
                    state: { autoOpenSession: partiallySucceededMigration },
                },
            ] as unknown as string[],
        })

        const revertButton = await waitFor(() =>
            screen.getByRole('button', { name: /Revert/ }),
        )
        fireEvent.click(revertButton)

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: /Failed to revert migration/i,
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    test('Retry and revert for migration', async () => {
        /**
         * To test all of them in one go we'll do this:
         * 1. Simulate a failed migration, retry it
         * 2. For this retry simulate a partially succeded migration, then retry it again
         * 3. For the second retry simulate a partially succeded migration and revert it
         */
        mockAPI
            .onGet('/api/help_center/providers')
            .reply(200, migrationProviders)

        mockAPI.onGet('/api/sessions').reply(200, [])

        // Verify credentials
        mockAPI.onPost('/api/sessions?check=true').reply(200)

        mockAPI.onPost('/api/sessions').reply(200, activeMigration)

        render(<ImportSection />, { storeState })

        const importArticlesButton = await waitFor(() =>
            screen.getByRole('button', {
                name: /Import Articles/,
            }),
        )
        fireEvent.click(importArticlesButton)

        const importFromAnotherProvider = await waitFor(() =>
            screen.getByTestId('import-articles-modal-file-drop-area'),
        )
        fireEvent.click(importFromAnotherProvider)

        // Choose provider
        const provider = await waitFor(() => screen.getByText(/Zendesk/))
        fireEvent.click(provider)

        // Inside migration credentials modal
        const emailInput = await waitFor(() => screen.getByLabelText(/Email/))
        const apiKeyInput = screen.getByLabelText(/API Key/)
        const submitButton = screen.getByText('Connect')

        await userEvent.type(emailInput, 'email@email.com')
        await userEvent.type(apiKeyInput, 'api-key')
        fireEvent.click(submitButton)
        const startMigrationButton = await waitFor(() =>
            screen.getByRole('button', {
                name: 'Start migrating',
            }),
        )
        fireEvent.click(startMigrationButton)

        mockAPI
            .onGet('/api/sessions/e60c7fc6-eeed-419a-996c-711241db0d26')
            .replyOnce(200, failedMigration)

        // Make sure it displays the progress of the active migration in the state modal
        const progressElement = await waitFor(() =>
            screen.getByText(
                new RegExp(`${activeMigration.result.progress}% Complete`),
            ),
        )
        expect(progressElement).not.toBeNull()
        jest.advanceTimersByTime(ACTIVE_MIGRATION_UPDATE_TIMEOUT)

        mockAPI
            .onPost('/api/sessions/e60c7fc6-eeed-419a-996c-711241db0d26/retry')
            .replyOnce(200, partiallySucceededMigration)

        const firstRetryButton = await waitFor(() =>
            screen.getByRole('button', { name: /Retry/ }),
        )

        fireEvent.click(firstRetryButton)

        jest.advanceTimersByTime(ACTIVE_MIGRATION_UPDATE_TIMEOUT)

        mockAPI
            .onPost('/api/sessions/e60c7fc6-eeed-419a-996c-711241db0d26/retry')
            .replyOnce(200, partiallySucceededMigration)

        // The first one was for failed migration, this one is for partially succeeded
        const secondRetryButton = await waitFor(() =>
            screen.getByRole('button', { name: /Retry/ }),
        )

        fireEvent.click(secondRetryButton)

        jest.advanceTimersByTime(ACTIVE_MIGRATION_UPDATE_TIMEOUT)

        // Rollback (reverting) creates a new session
        mockAPI
            .onPost(
                '/api/sessions/e60c7fc6-eeed-419a-996c-711241db0d26/rollback',
            )
            .replyOnce(200, rollbackMigration)

        const revertButton = await waitFor(() =>
            screen.getByRole('button', {
                name: /Revert/,
            }),
        )

        fireEvent.click(revertButton)

        jest.advanceTimersByTime(ACTIVE_MIGRATION_UPDATE_TIMEOUT)

        const revertNotice = await waitFor(() =>
            screen.getByText(/Reverting migration from /),
        )

        expect(revertNotice).not.toBeNull()
    })
})
