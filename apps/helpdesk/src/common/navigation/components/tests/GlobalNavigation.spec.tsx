import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { fromJS } from 'immutable'

import GlobalNavigation from 'common/navigation/components/GlobalNavigation'
import useActiveItem from 'common/navigation/hooks/useActiveItem'
import type { NavBarContextType } from 'common/navigation/hooks/useNavBar/context'
import {
    NavBarContext,
    NavBarDisplayMode,
} from 'common/navigation/hooks/useNavBar/context'
import { UserRole } from 'config/types/user'
import { useReportChartRestrictions } from 'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions'
import { createMockStandaloneAiAccess } from 'fixtures/standaloneAiAccess'
import { useStandaloneAiAccess } from 'hooks/useStandaloneAiAccess'
import { useHasAiAgentMenu } from 'pages/aiAgent/hooks/useHasAiAgentMenu'
import {
    BASE_STATS_PATH,
    STANDALONE_AI_AGENT_STATS_PATH,
} from 'routes/constants'
import { getHasAutomate } from 'state/billing/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { renderWithRouter } from 'utils/testing'

jest.mock('state/currentUser/selectors', () => ({ getCurrentUser: jest.fn() }))
const getCurrentUserMock = assumeMock(getCurrentUser)

jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())

jest.mock('state/billing/selectors', () => ({ getHasAutomate: jest.fn() }))
const getHasAutomateMock = assumeMock(getHasAutomate)

jest.mock('../../hooks/useActiveItem', () => jest.fn())
const useActiveItemMock = assumeMock(useActiveItem)

jest.mock('../GlobalNavigationSpotlight', () => ({
    GlobalNavigationSpotlight: () => <div>GlobalNavigationSpotlight</div>,
}))
jest.mock('../NotificationsItem', () => () => <div>NotificationsItem</div>)
jest.mock('../UserItem', () => () => <div>UserItem</div>)

jest.mock('@repo/feature-flags')
const mockUseFlag = useFlag as jest.Mock

jest.mock('pages/aiAgent/hooks/useHasAiAgentMenu', () => ({
    useHasAiAgentMenu: jest.fn(),
}))
const useHasAiAgentMenuMock = assumeMock(useHasAiAgentMenu)

jest.mock('hooks/useStandaloneAiAccess', () => ({
    useStandaloneAiAccess: jest.fn(),
}))
const useStandaloneAiAccessMock = assumeMock(useStandaloneAiAccess)

jest.mock(
    'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions',
    () => ({
        useReportChartRestrictions: jest.fn(),
    }),
)
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

