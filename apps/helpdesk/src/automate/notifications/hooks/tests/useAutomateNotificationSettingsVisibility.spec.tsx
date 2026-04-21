import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'

import { AI_AGENT_SET_AND_OPTIMIZED_TYPE } from '../../constants'
import { useAutomateNotificationSettingsVisibility } from '../useAutomateNotificationSettingsVisibility'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

const useFlagMock = jest.mocked(useFlag)

describe('useAutomateNotificationSettingsVisibility', () => {
    it('should hide the AI agent onboarding notification when the flag is disabled', () => {
        useFlagMock.mockReturnValue(false)

        const { result } = renderHook(() =>
            useAutomateNotificationSettingsVisibility(),
        )

        expect(useFlagMock).toHaveBeenCalledWith(
            FeatureFlagKey.AiAgentOnboardingNotification,
        )
        expect(result.current).toEqual({
            hiddenNotificationTypes: [AI_AGENT_SET_AND_OPTIMIZED_TYPE],
        })
    })

    it('should keep all notification types visible when the flag is enabled', () => {
        useFlagMock.mockReturnValue(true)

        const { result } = renderHook(() =>
            useAutomateNotificationSettingsVisibility(),
        )

        expect(result.current).toEqual({
            hiddenNotificationTypes: [],
        })
    })
})
