import { mockFeatureFlagsValues } from '@repo/feature-flags/testing'
import { UserRole } from '@repo/permissions'
import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import { useCopilotEnabled } from '../useCopilotEnabled'

const renderWithRole = (role?: UserRole) =>
    renderHook(() => useCopilotEnabled(), {
        storeState: {
            currentUser: fromJS(role ? { role: { name: role } } : {}),
        },
    })

describe('useCopilotEnabled', () => {
    it('returns false when the EnableCopilotUi flag is not set', () => {
        const { result } = renderWithRole(UserRole.Admin)

        expect(result.current).toBe(false)
    })

    it.each([
        { role: UserRole.Agent, expected: true },
        { role: UserRole.Admin, expected: true },
        { role: UserRole.GorgiasAgent, expected: true },
        { role: UserRole.BasicAgent, expected: false },
        { role: UserRole.LiteAgent, expected: false },
        { role: UserRole.ObserverAgent, expected: false },
        { role: undefined, expected: false },
    ])(
        'returns $expected when the flag is enabled and the user role is $role',
        ({ role, expected }) => {
            mockFeatureFlagsValues({ 'linear-project_copilot-enabled': true })

            const { result } = renderWithRole(role)

            expect(result.current).toBe(expected)
        },
    )
})