describe('GlobalNavigation', () => {
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

    const renderWithContext = () =>
        renderWithRouter(
            <NavBarContext.Provider value={mockNavBarContextValues}>
                <GlobalNavigation />
            </NavBarContext.Provider>,
        )

    beforeEach(() => {
        getCurrentUserMock.mockReturnValue(
            fromJS({ role: { name: UserRole.BasicAgent } }),
        )
        useActiveItemMock.mockReturnValue('tickets')
        mockUseFlag.mockImplementation(() => false)
        useReportChartRestrictionsMock.mockReturnValue({
            isModuleRestrictedToCurrentUser: () => false,
        } as any)
        useStandaloneAiAccessMock.mockReturnValue(
            createMockStandaloneAiAccess({
                statistics: { canRead: true, canWrite: true },
            }),
        )
    })

    it('should render the menu icon when the nav is pinned', () => {
        const { getByText } = renderWithContext()
        expect(getByText('menu')).toBeInTheDocument()
    })

    it('should render the home icon', () => {
        const { getByText } = renderWithContext()
        expect(getByText('home')).toBeInTheDocument()
    })

    it('should render the search icon', () => {
        const { getByText } = renderWithContext()
        expect(getByText('GlobalNavigationSpotlight')).toBeInTheDocument()
    })

    it('should render the notifications icon', () => {
        const { getByText } = renderWithContext()
        expect(getByText('NotificationsItem')).toBeInTheDocument()
    })

    it('should render the tickets icon', () => {
        const { getByText } = renderWithContext()
        expect(getByText('question_answer')).toBeInTheDocument()
    })

    it('should not render the automation icon if the user is not a lead agent', () => {
        const { queryByText } = renderWithContext()
        expect(queryByText('bolt')).not.toBeInTheDocument()
    })

    it('should render the automation icon if the user is a lead agent', () => {
        getCurrentUserMock.mockReturnValue(
            fromJS({ role: { name: UserRole.Agent } }),
        )
        const { getByText } = renderWithContext()
        expect(getByText('bolt')).toBeInTheDocument()
    })

    it('should not render the automation icon if the AutomateSettingsRevamp feature flag is enabled', () => {
        getCurrentUserMock.mockReturnValue(
            fromJS({ role: { name: UserRole.Agent } }),
        )
        mockUseFlag.mockImplementation((flag) =>
            flag === FeatureFlagKey.AutomateSettingsRevamp ? true : false,
        )
        const { queryByText } = renderWithContext()
        expect(queryByText('bolt')).not.toBeInTheDocument()
    })

    it('should not render the convert icon if the user is not an admin', () => {
        const { queryByText } = renderWithContext()
        expect(queryByText('monetization_on')).not.toBeInTheDocument()
    })

    it('should render the convert icon if the user is an admin', () => {
        getCurrentUserMock.mockReturnValue(
            fromJS({ role: { name: UserRole.Admin } }),
        )
        const { getByText } = renderWithContext()
        expect(getByText('monetization_on')).toBeInTheDocument()
    })

    it('should render the customers icon', () => {
        const { getByText } = renderWithContext()
        expect(getByText('people')).toBeInTheDocument()
    })

    it('should render the stats icon', () => {
        const { getByText } = renderWithContext()
        expect(getByText('bar_chart')).toBeInTheDocument()
    })

    it('should not return stats icon if isModuleRestrictedToCurrentUser is true', () => {
        useReportChartRestrictionsMock.mockReturnValue({
            isModuleRestrictedToCurrentUser: () => true,
        } as any)

        const { queryByText } = renderWithContext()
        expect(queryByText('bar_chart')).not.toBeInTheDocument()
    })

    it('should render the settings icon', () => {
        const { getByText } = renderWithContext()
        expect(getByText('settings')).toBeInTheDocument()
    })

    it('should render the user item', () => {
        const { getByText } = renderWithContext()
        expect(getByText('UserItem')).toBeInTheDocument()
    })

    it('should not render the ai agent icon if user is not a lead agent and useHasAiAgentMenu false', () => {
        useHasAiAgentMenuMock.mockReturnValue(false)
        const { queryByText } = renderWithContext()
        expect(queryByText('auto_awesome')).not.toBeInTheDocument()
    })

    it('should render the ai agent icon if the user is a lead agent and useHasAiAgentMenu true', () => {
        useHasAiAgentMenuMock.mockReturnValue(true)
        getCurrentUserMock.mockReturnValue(
            fromJS({ role: { name: UserRole.Agent } }),
        )
        getHasAutomateMock.mockReturnValue(true)
        const { queryByText } = renderWithContext()
        expect(queryByText('auto_awesome')).toBeInTheDocument()
    })

    it('should render AI Journey icon if isAiJourneyEnabled feature flag is enabled', () => {
        mockUseFlag.mockImplementation((flag) =>
            flag === FeatureFlagKey.AiJourneyEnabled ? true : false,
        )
        const { queryByText } = renderWithContext()
        expect(queryByText('route')).toBeInTheDocument()
    })

    it('should not render AI Journey icon if isAiJourneyEnabled feature flag is disabled', () => {
        const { queryByText } = renderWithContext()
        expect(queryByText('route')).not.toBeInTheDocument()
    })

    it('should link statistics to BASE_STATS_PATH when not a standalone AI agent', () => {
        const { container } = renderWithContext()
        const statsLink = container.querySelector(
            `a[href="${BASE_STATS_PATH}"]`,
        )
        expect(statsLink).toBeInTheDocument()
    })

    it('should link statistics to STANDALONE_AI_AGENT_STATS_PATH when standalone AI agent', () => {
        useStandaloneAiAccessMock.mockReturnValue(
            createMockStandaloneAiAccess({
                isStandaloneAiAgent: true,
                statistics: { canRead: true, canWrite: true },
            }),
        )
        const { container } = renderWithContext()
        const statsLink = container.querySelector(
            `a[href="${STANDALONE_AI_AGENT_STATS_PATH}"]`,
        )
        expect(statsLink).toBeInTheDocument()
    })
})
