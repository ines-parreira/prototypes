import { useMemo } from 'react'

import { TicketChannel } from 'business/types/ticket'
import { useGetHelpCenter } from 'models/helpCenter/queries'
import { IntegrationType } from 'models/integration/types'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import useSelfServiceChannels from 'pages/automate/common/hooks/useSelfServiceChannels'
import type { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import { useIsArticleRecommendationsEnabledWhileSunset } from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset'

type UseArticleRecommendationParams = {
    shopName: string
    shopType: string
}

export function useArticleRecommendation({
    shopName,
    shopType,
}: UseArticleRecommendationParams) {
    const { enabledInSettings } =
        useIsArticleRecommendationsEnabledWhileSunset()

    const {
        selfServiceConfiguration,
        storeIntegration,
        isFetchPending: isSelfServiceConfigurationFetchPending,
    } = useSelfServiceConfiguration(shopType, shopName)

    const channels = useSelfServiceChannels(shopType, shopName)

    const chatChannels = useMemo(
        () =>
            channels.filter(
                (c): c is SelfServiceChatChannel =>
                    c.type === TicketChannel.Chat,
            ),
        [channels],
    )

    const appId = chatChannels[0]?.value.meta.app_id

    const {
        applicationsAutomationSettings,
        isFetchPending: isAutomationSettingsFetchPending,
        handleChatApplicationAutomationSettingsUpdate,
    } = useApplicationsAutomationSettings(appId ? [appId] : [])

    const { data: helpCenterData, isError: helpCenterIsError } =
        useGetHelpCenter(
            selfServiceConfiguration?.articleRecommendationHelpCenterId ?? 0,
            {},
            {
                enabled:
                    !!selfServiceConfiguration?.articleRecommendationHelpCenterId,
                retry: 1,
            },
        )

    const isHelpCenterSelfServiceDeleted =
        !!helpCenterData?.deleted_datetime ||
        helpCenterIsError ||
        !selfServiceConfiguration?.articleRecommendationHelpCenterId

    const isArticleRecommendationEnabled = useMemo(() => {
        if (!appId) return false

        if (
            storeIntegration?.type === IntegrationType.Shopify &&
            !enabledInSettings
        ) {
            return false
        }

        return (
            applicationsAutomationSettings?.[appId]?.articleRecommendation
                ?.enabled ?? false
        )
    }, [
        appId,
        storeIntegration?.type,
        enabledInSettings,
        applicationsAutomationSettings,
    ])

    const isLoading =
        isSelfServiceConfigurationFetchPending ||
        isAutomationSettingsFetchPending

    const handleToggle = (value: boolean) => {
        if (!appId) return

        const applicationAutomationSettings =
            applicationsAutomationSettings?.[appId]

        if (!applicationAutomationSettings) return

        void handleChatApplicationAutomationSettingsUpdate(
            {
                ...applicationAutomationSettings,
                articleRecommendation: { enabled: value },
            },
            `Article Recommendation ${value ? 'enabled' : 'disabled'}`,
        )
    }

    return {
        enabledInSettings,
        isArticleRecommendationEnabled,
        isDisabled: isHelpCenterSelfServiceDeleted,
        isLoading,
        showHelpCenterRequired: isHelpCenterSelfServiceDeleted,
        handleToggle,
    }
}
