import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import {useGetSettingsList} from 'models/convert/settings/queries'

import {CampaignSettingType} from 'pages/stats/convert/components/CampaignTableStats/constants'
import {GorgiasChatIntegration} from 'models/integration/types'
import {CaptureFormDisclaimerSettings} from 'pages/convert/settings/types'

export const useEmailDisclaimerSettings = (
    integration?: GorgiasChatIntegration
): {
    data?: CaptureFormDisclaimerSettings
    isLoading: boolean
} => {
    const {channelConnection, isLoading: isChannelConnectionLoading} =
        useGetOrCreateChannelConnection(integration)

    const {data: settings, isLoading: isSettingsLoading} = useGetSettingsList(
        {
            channel_connection_id: channelConnection?.id as string,
            setting_type: CampaignSettingType.EmailDisclaimer,
        },
        {
            enabled: !!channelConnection,
        }
    )

    return {
        data: (settings || [])[0]?.data as unknown as
            | CaptureFormDisclaimerSettings
            | undefined,
        isLoading: isSettingsLoading || isChannelConnectionLoading,
    }
}
