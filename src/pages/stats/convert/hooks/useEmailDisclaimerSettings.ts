import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import {useGetSettingsList} from 'models/convert/settings/queries'

import {CampaignSettingType} from 'pages/stats/convert/components/CampaignTableStats/constants'
import {useChatIntegration} from 'pages/convert/campaigns/hooks/useChatIntegration'

type EmailDisclaimerSetting = {
    data: {
        enabled: boolean
        disclaimer_default_accepted: boolean
        disclaimer: Record<string, string>
    }
}

export const useEmailDisclaimerSettings = () => {
    const integration = useChatIntegration().toJS()

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
        data: (settings || [])[0] as unknown as
            | EmailDisclaimerSetting
            | undefined,
        isLoading: isSettingsLoading || isChannelConnectionLoading,
    }
}
