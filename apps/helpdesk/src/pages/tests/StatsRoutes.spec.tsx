import type { ComponentType, ReactNode } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { act } from '@testing-library/react'
import { createBrowserHistory } from 'history'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { Route, Switch } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { NavBarContextType } from 'common/navigation/hooks/useNavBar/context'
import {
    NavBarContext,
    NavBarDisplayMode,
} from 'common/navigation/hooks/useNavBar/context'
import { useFlag } from 'core/flags'
import { VOICE_OVERVIEW_PAGE_TITLE } from 'domains/reporting/pages/voice/constants/voiceOverview'
import { StatsRoutes } from 'domains/reporting/routes/StatsRoutes'
import * as billingFixtures from 'fixtures/billing'
import { user } from 'fixtures/users'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { initialState } from 'state/billing/reducers'
import type { RootState } from 'state/types'
import { renderWithRouter } from 'utils/testing'

jest.mock('core/flags')
const useFlagMock = assumeMock(useFlag)

jest.mock('hooks/aiAgent/useAiAgentAccess')
const mockUseAiAgentAccess = assumeMock(useAiAgentAccess)

jest.mock(
    'pages/App',
    () =>
        ({
            content: Content,
            navbar: Navbar,
        }: {
            content: ComponentType<any>
            navbar: ComponentType<any>
        }) => (
            <>
                <Navbar />
                <Content />
            </>
        ),
)

jest.mock('domains/reporting/pages/common/StatsNavbarContainer', () => () => (
    <div>Navbar</div>
))
jest.mock(
    'pages/common/components/ScriptTagMigrationBanner/ScriptTagMigrationBanner',
    () => () => <div>ScriptTagMigrationBanner</div>,
)
jest.mock('domains/reporting/pages/voice/pages/VoiceOverview', () => () => (
    <div>Voice Overview</div>
))
jest.mock('domains/reporting/pages/voice/pages/VoiceAgents', () => () => (
    <div>Voice Agents</div>
))
jest.mock(
    'domains/reporting/pages/automate/ai-agent/AutomateAiAgentStatsReport',
    () => () => <div>AI Agent Stats</div>,
)
jest.mock(
    'domains/reporting/pages/automate/ai-agent/AiAgentStatsFilters',
    () =>
        ({ children }: { children?: ReactNode }) =>
            children,
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
                filters: { isFilterDirty: false },
            },
        },
    } as RootState

    const mockNavBarContextValues: NavBarContextType = {
        navBarDisplay: NavBarDisplayMode.Open,
        setNavBarDisplay: jest.fn(),
        isNavBarVisible: false,
        isNavHovered: false,
        onNavHover: jest.fn(),
        onNavLeave: jest.fn(),
        onOverlayHover: jest.fn(),
        onMenuToggle: jest.fn(),
        onNavBarShortCutToggle: jest.fn(),
    }

    beforeEach(() => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
    })

    const renderStatsRoutes = () => {
        return renderWithRouter(
            <NavBarContext.Provider value={mockNavBarContextValues}>
                <Provider store={configureMockStore([thunk])(defaultState)}>
                    <Switch>
                        <Route path={`/app/stats`}>
                            <StatsRoutes />
                        </Route>
                    </Switch>
                </Provider>
            </NavBarContext.Provider>,
            {
                history: mockHistory,
            },
        )
    }

    it('should make Voice analytics route available', async () => {
        const { findByText } = renderStatsRoutes()

        act(() => mockHistory.push('/app/stats/voice-overview'))

        expect(await findByText(VOICE_OVERVIEW_PAGE_TITLE)).toBeInTheDocument()
    })

    it('should make Voice agents route available', async () => {
        const { findByText } = renderStatsRoutes()

        act(() => mockHistory.push('/app/stats/voice-agents'))

        expect(await findByText('Voice Agents')).toBeInTheDocument()
    })

    it('should make AI Agent Stats route available if feature flag is enabled', async () => {
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.AIAgentStatsPage) return true
            return false
        })

        const { findByText } = renderStatsRoutes()

        act(() => mockHistory.push('/app/stats/automate-ai-agent'))

        expect(await findByText('AI Agent Stats')).toBeInTheDocument()
    })

    it('should not make AI Agent Stats route available if feature flag is disabled', () => {
        useFlagMock.mockReturnValue(false)

        const { container } = renderStatsRoutes()

        act(() => mockHistory.push('/app/stats/automate-ai-agent'))

        expect(container).toBeEmptyDOMElement()
    })
})
