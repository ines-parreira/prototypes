import React, { useCallback, useEffect, useState } from 'react'

import cn from 'classnames'

import useAppDispatch from 'hooks/useAppDispatch'
import { SettingRequest } from 'models/convert/settings/types'
import Button from 'pages/common/components/button/Button'
import Loader from 'pages/common/components/Loader/Loader'
import { useChatIntegration } from 'pages/convert/campaigns/hooks/useChatIntegration'
import { useGetOrCreateChannelConnection } from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import useIsCampaignProritizationEnabled from 'pages/convert/common/hooks/useIsCampaignProritizationEnabled'
import {
    CampaignFrequencySetting,
    defaultValidationValues,
} from 'pages/convert/settings/components/CampaignFrequencySetting'
import { TermsAndConditionsSetting } from 'pages/convert/settings/components/TermsAndConditionsSetting'
import { useUpdateSetting } from 'pages/convert/settings/hooks/useUpdateSetting'
import {
    CampaignFrequencySettings,
    DisclaimerSettings,
} from 'pages/convert/settings/types'
import settingsCss from 'pages/settings/settings.less'
import { CampaignSettingType } from 'pages/stats/convert/components/CampaignTableStats/constants'
import { useConvertGeneralSettings } from 'pages/stats/convert/hooks/useConvertGeneralSettings'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { toJS } from 'utils'

import css from './GeneralSettingsView.less'

export const GeneralSettingsView = () => {
    // We can set `true` as by default we set default values in the state
    const [isValid, setIsValid] = useState(true)
    const [disclaimerSettings, setDisclaimerSettings] =
        useState<DisclaimerSettings>({
            disclaimerEnabled: false,
            disclaimerMap: {},
            selectedLanguage: 'en',
            preSelectDisclaimer: false,
        })
    const [campaignFrequencySetting, setCampaignFrequencySettings] =
        useState<CampaignFrequencySettings>({
            min_time_between_campaigns: {
                value: defaultValidationValues.timeBetweenCampaigns
                    .defaultValue,
                unit: 'seconds',
            },
        })

    const { mutateAsync: updateSetting, isLoading: isSubmitLoading } =
        useUpdateSetting()
    const integration = useChatIntegration()
    const { channelConnection } = useGetOrCreateChannelConnection(
        toJS(integration),
    )

    const dispatch = useAppDispatch()

    const {
        emailDisclaimer: emailDisclaimerServerData,
        campaignFrequency: campaignFrequencyServerData,
        isLoading,
    } = useConvertGeneralSettings(integration.toJS())

    const isCampaignProritizationEnabled = useIsCampaignProritizationEnabled()

    useEffect(() => {
        if (!emailDisclaimerServerData) return
        setDisclaimerSettings((state) => ({
            ...state,
            disclaimerEnabled: emailDisclaimerServerData.enabled,
            disclaimerMap: emailDisclaimerServerData.disclaimer,
            preSelectDisclaimer:
                emailDisclaimerServerData.disclaimer_default_accepted,
        }))
    }, [emailDisclaimerServerData])

    useEffect(() => {
        if (!campaignFrequencyServerData) return
        setCampaignFrequencySettings((state) => ({
            ...state,
            ...campaignFrequencyServerData,
        }))
    }, [campaignFrequencyServerData])

    const handleSubmit = useCallback(async () => {
        const payload: SettingRequest[] = [
            {
                type: CampaignSettingType.EmailDisclaimer,
                data: {
                    enabled: disclaimerSettings.disclaimerEnabled,
                    disclaimer: disclaimerSettings.disclaimerMap,
                    disclaimer_default_accepted:
                        disclaimerSettings.preSelectDisclaimer,
                },
            },
            {
                type: CampaignSettingType.CampaignFrequency,
                data: {
                    max_campaign_in_session:
                        campaignFrequencySetting.max_campaign_in_session,
                    min_time_between_campaigns:
                        campaignFrequencySetting.min_time_between_campaigns,
                },
            },
        ]

        try {
            await updateSetting([
                undefined,
                {
                    channel_connection_id: channelConnection?.id as string,
                },
                payload,
            ])
        } catch {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'An unexpected error happened.',
                }),
            )
            return Promise.resolve(false)
        }

        void dispatch(
            notify({
                status: NotificationStatus.Success,
                message: 'Settings updated.',
            }),
        )

        return Promise.resolve(true)
    }, [
        channelConnection?.id,
        disclaimerSettings,
        campaignFrequencySetting,
        dispatch,
        updateSetting,
    ])

    const onValidationChange = useCallback(
        (isValid: boolean) => {
            setIsValid(isValid)
        },
        [setIsValid],
    )

    return (
        <div
            className={cn(
                settingsCss.contentWrapper,
                settingsCss.pageContainer,
                css.container,
            )}
        >
            {isLoading ? (
                <Loader />
            ) : (
                <>
                    {isCampaignProritizationEnabled && (
                        <CampaignFrequencySetting
                            campaignFrequencySettings={campaignFrequencySetting}
                            onSettingsChange={setCampaignFrequencySettings}
                            onValidationChange={onValidationChange}
                        />
                    )}
                    <TermsAndConditionsSetting
                        disclaimerSettings={disclaimerSettings}
                        onDisclaimerSettingsChange={setDisclaimerSettings}
                        onErrorChange={setIsValid}
                        chatIntegration={integration}
                    />
                </>
            )}
            <div className={css.ctaContainer}>
                <Button
                    isLoading={isSubmitLoading}
                    intent="primary"
                    onClick={handleSubmit}
                    isDisabled={!isValid}
                >
                    Save Changes
                </Button>
            </div>
        </div>
    )
}
