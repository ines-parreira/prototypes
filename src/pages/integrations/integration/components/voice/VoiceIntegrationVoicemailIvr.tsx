import React, {useEffect, useState} from 'react'
import {Form} from 'reactstrap'

import {
    PhoneIntegration,
    PhoneIntegrationVoicemailSettings,
    isPhoneIntegration,
} from 'models/integration/types'
import {DEFAULT_VOICE_MESSAGE} from 'models/integration/constants'
import useAppDispatch from 'hooks/useAppDispatch'
import Button from 'pages/common/components/button/Button'
import ToggleInput from 'pages/common/forms/ToggleInput'
import {updatePhoneVoicemailConfiguration} from 'pages/integrations/integration/components/phone/actions'
import VoiceMessageField from 'pages/integrations/integration/components/voice/VoiceMessageField'
import useVoiceMessageValidation from 'pages/integrations/integration/components/voice/hooks/useVoiceMessageValidation'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'
import SettingsContent from 'pages/settings/SettingsContent'

import css from './VoiceIntegrationVoicemail.less'

type Props = {
    integration: Maybe<PhoneIntegration>
}

export default function VoiceIntegrationVoicemailIvr({
    integration,
}: Props): JSX.Element | null {
    const dispatch = useAppDispatch()
    const [payload, setPayload] = useState<
        PhoneIntegrationVoicemailSettings | undefined
    >(integration?.meta?.voicemail)
    const {canPayloadBeSubmitted} = useVoiceMessageValidation()
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (!payload) {
            setPayload(integration?.meta?.voicemail)
        }
    }, [integration, payload, setPayload])

    const onSubmit = async (event: React.FormEvent) => {
        event.preventDefault()

        if (canPayloadBeSubmitted(payload ?? {})) {
            setIsLoading(true)
            await dispatch(
                updatePhoneVoicemailConfiguration(
                    payload ?? {},
                    'Changes saved.'
                )
            )
            setIsLoading(false)
        }
    }

    if (!isPhoneIntegration(integration)) {
        return null
    }

    return (
        <SettingsPageContainer>
            <SettingsContent>
                <h3 className={css.ivrTitleHeader}>Set Voicemail</h3>
                <p className={css.ivrDetails}>
                    For IVR numbers, voicemail is only available outside
                    business hours.
                </p>
                <Form onSubmit={onSubmit}>
                    <VoiceMessageField
                        value={payload ?? DEFAULT_VOICE_MESSAGE}
                        onChange={(message) =>
                            setPayload({
                                ...message,
                                allow_to_leave_voicemail:
                                    payload?.allow_to_leave_voicemail ?? true,
                            })
                        }
                        horizontal={true}
                        allowNone
                    />

                    <h3 className={css.blockHeader}>Caller Options</h3>
                    <ToggleInput
                        isToggled={payload?.allow_to_leave_voicemail ?? false}
                        onClick={(value: boolean) =>
                            setPayload((payload) => ({
                                ...(payload ?? DEFAULT_VOICE_MESSAGE),
                                allow_to_leave_voicemail: value,
                            }))
                        }
                        caption={
                            'When disabled, the voicemail recording will play but the caller will not be able to leave a message.'
                        }
                    >
                        Allow caller to leave voicemail
                    </ToggleInput>
                    <Button
                        className={css.blockHeader}
                        type="submit"
                        isLoading={isLoading}
                    >
                        Save changes
                    </Button>
                </Form>
            </SettingsContent>
        </SettingsPageContainer>
    )
}
