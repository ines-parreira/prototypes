import { renderHook } from '@testing-library/react-hooks'
import { fromJS } from 'immutable'

import { useMainNavigationItems } from 'common/navigation/hooks/useMainNavigationItems'
import { UserRole } from 'config/types/user'
import { BASE_STATS_PATH } from 'routes/constants'

jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())

describe('MainNavigation', () => {
    const basicUser = fromJS({ role: { name: UserRole.BasicAgent } })
    const agentUser = fromJS({ role: { name: UserRole.Agent } })
    const adminUser = fromJS({ role: { name: UserRole.Admin } })

    it('should render the tickets menu item', () => {
        const { result } = renderHook(() => useMainNavigationItems(basicUser))
        expect(result.current.map((item) => item.url)).toContain('/app/tickets')
    })

    it('should not render the automate menu item for basic agents', () => {
        const { result } = renderHook(() => useMainNavigationItems(basicUser))
        expect(result.current.map((item) => item.url)).not.toContain(
            '/app/automation',
        )
    })

    it('should render the automate menu item for lead agents', () => {
        const { result } = renderHook(() => useMainNavigationItems(agentUser))
        expect(result.current.map((item) => item.url)).toContain(
            '/app/automation',
        )
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

    it('should not render the AI Agent menu item for non-agent users', () => {
        const { result } = renderHook(() => useMainNavigationItems(basicUser))
        expect(result.current.map((item) => item.url)).not.toContain(
            '/app/ai-agent',
        )
    })
})
