import {useMemo} from 'react'

import {useGetSettingsList} from 'models/convert/settings/queries'

import {GorgiasChatIntegration} from 'models/integration/types'
import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import {
    CaptureFormDisclaimerSettings,
    CampaignFrequencySettings,
} from 'pages/convert/settings/types'
import {CampaignSettingType} from 'pages/stats/convert/components/CampaignTableStats/constants'

export const useConvertGeneralSettings = (
    integration?: GorgiasChatIntegration
): {
    emailDisclaimer?: CaptureFormDisclaimerSettings
    campaignFrequency?: CampaignFrequencySettings
    isLoading: boolean
} => {
    const {channelConnection, isLoading: isChannelConnectionLoading} =
        useGetOrCreateChannelConnection(integration)

    const {data: settings, isLoading: isSettingsLoading} = useGetSettingsList(
        {
            channel_connection_id: channelConnection?.id as string,
        },
        {
            enabled: !!channelConnection,
        }
    )

    const data = useMemo(() => {
        return (settings || []).reduce(
            (accValue, currentValue) => {
                accValue[currentValue.type] = currentValue?.data

                return accValue
            },
            {} as Record<CampaignSettingType, any>
        )
    }, [settings])

    return {
        emailDisclaimer: data[
            CampaignSettingType.EmailDisclaimer
        ] as unknown as CaptureFormDisclaimerSettings | undefined,
        campaignFrequency: data[
            CampaignSettingType.CampaignFrequency
        ] as unknown as CampaignFrequencySettings | undefined,
        isLoading: isSettingsLoading || isChannelConnectionLoading,
    }
}
