import type { ComponentType, ReactNode } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { assumeMock, render } from '@repo/testing'
import { fromJS } from 'immutable'
import { Route, Switch } from 'react-router-dom'

import type { NavBarContextType } from 'common/navigation/hooks/useNavBar/context'
import {
    NavBarContext,
    NavBarDisplayMode,
} from 'common/navigation/hooks/useNavBar/context'
import { VOICE_OVERVIEW_PAGE_TITLE } from 'domains/reporting/pages/voice/constants/voiceOverview'
import { StatsRoutes } from 'domains/reporting/routes/StatsRoutes'
import * as billingFixtures from 'fixtures/billing'
import { user } from 'fixtures/users'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { initialState } from 'state/billing/reducers'
import type { RootState } from 'state/types'

jest.mock('@repo/feature-flags')
const useFlagMock = assumeMock(useFlag)

jest.mock('hooks/aiAgent/useAiAgentAccess')
const mockUseAiAgentAccess = assumeMock(useAiAgentAccess)

jest.mock('pages/LegacyPage', () => ({
    DefaultExportLegacyPage: ({
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
}))

jest.mock('domains/reporting/pages/common/StatsNavbarContainer', () => ({
    StatsNavbarContainer: () => <div>Navbar</div>,
}))
jest.mock(
    'pages/common/components/ScriptTagMigrationBanner/ScriptTagMigrationBanner',
    () => ({
        ScriptTagMigrationBanner: () => <div>ScriptTagMigrationBanner</div>,
    }),
)
jest.mock('domains/reporting/pages/voice/pages/VoiceOverview', () => ({
    DefaultExportVoiceOverview: () => <div>Voice Overview</div>,
}))
jest.mock('domains/reporting/pages/voice/pages/VoiceAgents', () => ({
    DefaultExportVoiceAgents: () => <div>Voice Agents</div>,
}))
jest.mock(
    'domains/reporting/pages/automate/ai-agent/AutomateAiAgentStatsReport',
    () => ({ AutomateAiAgentStatsReport: () => <div>AI Agent Stats</div> }),
)
jest.mock(
    'domains/reporting/pages/automate/ai-agent/AiAgentStatsFilters',
    () => ({
        AiAgentStatsFilters: ({ children }: { children?: ReactNode }) =>
            children,
    }),
)
jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')

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

    const renderStatsRoutes = (route: string) => {
        return render(
            <NavBarContext.Provider value={mockNavBarContextValues}>
                <Switch>
                    <Route path={`/app/stats`}>
                        <StatsRoutes />
                    </Route>
                </Switch>
            </NavBarContext.Provider>,
            {
                initialEntries: [route],
                storeState: defaultState,
            },
        )
    }

    it('should make Voice analytics route available', async () => {
        const { findByText } = renderStatsRoutes('/app/stats/voice-overview')

        expect(await findByText(VOICE_OVERVIEW_PAGE_TITLE)).toBeInTheDocument()
    })

    it('should make Voice agents route available', async () => {
        const { findByText } = renderStatsRoutes('/app/stats/voice-agents')

        expect(await findByText('Voice Agents')).toBeInTheDocument()
    })

    it('should make AI Agent Stats route available if feature flag is enabled', async () => {
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.AIAgentStatsPage) return true
            return false
        })

        const { findByText } = renderStatsRoutes('/app/stats/automate-ai-agent')

        expect(await findByText('AI Agent Stats')).toBeInTheDocument()
    })

    it('should not make AI Agent Stats route available if feature flag is disabled', () => {
        useFlagMock.mockReturnValue(false)

        const { container } = renderStatsRoutes('/app/stats/automate-ai-agent')

        expect(container).toBeEmptyDOMElement()
    })
})
