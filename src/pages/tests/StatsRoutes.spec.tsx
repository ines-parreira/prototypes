import React from 'react'
import {fromJS} from 'immutable'
import {mockFlags, resetLDMocks} from 'jest-launchdarkly-mock'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import {Route, Switch} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import {act} from '@testing-library/react'
import {createBrowserHistory} from 'history'

import {user} from 'fixtures/users'
import {RootState} from 'state/types'
import {FeatureFlagKey} from 'config/featureFlags'
import {renderWithRouter} from 'utils/testing'
import {VOICE_OVERVIEW_PAGE_TITLE} from 'pages/stats/voice/constants/voiceOverview'
import {StatsRoutes} from 'pages/routes'

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
    } as RootState

    beforeEach(() => {
        mockHistory.replace('/app')
        resetLDMocks()
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
        mockFlags({
            [FeatureFlagKey.DisplayVoiceAnalyticsV1]: false,
        })
        const {findByText} = renderStatsRoutes()

        act(() => mockHistory.push('/stats/voice-overview'))

        expect(await findByText(VOICE_OVERVIEW_PAGE_TITLE)).toBeInTheDocument()
    })

    it('should make Voice agents route available', async () => {
        mockFlags({
            [FeatureFlagKey.DisplayVoiceAnalyticsV1]: true,
        })
        const {findByText} = renderStatsRoutes()

        act(() => mockHistory.push('/stats/voice-agents'))

        expect(await findByText('Voice Agents')).toBeInTheDocument()
    })

    it('should not make Voice agents route available (FF off)', () => {
        mockFlags({
            [FeatureFlagKey.DisplayVoiceAnalyticsV1]: false,
        })
        const {queryByText} = renderStatsRoutes()

        act(() => mockHistory.push('/stats/voice-agents'))

        expect(queryByText('Voice Agents')).toBeNull()
    })
})
