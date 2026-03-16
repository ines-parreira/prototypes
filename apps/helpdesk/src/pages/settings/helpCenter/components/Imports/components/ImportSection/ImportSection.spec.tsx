import type { ReactNode } from 'react'
import type React from 'react'

import { useFlag } from '@repo/feature-flags'
import { userEvent } from '@repo/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { createMemoryHistory } from 'history'
import { Provider as ReduxProvider } from 'react-redux'
import { Router } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import { useMigrationApi } from 'pages/settings/helpCenter/hooks/useMigrationApi'
import { getMigrationClient } from 'rest_api/migration_api'
import { initialState as articlesState } from 'state/entities/helpCenter/articles/reducer'
import { initialState as categoriesState } from 'state/entities/helpCenter/categories/reducer'
import type { RootState, StoreDispatch } from 'state/types'
import { initialState as uiState } from 'state/ui/helpCenter/reducer'

import {
    helpCenterMigrationConfig,
    migrationProviders,
} from './fixtures/migration-providers'
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
        ({ children }: { children: ReactNode }) => {
            return <div>{children}</div>
        },
)

jest.mock(
    'pages/common/components/modal/ModalBody',
    () =>
        ({ children }: { children: ReactNode }) => {
            return <div>{children}</div>
        },
)

jest.mock(
    'pages/common/components/modal/ModalHeader',
    () =>
        ({ children }: { children: ReactNode }) => {
            return <div>{children}</div>
        },
)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const defaultState: Partial<RootState> = {
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

jest.mock('utils/gorgiasAppsAuth', () => ({
    GorgiasAppAuthService: jest.fn().mockImplementation(() => ({
        getAccessToken: jest.fn().mockResolvedValue('Bearer mock-token'),
    })),
}))

jest.mock('@repo/feature-flags')
const mockUseFlag = useFlag as jest.Mock

const history = createMemoryHistory()

const renderWithStore = (element: React.ReactElement) =>
    render(element, {
        wrapper: ({ children }: any) => (
            <Router history={history}>
                <ReduxProvider store={mockStore(defaultState)}>
                    {children}
                </ReduxProvider>
            </Router>
        ),
    })

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

        mockUseFlag.mockReturnValue(helpCenterMigrationConfig)
    })

    it("displays import in progress and is able to open status modal if there's an active migration", async () => {
        mockAPI
            .onGet('/api/help_center/providers')
            .reply(200, migrationProviders)
        mockAPI.onGet('/api/sessions').reply(200, migrationSessions)
        mockAPI
            .onGet('/api/sessions/e60c7fc6-eeed-419a-996c-711241db0d26')
            .reply(200, activeMigration)

        renderWithStore(<ImportSection />)

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

        renderWithStore(<ImportSection />)

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

        renderWithStore(<ImportSection />)

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

    it('should not display providers that are not included in the feature flag config', async () => {
        mockAPI
            .onGet('/api/help_center/providers')
            .reply(200, migrationProviders)

        mockAPI.onGet('/api/sessions').reply(200, [])

        mockUseFlag.mockReturnValue({
            providers: ['Zendesk', 'HelpDocs'],
        })

        renderWithStore(<ImportSection />)

        const importArticlesButton = await waitFor(() =>
            screen.getByRole('button', { name: /Import Articles/ }),
        )
        fireEvent.click(importArticlesButton)

        const importFromAnotherProvider = await waitFor(() =>
            screen.getByTestId('import-articles-modal-file-drop-area'),
        )
        fireEvent.click(importFromAnotherProvider)

        // Choose provider
        const HelpDocsProvider = await waitFor(() =>
            screen.queryByText(/HelpDocs/),
        )
        const ZendeskProvider = await waitFor(() =>
            screen.queryByText(/Zendesk/),
        )
        const IntercomProvider = await waitFor(() =>
            screen.queryByText(/Intercom/),
        )
        const ReAmazeProvider = await waitFor(() =>
            screen.queryByText(/Re:amaze/),
        )

        // Available providers should exist
        expect(HelpDocsProvider).not.toBeNull()
        expect(ZendeskProvider).not.toBeNull()

        // Rest providers should not be rendered
        expect(IntercomProvider).toBeNull()
        expect(ReAmazeProvider).toBeNull()
    })
})
