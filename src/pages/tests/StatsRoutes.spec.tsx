import {act} from '@testing-library/react'
import {createBrowserHistory} from 'history'
import {fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'
import React, {ReactNode} from 'react'
import {Provider} from 'react-redux'
import {Route, Switch} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {FeatureFlagKey} from 'config/featureFlags'
import {user} from 'fixtures/users'
import {VOICE_OVERVIEW_PAGE_TITLE} from 'pages/stats/voice/constants/voiceOverview'
import {StatsRoutes} from 'routes/Routes'
import {RootState} from 'state/types'
import {renderWithRouter} from 'utils/testing'

jest.mock('pages/stats/common/StatsNavbarContainer', () => () => (
    <div>Navbar</div>
))
jest.mock(
    'pages/common/components/ScriptTagMigrationBanner/ScriptTagMigrationBanner',
    () => () => <div>ScriptTagMigrationBanner</div>
)
jest.mock('pages/stats/voice/pages/VoiceOverview', () => () => (
    <div>Voice Overview</div>
))
jest.mock('pages/stats/voice/pages/VoiceAgents', () => () => (
    <div>Voice Agents</div>
))
jest.mock('pages/stats/automate/ai-agent/AutomateAiAgentStats', () => () => (
    <div>AI Agent Stats</div>
))
jest.mock(
    'pages/stats/automate/ai-agent/AiAgentStatsFilters',
    () =>
        ({children}: {children?: ReactNode}) =>
            children
)
const mockHistory = createBrowserHistory()

describe('<StatsRoutes/>', () => {
    const defaultState = {
        currentAccount: fromJS({
            ...user,
            timezone: 'America/Los_Angeles',
        }),
        currentUser: fromJS({}),
        stats: {
            filters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
            },
        },
        notifications: fromJS([]),
        ui: {
            stats: {
                filters: {isFilterDirty: false},
            },
        },
    } as RootState

    beforeEach(() => {
        mockHistory.replace('/app')
    })

    const renderStatsRoutes = () => {
        return renderWithRouter(
            <Provider store={configureMockStore([thunk])(defaultState)}>
                <Switch>
                    <Route path={`/stats`}>
                        <StatsRoutes />
                    </Route>
                </Switch>
            </Provider>,
            {
                history: mockHistory,
            }
        )
    }

    it('should make Voice analytics route available', async () => {
        const {findByText} = renderStatsRoutes()

        act(() => mockHistory.push('/stats/voice-overview'))

        expect(await findByText(VOICE_OVERVIEW_PAGE_TITLE)).toBeInTheDocument()
    })

    it('should make Voice agents route available', async () => {
        const {findByText} = renderStatsRoutes()

        act(() => mockHistory.push('/stats/voice-agents'))

        expect(await findByText('Voice Agents')).toBeInTheDocument()
    })

    it('should make AI Agent Stats route available if feature flag is enabled', async () => {
        mockFlags({
            [FeatureFlagKey.AIAgentStatsPage]: true,
        })

        const {findByText} = renderStatsRoutes()

        act(() => mockHistory.push('/stats/automate-ai-agent'))

        expect(await findByText('AI Agent Stats')).toBeInTheDocument()
    })

    it('should not make AI Agent Stats route available if feature flag is disabled', () => {
        mockFlags({
            [FeatureFlagKey.AIAgentStatsPage]: false,
        })

        const {container} = renderStatsRoutes()

        act(() => mockHistory.push('/stats/automate-ai-agent'))

        expect(container).toBeEmptyDOMElement()
    })
})
