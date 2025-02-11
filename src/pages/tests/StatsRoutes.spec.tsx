import {act} from '@testing-library/react'

import {createBrowserHistory} from 'history'
import {fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'
import React, {ReactNode} from 'react'
import {Provider} from 'react-redux'
import {Route, Switch} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    NavBarContext,
    NavBarContextType,
    NavBarDisplayMode,
} from 'common/navigation/hooks/useNavBar/context'
import {FeatureFlagKey} from 'config/featureFlags'
import * as billingFixtures from 'fixtures/billing'

import {user} from 'fixtures/users'
import {VOICE_OVERVIEW_PAGE_TITLE} from 'pages/stats/voice/constants/voiceOverview'
import {StatsRoutes} from 'routes/Routes'
import {initialState} from 'state/billing/reducers'
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
jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
const mockHistory = createBrowserHistory()

describe('<StatsRoutes/>', () => {
    const defaultState = {
        billing: initialState.mergeDeep(billingFixtures.billingState),
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

    const mockNavBarContextValues: NavBarContextType = {
        navBarDisplay: NavBarDisplayMode.Open,
        setNavBarDisplay: jest.fn(),
        isNavBarVisible: false,
        isNavHovered: false,
        onNavHover: jest.fn(),
        onNavLeave: jest.fn(),
        onOverlayHover: jest.fn(),
        onMenuToggle: jest.fn(),
        onHomeButtonClick: jest.fn(),
    }

    const renderStatsRoutes = () => {
        return renderWithRouter(
            <NavBarContext.Provider value={mockNavBarContextValues}>
                <Provider store={configureMockStore([thunk])(defaultState)}>
                    <Switch>
                        <Route path={`/stats`}>
                            <StatsRoutes />
                        </Route>
                    </Switch>
                </Provider>
            </NavBarContext.Provider>,
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
