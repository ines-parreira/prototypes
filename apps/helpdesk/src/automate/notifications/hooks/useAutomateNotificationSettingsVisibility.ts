import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { AI_AGENT_SET_AND_OPTIMIZED_TYPE } from '../constants'

type NotificationSettingsVisibility = {
    hiddenNotificationTypes: string[]
}

export const useAutomateNotificationSettingsVisibility =
    (): NotificationSettingsVisibility => {
        const isAiAgentOnboardingNotificationEnabled = useFlag(
            FeatureFlagKey.AiAgentOnboardingNotification,
        )

        return useMemo(
            () => ({
                hiddenNotificationTypes: isAiAgentOnboardingNotificationEnabled
                    ? []
                    : [AI_AGENT_SET_AND_OPTIMIZED_TYPE],
            }),
            [isAiAgentOnboardingNotificationEnabled],
        )
    }
