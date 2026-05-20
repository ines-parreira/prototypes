import { useMemo } from 'react'

import type { Map } from 'immutable'

import { useGetHelpCenter } from 'models/helpCenter/queries'
import type { GorgiasChatIntegration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import { useIsArticleRecommendationsEnabledWhileSunset } from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset'

type UseArticleRecommendationParams = {
    integration: Map<any, any>
}

export function useArticleRecommendation({
    integration,
}: UseArticleRecommendationParams) {
    const gorgiasChatIntegration = integration.toJS() as GorgiasChatIntegration
    const appId = gorgiasChatIntegration?.meta?.app_id
    const shopName = gorgiasChatIntegration?.meta?.shop_name
    const shopType = gorgiasChatIntegration?.meta?.shop_type

    const { enabledInSettings } =
        useIsArticleRecommendationsEnabledWhileSunset()

    const {
        selfServiceConfiguration,
        storeIntegration,
        isFetchPending: isSelfServiceConfigurationFetchPending,
    } = useSelfServiceConfiguration(shopType ?? '', shopName ?? '')

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
