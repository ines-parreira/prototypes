import { useFormContext } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { UpdateAllPhoneIntegrationSettings } from '@gorgias/api-queries'
import { CustomRecordingType } from '@gorgias/api-types'

import { FormField } from 'core/forms'
import useAppSelector from 'hooks/useAppSelector'
import CheckBoxField from 'pages/common/forms/CheckBoxField'
import { getBusinessHoursSettings } from 'state/currentAccount/selectors'

import VoiceMessageField from './VoiceMessageField'

import css from './VoiceIntegrationSettingVoicemail.less'

function VoiceIntegrationSettingVoicemail() {
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
                    field={VoiceMessageField}
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
                    isDisabled={!hasBusinessHoursSet}
                    label={'Use same voicemail outside of business hours'}
                    caption={
                        !hasBusinessHoursSet && (
                            <Link to={'/app/settings/business-hours'}>
                                Set business hours
                            </Link>
                        )
                    }
                />
                {!useSameSettings && hasBusinessHoursSet && (
                    <div className={css.outsideBusinessHoursMessage}>
                        <FormField
                            name={'meta.voicemail.outside_business_hours'}
                            field={VoiceMessageField}
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
