import React from 'react'
import {Link} from 'react-router-dom'

import {
    PhoneIntegrationVoicemailOutsideBusinessHoursSettings,
    VoiceMessage,
} from 'models/integration/types'
import {VOICEMAIL_DEFAULT_VOICE_MESSAGE} from 'models/integration/constants'
import VoiceMessageField from 'pages/integrations/integration/components/voice/VoiceMessageField'
import useAppSelector from 'hooks/useAppSelector'
import {getBusinessHoursSettings} from 'state/currentAccount/selectors'

import CheckBox from 'pages/common/forms/CheckBox'
import css from './VoiceIntegrationVoicemail.less'

type Props = {
    outsideBusinessHoursSettings: Maybe<PhoneIntegrationVoicemailOutsideBusinessHoursSettings>
    onChangeUseSameSettings: (value: boolean) => void
    onChangeVoiceMessage: (outsideBusinessHoursPayload: VoiceMessage) => void
}

export default function VoicemailOutsideBusinessHoursSection({
    outsideBusinessHoursSettings,
    onChangeVoiceMessage,
    onChangeUseSameSettings,
}: Props) {
    const accountBusinessHours = useAppSelector(getBusinessHoursSettings)
    const hasBusinessHoursSet =
        !!accountBusinessHours?.data?.business_hours?.length
    const useSameSettingsOutsideBusinessHours =
        outsideBusinessHoursSettings?.use_during_business_hours_settings ?? true

    const voiceMessage = {
        ...VOICEMAIL_DEFAULT_VOICE_MESSAGE,
        ...outsideBusinessHoursSettings,
    }

    return (
        <>
            <div className={css.outsideBusinessHoursContainer}>
                <h3 className={css.sectionHeader}>Outside business hours</h3>
                {!hasBusinessHoursSet && (
                    <Link
                        to="/app/settings/business-hours"
                        className={css.setBusinessHoursLink}
                    >
                        Set Business Hours
                    </Link>
                )}
            </div>
            <CheckBox
                isChecked={useSameSettingsOutsideBusinessHours}
                onChange={onChangeUseSameSettings}
                isDisabled={!hasBusinessHoursSet}
            >
                Use same voicemail as during business hours
            </CheckBox>

            {!useSameSettingsOutsideBusinessHours && hasBusinessHoursSet && (
                <div className={css.outsideBusinessHoursVoiceMessage}>
                    <VoiceMessageField
                        value={voiceMessage}
                        onChange={onChangeVoiceMessage}
                        horizontal={true}
                        allowNone
                        radioButtonId={'outsideBusinessHours'}
                    />
                </div>
            )}
        </>
    )
}
