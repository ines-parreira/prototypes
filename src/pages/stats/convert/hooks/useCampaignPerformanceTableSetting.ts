import {useMemo} from 'react'
import {useParams} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {useGetSettingsList} from 'models/convert/settings/queries'
import {SettingRequest} from 'models/convert/settings/types'
import {GorgiasChatIntegration, IntegrationType} from 'models/integration/types'
import {CONVERT_ROUTE_PARAM_NAME} from 'pages/convert/common/constants'
import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import {ConvertRouteParams} from 'pages/convert/common/types'
import {useUpdateSetting} from 'pages/convert/settings/hooks/useUpdateSetting'
import {
    CampaignPerformanceTableDefaultConfigurationViews,
    CampaignSettingType,
} from 'pages/stats/convert/components/CampaignTableStats/constants'
import {useCampaignStatsFilters} from 'pages/stats/convert/hooks/useCampaignStatsFilters'
import {useGetChatForStore} from 'pages/stats/convert/hooks/useGetChatForStore'
import {CampaignTableKeys} from 'pages/stats/convert/types/enums/CampaignTableKeys.enum'

import {getIntegrationByIdAndType} from 'state/integrations/selectors'
import {TableView} from 'state/ui/stats/types'

export const useCampaignPerformanceTableSetting = () => {
    const {selectedIntegrations} = useCampaignStatsFilters()

    const {[CONVERT_ROUTE_PARAM_NAME]: chatIntegrationId} =
        useParams<ConvertRouteParams>()

    const storeChatIntegration = useGetChatForStore(selectedIntegrations[0])
    const routeChatIntegration = useAppSelector(
        getIntegrationByIdAndType<GorgiasChatIntegration>(
            parseInt(chatIntegrationId),
            IntegrationType.GorgiasChat
        )
    )
    const chatIntegration = useMemo(
        () => routeChatIntegration || storeChatIntegration,
        [routeChatIntegration, storeChatIntegration]
    )

    const {channelConnection, isLoading: isChannelConnectionLoading} =
        useGetOrCreateChannelConnection(chatIntegration)

    const {data: settings, isLoading: isSettingsLoading} = useGetSettingsList(
        {
            channel_connection_id: channelConnection?.id as string,
            setting_type: CampaignSettingType.PerformanceReportVisibleFields,
        },
        {
            enabled: !!channelConnection,
        }
    )

    const {mutateAsync: updateSetting} = useUpdateSetting()

    const currentSettings = useMemo(() => {
        if (!(settings && settings?.length > 0)) {
            return CampaignPerformanceTableDefaultConfigurationViews
        }

        return settings[0].data
    }, [settings]) as TableView<CampaignTableKeys>

    return {
        isLoading: isChannelConnectionLoading || isSettingsLoading,
        currentView: currentSettings,
        columnsOrder:
            (currentSettings.metrics || [])
                .filter((metric) => metric.visibility !== false)
                .map((metric) => metric.id) || [],
        submitActiveView: async (activeView: TableView<CampaignTableKeys>) => {
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
