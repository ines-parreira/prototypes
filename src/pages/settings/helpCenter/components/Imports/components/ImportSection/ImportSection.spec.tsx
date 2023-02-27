import React from 'react'
import {Provider as ReduxProvider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import MockAdapter from 'axios-mock-adapter'

import {fireEvent, render, screen, waitFor} from '@testing-library/react'

import userEvent from '@testing-library/user-event'
import {mockFlags, resetLDMocks} from 'jest-launchdarkly-mock'
import {getSingleHelpCenterResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {useCurrentHelpCenter} from 'pages/settings/helpCenter/providers/CurrentHelpCenter'
import {useMigrationApi} from 'pages/settings/helpCenter/hooks/useMigrationApi'

import {RootState, StoreDispatch} from 'state/types'
import {initialState as articlesState} from 'state/entities/helpCenter/articles/reducer'
import {initialState as categoriesState} from 'state/entities/helpCenter/categories/reducer'
import {initialState as uiState} from 'state/ui/helpCenter/reducer'

import {getMigrationClient} from 'rest_api/migration_api'
import {getAccessToken} from 'rest_api/utils'

import {FeatureFlagKey} from 'config/featureFlags'
import {migrationSessions} from './fixtures/migration-sessions'
import {
    helpCenterMigrationConfig,
    migrationProviders,
} from './fixtures/migration-providers'
import ImportSection, {ACTIVE_MIGRATION_UPDATE_TIMEOUT} from './ImportSection'
import {sessionHasProgressStatus} from './utils'

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
        helpCenter: {...uiState, currentId: 1},
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

jest.mock('pages/settings/helpCenter/providers/CurrentHelpCenter')
;(useCurrentHelpCenter as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture
)

// Migration client calls this function in an interceptor to set the access token
// and as the data here is mocked we don't need auth calls
jest.mock('rest_api/utils')
;(getAccessToken as jest.Mock).mockImplementation(() => 'token')

const renderWithStore = (element: React.ReactElement) =>
    render(element, {
        wrapper: ({children}: any) => (
            <ReduxProvider store={mockStore(defaultState)}>
                {children}
            </ReduxProvider>
        ),
    })

const activeMigration = migrationSessions.find((session) =>
    sessionHasProgressStatus(session)
)!

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

        resetLDMocks()
        mockFlags({
            [FeatureFlagKey.HelpCenterMigrationConfig]:
                helpCenterMigrationConfig,
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

        renderWithStore(<ImportSection />)

        const importInProgress = await waitFor(() =>
            screen.getByTestId('import-in-progress-info')
        )
        expect(importInProgress).not.toBeNull()

        const moreDetails = screen.getByTestId(
            'import-in-progress-more-details-trigger'
        )

        fireEvent.click(moreDetails)

        // Make sure it displays the progress of the active migration in the state modal
        const progressElement = screen.queryByText(
            `${activeMigration.result.progress}% Complete`
        )

        expect(progressElement).not.toBeNull()
    })

    test('migration flow', async () => {
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
            .reply(200, {
                ...activeMigration,
                result: {
                    ...activeMigration.result,
                    progress: 100,
                    status: 'SUCCESS',
                },
                status: 'SUCCESS',
            })

        renderWithStore(<ImportSection />)

        const importArticlesButton = await waitFor(() =>
            screen.getByText(/Import Articles/, {selector: 'button'})
        )
        fireEvent.click(importArticlesButton)

        const importFromAnotherProvider = await waitFor(() =>
            screen.getByTestId('import-articles-modal-file-drop-area')
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
            screen.getByText('Start migrating', {selector: 'button'})
        )
        fireEvent.click(startMigrationButton)

        // Make sure it displays the progress of the active migration in the state modal
        const progressElement = await waitFor(() =>
            screen.getByText(
                new RegExp(`${activeMigration.result.progress}% Complete`)
            )
        )
        expect(progressElement).not.toBeNull()
        jest.advanceTimersByTime(ACTIVE_MIGRATION_UPDATE_TIMEOUT)

        // Should become 100% after the first update
        const fullProgressElement = await waitFor(() =>
            screen.getByText(/100% Complete/)
        )
        expect(fullProgressElement).not.toBeNull()

        const finishButton = screen.getByText('Finish', {
            selector: 'button',
        })

        fireEvent.click(finishButton)

        // After the migration is finished should be able to start another round
        const finalImportArticlesButton = await waitFor(() =>
            screen.getByText('Import Articles')
        )
        expect(finalImportArticlesButton).not.toBeNull()
    })

    it('should not display providers that are not included in the feature flag config', async () => {
        mockAPI
            .onGet('/api/help_center/providers')
            .reply(200, migrationProviders)

        mockAPI.onGet('/api/sessions').reply(200, [])

        resetLDMocks()
        mockFlags({
            [FeatureFlagKey.HelpCenterMigrationConfig]: {
                providers: ['Zendesk', 'HelpDocs'],
            },
        })

        renderWithStore(<ImportSection />)

        const importArticlesButton = await waitFor(() =>
            screen.getByText(/Import Articles/, {selector: 'button'})
        )
        fireEvent.click(importArticlesButton)

        const importFromAnotherProvider = await waitFor(() =>
            screen.getByTestId('import-articles-modal-file-drop-area')
        )
        fireEvent.click(importFromAnotherProvider)

        // Choose provider
        const HelpDocsProvider = await waitFor(() =>
            screen.queryByText(/HelpDocs/)
        )
        const ZendeskProvider = await waitFor(() =>
            screen.queryByText(/Zendesk/)
        )
        const IntercomProvider = await waitFor(() =>
            screen.queryByText(/Intercom/)
        )
        const ReAmazeProvider = await waitFor(() =>
            screen.queryByText(/Re:amaze/)
        )

        // Available providers should exist
        expect(HelpDocsProvider).not.toBeNull()
        expect(ZendeskProvider).not.toBeNull()

        // Rest providers should not be rendered
        expect(IntercomProvider).toBeNull()
        expect(ReAmazeProvider).toBeNull()
    })
})
