import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import { useMainNavigationItems } from 'common/navigation/hooks/useMainNavigationItems'
import { FeatureFlagKey } from 'config/featureFlags'
import { UserRole } from 'config/types/user'
import { useFlag } from 'core/flags'
import { useHasAiAgentMenu } from 'pages/aiAgent/hooks/useHasAiAgentMenu'
import { BASE_STATS_PATH } from 'routes/constants'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())

jest.mock('pages/aiAgent/hooks/useHasAiAgentMenu', () => ({
    useHasAiAgentMenu: jest.fn(),
}))
const useHasAiAgentMenuMock = assumeMock(useHasAiAgentMenu)

jest.mock('core/flags')
const mockUseFlag = useFlag as jest.Mock

describe('MainNavigation', () => {
    const basicUser = fromJS({ role: { name: UserRole.BasicAgent } })
    const agentUser = fromJS({ role: { name: UserRole.Agent } })
    const adminUser = fromJS({ role: { name: UserRole.Admin } })

    beforeEach(() => {
        mockUseFlag.mockImplementation(() => false)
    })

    it('should render the tickets menu item', () => {
        const { result } = renderHook(() => useMainNavigationItems(basicUser))
        expect(result.current.map((item) => item.url)).toContain('/app/tickets')
    })

    it('should not render the convert menu item for non-admins', () => {
        const { result } = renderHook(() => useMainNavigationItems(basicUser))
        expect(result.current.map((item) => item.url)).not.toContain(
            '/app/convert',
        )
    })

    it('should render the convert menu item for admins', () => {
        const { result } = renderHook(() => useMainNavigationItems(adminUser))
        expect(result.current.map((item) => item.url)).toContain('/app/convert')
    })

    it('should render the customers menu item', () => {
        const { result } = renderHook(() => useMainNavigationItems(basicUser))
        expect(result.current.map((item) => item.url)).toContain(
            '/app/customers',
        )
    })

    it('should render the statistics menu item', () => {
        const { result } = renderHook(() => useMainNavigationItems(basicUser))
        expect(result.current.map((item) => item.url)).toContain(
            BASE_STATS_PATH,
        )
    })

    it('should render the settings menu item', () => {
        const { result } = renderHook(() => useMainNavigationItems(basicUser))
        expect(result.current.map((item) => item.url)).toContain(
            '/app/settings',
        )
    })

    it('should not render the AI Agent menu item for non-agent users and useHasAiAgentMenu false', () => {
        useHasAiAgentMenuMock.mockReturnValue(false)
        const { result } = renderHook(() => useMainNavigationItems(basicUser))
        expect(result.current.map((item) => item.url)).not.toContain(
            '/app/ai-agent',
        )
    })

    it('should not render the AI Agent menu item if agent user and useHasAiAgentMenu false', () => {
        useHasAiAgentMenuMock.mockReturnValue(false)
        const { result } = renderHook(() => useMainNavigationItems(agentUser))
        expect(result.current.map((item) => item.url)).not.toContain(
            '/app/ai-agent',
        )
    })

    it('should render the AI Agent menu item if agent user and useHasAiAgentMenu true', () => {
        useHasAiAgentMenuMock.mockReturnValue(true)
        const { result } = renderHook(() => useMainNavigationItems(agentUser))
        expect(result.current.map((item) => item.url)).toContain(
            '/app/ai-agent',
        )
    })

    it('should not render the AI Journey menu item when FF is disabled', () => {
        const { result } = renderHook(() => useMainNavigationItems(basicUser))
        expect(result.current.map((item) => item.url)).not.toContain(
            '/app/ai-journey',
        )
    })
    it('should render the AI Journey menu item when FF is enabled', () => {
        mockUseFlag.mockImplementation((flag) =>
            flag === FeatureFlagKey.AiJourneyEnabled ? true : false,
        )
        const { result } = renderHook(() => useMainNavigationItems(basicUser))
        expect(result.current.map((item) => item.url)).toContain(
            '/app/ai-journey',
        )
    })
})
