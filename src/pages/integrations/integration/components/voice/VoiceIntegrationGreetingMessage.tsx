import React, {useCallback, useEffect, useState} from 'react'
import {Form} from 'reactstrap'

import useAppDispatch from 'hooks/useAppDispatch'
import {DEFAULT_GREETING_MESSAGE} from 'models/integration/constants'
import {
    PhoneIntegration,
    VoiceMessage,
    isPhoneIntegration,
} from 'models/integration/types'
import Button from 'pages/common/components/button/Button'
import {updatePhoneGreetingMessageConfiguration} from 'pages/integrations/integration/components/phone/actions'
import VoiceMessageField from 'pages/integrations/integration/components/voice/VoiceMessageField'

import SettingsContent from 'pages/settings/SettingsContent'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'

import {fetchIntegrations} from 'state/integrations/actions'

import useVoiceMessageValidation from './hooks/useVoiceMessageValidation'
import css from './VoiceIntegrationGreetingMessage.less'

type Props = {
    integration: Maybe<PhoneIntegration>
}

const MAX_RECORDING_DURATION = 30

export default function VoiceIntegrationGreetingMessage({
    integration,
}: Props): JSX.Element | null {
    const dispatch = useAppDispatch()
    const {areVoiceMessagesTheSame} = useVoiceMessageValidation()

    const integrationGreetingMessage =
        integration?.meta?.greeting_message ?? DEFAULT_GREETING_MESSAGE
    const [initialSettings, setInitialSettings] = useState<VoiceMessage>(
        integrationGreetingMessage
    )
    const [payload, setPayload] = useState<VoiceMessage>(
        integrationGreetingMessage
    )

    const isSubmittable = !areVoiceMessagesTheSame(payload, initialSettings)

    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (
            !areVoiceMessagesTheSame(
                initialSettings,
                integrationGreetingMessage
            )
        ) {
            setInitialSettings(integrationGreetingMessage)
            setPayload(integrationGreetingMessage)
        }
    }, [
        payload,
        setPayload,
        initialSettings,
        setInitialSettings,
        areVoiceMessagesTheSame,
        integrationGreetingMessage,
    ])

    const onSubmit = useCallback(
        async (event: React.FormEvent) => {
            event.preventDefault()

            setIsLoading(true)
            try {
                await dispatch(updatePhoneGreetingMessageConfiguration(payload))
                await dispatch(fetchIntegrations())
                setIsLoading(false)
            } catch (error) {
                setIsLoading(false)
            }
        },
        [payload, setIsLoading, dispatch]
    )

    if (!isPhoneIntegration(integration)) {
        return null
    }

    return (
        <SettingsPageContainer>
            <SettingsContent>
                <Form onSubmit={onSubmit}>
                    <div className={css.section}>
                        <h4 className={css.sectionTitle}>
                            Set greeting message
                        </h4>
                        <p className={css.sectionSubtitle}>
                            Message the caller will hear before the calls
                            starts.
                        </p>
                        <VoiceMessageField
                            value={payload}
                            onChange={setPayload}
                            maxRecordingDuration={MAX_RECORDING_DURATION}
                            allowNone
                            horizontal={true}
                        />
                    </div>

                    <Button
                        type="submit"
                        isLoading={isLoading}
                        isDisabled={!isSubmittable}
                    >
                        Save changes
                    </Button>
                </Form>
            </SettingsContent>
        </SettingsPageContainer>
    )
}
