import {useMemo} from 'react'
import {useParams} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {toJS} from 'utils'
import {TableView} from 'state/ui/stats/types'
import {getIntegrationById} from 'state/integrations/selectors'
import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import {SettingRequest} from 'models/convert/settings/types'
import {useGetSettingsList} from 'models/convert/settings/queries'
import {useUpdateSetting} from 'pages/convert/settings/hooks/useUpdateSetting'
import {CONVERT_ROUTE_PARAM_NAME} from 'pages/convert/common/constants'
import {ConvertRouteParams} from 'pages/convert/common/types'
import {CampaignTableKeys} from 'pages/stats/convert/types/enums/CampaignTableKeys.enum'

import {
    CampaignPerformanceTableDefaultConfigurationViews,
    CampaignSettingIdentifier,
} from 'pages/stats/convert/components/CampaignTableStats/constants'

export const useCampaignPerformanceTableSetting = () => {
    const {[CONVERT_ROUTE_PARAM_NAME]: integrationId} =
        useParams<ConvertRouteParams>()
    const chatIntegrationId = parseInt(integrationId)

    const integration = useAppSelector(getIntegrationById(chatIntegrationId))

    const {channelConnection, isLoading: isChannelConnectionLoading} =
        useGetOrCreateChannelConnection(toJS(integration))

    const {data: settings, isLoading: isSettingsLoading} = useGetSettingsList(
        {
            channel_connection_id: channelConnection?.id as string,
            setting_type: CampaignSettingIdentifier,
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
                type: CampaignSettingIdentifier,
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
