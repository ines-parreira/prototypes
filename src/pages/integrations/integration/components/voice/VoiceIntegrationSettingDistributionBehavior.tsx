import { Link } from 'react-router-dom'

import { UpdateAllPhoneIntegrationSettings } from '@gorgias/api-queries'
import { Label } from '@gorgias/merchant-ui-kit'

import { FormField, useFormContext } from 'core/forms'
import CheckBoxField from 'pages/common/forms/CheckBoxField'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import PreviewRadioFieldSet from 'pages/common/forms/PreviewRadioFieldSet'

import { PHONE_INTEGRATION_BASE_URL } from './constants'

import css from './VoiceIntegrationSettingDistributionBehavior.less'

type VoiceIntegrationSettingDistributionBehaviorProps = {
    showVoicemailOutsideBusinessHours?: boolean
}

function VoiceIntegrationSettingDistributionBehavior({
    showVoicemailOutsideBusinessHours = true,
}: VoiceIntegrationSettingDistributionBehaviorProps) {
    const { watch } = useFormContext<UpdateAllPhoneIntegrationSettings>()
    const send_calls_to_voicemail = watch('meta.send_calls_to_voicemail')

    return (
        <div className={css.container}>
            <FormField
                field={PreviewRadioFieldSet}
                name="meta.send_calls_to_voicemail"
                inputTransform={(value: boolean) =>
                    value ? 'send_calls_to_voicemail' : 'ring_agents'
                }
                outputTransform={(value) => value === 'send_calls_to_voicemail'}
                options={[
                    {
                        label: 'Ring to agents or teams',
                        caption:
                            'Route calls to a queue to ensure they reach the right agents or teams.',
                        value: 'ring_agents',
                    },
                    {
                        label: 'Send calls directly to voicemail',
                        caption:
                            'Calls will go directly to voicemail without ringing any agents or teams.',
                        value: 'send_calls_to_voicemail',
                    },
                ]}
            />
            {!send_calls_to_voicemail && (
                <div className={css.sectionData}>
                    <FormField
                        label={
                            <div className={css.labelWithTooltip}>
                                <Label>Queue name</Label>
                                <IconTooltip>
                                    When you assign a queue to this line, its
                                    settings—including assigned agents/teams,
                                    distribution mode, wait time, queue limit,
                                    and wait music—will be applied
                                    automatically. View or adjust settings in
                                    Queues.
                                </IconTooltip>
                            </div>
                        }
                        name="meta.queue_id"
                        type={'number'}
                        caption={
                            <>
                                Assigning a queue applies its settings
                                automatically. Adjust settings in{' '}
                                <Link
                                    to={`${PHONE_INTEGRATION_BASE_URL}/queues`}
                                >
                                    Queues
                                </Link>
                                .
                            </>
                        }
                    />
                    {showVoicemailOutsideBusinessHours && (
                        <FormField
                            name="meta.preferences.voicemail_outside_business_hours"
                            field={CheckBoxField}
                            label="Send calls to voicemail outside business hours"
                            caption="If a customer calls outside of business hours, they will be immediately forwarded to voicemail."
                        />
                    )}
                </div>
            )}
        </div>
    )
}

export default VoiceIntegrationSettingDistributionBehavior
