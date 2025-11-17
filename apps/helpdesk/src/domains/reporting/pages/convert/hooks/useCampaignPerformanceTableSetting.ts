import { useMemo } from 'react'

import { useParams } from 'react-router-dom'

import {
    CampaignPerformanceTableDefaultConfigurationViews,
    CampaignSettingType,
} from 'domains/reporting/pages/convert/components/CampaignTableStats/constants'
import { useCampaignStatsFilters } from 'domains/reporting/pages/convert/hooks/useCampaignStatsFilters'
import { useGetChatForStore } from 'domains/reporting/pages/convert/hooks/useGetChatForStore'
import type { CampaignTableKeys } from 'domains/reporting/pages/convert/types/enums/CampaignTableKeys.enum'
import type { TableView } from 'domains/reporting/state/ui/stats/types'
import useAppSelector from 'hooks/useAppSelector'
import { useGetSettingsList } from 'models/convert/settings/queries'
import type { SettingRequest } from 'models/convert/settings/types'
import type { GorgiasChatIntegration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import { CONVERT_ROUTE_PARAM_NAME } from 'pages/convert/common/constants'
import { useGetOrCreateChannelConnection } from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import type { ConvertRouteParams } from 'pages/convert/common/types'
import { useUpdateSetting } from 'pages/convert/settings/hooks/useUpdateSetting'
import { getIntegrationByIdAndType } from 'state/integrations/selectors'

export const useCampaignPerformanceTableSetting = () => {
    const { selectedIntegrations } = useCampaignStatsFilters()

    const { [CONVERT_ROUTE_PARAM_NAME]: chatIntegrationId } =
        useParams<ConvertRouteParams>()

    const storeChatIntegration = useGetChatForStore(selectedIntegrations[0])
    const routeChatIntegration = useAppSelector(
        getIntegrationByIdAndType<GorgiasChatIntegration>(
            parseInt(chatIntegrationId),
            IntegrationType.GorgiasChat,
        ),
    )
    const chatIntegration = useMemo(
        () => routeChatIntegration || storeChatIntegration,
        [routeChatIntegration, storeChatIntegration],
    )

    const { channelConnection, isLoading: isChannelConnectionLoading } =
        useGetOrCreateChannelConnection(chatIntegration)

    const { data: settings, isLoading: isSettingsLoading } = useGetSettingsList(
        {
            channel_connection_id: channelConnection?.id as string,
            setting_type: CampaignSettingType.PerformanceReportVisibleFields,
        },
        {
            enabled: !!channelConnection,
        },
    )

    const { mutateAsync: updateSetting } = useUpdateSetting()

    const currentSettings = useMemo(() => {
        if (!(settings && settings?.length > 0)) {
            return CampaignPerformanceTableDefaultConfigurationViews
        }

        return settings[0].data
    }, [settings]) as TableView<CampaignTableKeys, never>

    return {
        isLoading: isChannelConnectionLoading || isSettingsLoading,
        currentView: currentSettings,
        columnsOrder:
            (currentSettings.metrics || [])
                .filter((metric) => metric.visibility !== false)
                .map((metric) => metric.id) || [],
        submitActiveView: async (
            activeView: TableView<CampaignTableKeys, never>,
        ) => {
            const payload: SettingRequest = {
                type: CampaignSettingType.PerformanceReportVisibleFields,
                data: {
                    metrics: activeView.metrics,
                },
            }

            await updateSetting([
                undefined,
                {
                    channel_connection_id: channelConnection?.id as string,
                },
                payload,
            ])

            return Promise.resolve(true)
        },
    }
}
