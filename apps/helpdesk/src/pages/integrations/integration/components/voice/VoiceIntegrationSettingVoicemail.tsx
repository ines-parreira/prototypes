import { FeatureFlagKey } from '@repo/feature-flags'
import { useFormContext } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { UpdateAllPhoneIntegrationSettings } from '@gorgias/helpdesk-queries'
import { CustomRecordingType } from '@gorgias/helpdesk-types'

import { useFlag } from 'core/flags'
import { FormField } from 'core/forms'
import useAppSelector from 'hooks/useAppSelector'
import CheckBoxField from 'pages/common/forms/CheckBoxField'
import { getBusinessHoursSettings } from 'state/currentAccount/selectors'

import DEPRECATED_VoiceMessageField from './DEPRECATED_VoiceMessageField'

import css from './VoiceIntegrationSettingVoicemail.less'

function VoiceIntegrationSettingVoicemail() {
    const isCBHEnabled = useFlag(FeatureFlagKey.CustomBusinessHours)

    const accountBusinessHours = useAppSelector(getBusinessHoursSettings)
    const hasBusinessHoursSet =
        !!accountBusinessHours?.data?.business_hours?.length

    const { watch } = useFormContext<UpdateAllPhoneIntegrationSettings>()
    const useSameSettings = watch(
        'meta.voicemail.outside_business_hours.use_during_business_hours_settings',
    )

    return (
        <div className={css.container}>
            <div>
                <FormField
                    name={'meta.voicemail'}
                    field={DEPRECATED_VoiceMessageField}
                    allowNone
                    horizontal={true}
                    shouldUpload={true}
                    customRecordingType={
                        CustomRecordingType.VoicemailNotification
                    }
                    radioButtonId={'voicemail'}
                />
            </div>
            <div className={css.innerSection}>
                <FormField
                    name={
                        'meta.voicemail.outside_business_hours.use_during_business_hours_settings'
                    }
                    field={CheckBoxField}
                    isDisabled={!isCBHEnabled && !hasBusinessHoursSet}
                    label={'Use same voicemail outside of business hours'}
                    caption={
                        !isCBHEnabled &&
                        !hasBusinessHoursSet && (
                            <Link to={'/app/settings/business-hours'}>
                                Set business hours
                            </Link>
                        )
                    }
                />
                {!useSameSettings && (isCBHEnabled || hasBusinessHoursSet) && (
                    <div className={css.outsideBusinessHoursMessage}>
                        <FormField
                            name={'meta.voicemail.outside_business_hours'}
                            field={DEPRECATED_VoiceMessageField}
                            allowNone
                            horizontal={true}
                            shouldUpload={true}
                            customRecordingType={
                                CustomRecordingType.VoicemailNotification
                            }
                            radioButtonId={'voicemail-outside-business-hours'}
                        />
                    </div>
                )}
                <FormField
                    name={'meta.voicemail.allow_to_leave_voicemail'}
                    field={CheckBoxField}
                    label={'Allow caller to leave a voicemail'}
                    caption={
                        'When selected, callers will hear the voicemail greeting and can leave a message.'
                    }
                />
            </div>
        </div>
    )
}

export default VoiceIntegrationSettingVoicemail
