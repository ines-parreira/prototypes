import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {useCallback} from 'react'
import {Form} from 'reactstrap'

import {PhoneCountry} from 'business/twilio'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import {PhoneIntegration, isPhoneIntegration} from 'models/integration/types'
import Button from 'pages/common/components/button/Button'
import VoiceMessageField from 'pages/integrations/integration/components/voice/VoiceMessageField'

import SettingsContent from 'pages/settings/SettingsContent'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'

import {getNewPhoneNumbers} from 'state/entities/phoneNumbers/selectors'

import useVoiceIntegrationGreetingMessage from './hooks/useVoiceIntegrationGreetingMessage'
import css from './VoiceIntegrationGreetingMessage.less'
import WaitMusicField from './WaitMusicField'
import {DEFAULT_WAIT_MUSIC_PREFERENCES} from './waitMusicLibraryConstants'

type Props = {
    integration: PhoneIntegration
}

const MAX_RECORDING_DURATION = 30

export default function VoiceIntegrationGreetingMessage({
    integration,
}: Props): JSX.Element | null {
    const shouldDisplayWaitMusicSection =
        useFlags()[FeatureFlagKey.CustomWaitMusic]

    const phoneNumbers = useAppSelector(getNewPhoneNumbers)

    const integrationCountry = integration
        ? (phoneNumbers[integration.meta.phone_number_id].twilio_phone_number
              ?.address.country ?? PhoneCountry.US)
        : PhoneCountry.US

    const {
        greetingMessagePayload,
        setGreetingMessagePayload,
        waitMusicPayload,
        setWaitMusicPayload,
        isGreetingMessageLoading,
        isWaitMusicLoading,
        isSubmittable,
        makeApiCalls,
    } = useVoiceIntegrationGreetingMessage(integration)

    const onSubmit = useCallback(
        async (event: React.FormEvent) => {
            event.preventDefault()

            await makeApiCalls()
        },
        [makeApiCalls]
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
                            value={greetingMessagePayload}
                            onChange={setGreetingMessagePayload}
                            maxRecordingDuration={MAX_RECORDING_DURATION}
                            allowNone
                            horizontal={true}
                        />
                    </div>
                    {shouldDisplayWaitMusicSection && (
                        <div className={css.section}>
                            <h4 className={css.sectionTitle}>Wait music</h4>
                            <p className={css.sectionSubtitle}>
                                The music callers will hear while they are
                                waiting.
                            </p>
                            <WaitMusicField
                                preferences={
                                    waitMusicPayload ??
                                    DEFAULT_WAIT_MUSIC_PREFERENCES
                                }
                                onChange={setWaitMusicPayload}
                                integrationCountry={integrationCountry}
                            />
                        </div>
                    )}
                    <Button
                        type="submit"
                        isLoading={
                            isGreetingMessageLoading || isWaitMusicLoading
                        }
                        isDisabled={!isSubmittable}
                    >
                        Save changes
                    </Button>
                </Form>
            </SettingsContent>
        </SettingsPageContainer>
    )
}
