import React, { useEffect, useState } from 'react'

import _isEqual from 'lodash/isEqual'
import { Form } from 'reactstrap'

import { Button } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import { VOICEMAIL_DEFAULT_VOICE_MESSAGE } from 'models/integration/constants'
import {
    isPhoneIntegration,
    PhoneIntegration,
    PhoneIntegrationVoicemailSettings,
} from 'models/integration/types'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import CheckBox from 'pages/common/forms/CheckBox'
import { updatePhoneVoicemailConfiguration } from 'pages/integrations/integration/components/phone/actions'
import useVoiceMessageValidation from 'pages/integrations/integration/components/voice/hooks/useVoiceMessageValidation'
import SettingsContent from 'pages/settings/SettingsContent'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'
import { fetchIntegrations } from 'state/integrations/actions'

import DEPRECATED_VoiceMessageField from './DEPRECATED_VoiceMessageField'

import css from './VoiceIntegrationVoicemail.less'

const SUCCESSFUL_SUBMIT_MESSAGE = 'Changes saved.'

type Props = {
    integration: Maybe<PhoneIntegration>
}

export default function VoiceIntegrationVoicemail({
    integration,
}: Props): JSX.Element | null {
    const dispatch = useAppDispatch()
    const [payload, setPayload] = useState<
        PhoneIntegrationVoicemailSettings | undefined
    >(integration?.meta?.voicemail)
    const [initialSettings, setInitialSettings] = useState<
        PhoneIntegrationVoicemailSettings | undefined
    >(integration?.meta?.voicemail)
    const { canPayloadBeSubmitted, cleanUpPayload, isValidTextToSpeech } =
        useVoiceMessageValidation()
    const [isLoading, setIsLoading] = useState(false)

    const isSubmittable =
        !_isEqual(cleanUpPayload(payload), cleanUpPayload(initialSettings)) &&
        isValidTextToSpeech(payload)

    useEffect(() => {
        if (!payload) {
            setPayload(integration?.meta?.voicemail)
        }
        if (
            !initialSettings ||
            !_isEqual(initialSettings, integration?.meta?.voicemail)
        ) {
            setInitialSettings(integration?.meta?.voicemail)
            setPayload(integration?.meta?.voicemail)
        }
    }, [integration, payload, setPayload, initialSettings, setInitialSettings])

    const onSubmit = async (event?: React.FormEvent) => {
        event?.preventDefault()

        const cleanPayload = cleanUpPayload(payload)

        if (canPayloadBeSubmitted(cleanPayload)) {
            setIsLoading(true)

            await dispatch(
                updatePhoneVoicemailConfiguration(
                    cleanPayload ?? {},
                    SUCCESSFUL_SUBMIT_MESSAGE,
                ),
            )

            void dispatch(fetchIntegrations())

            setIsLoading(false)
        }
    }

    if (!isPhoneIntegration(integration)) {
        return null
    }

    return (
        <SettingsPageContainer>
            <SettingsContent>
                <>
                    <h3 className={css.ivrTitleHeader}>Set Voicemail</h3>
                    <p className={css.ivrDetails}>
                        For IVR numbers, voicemail is only available outside
                        business hours.
                    </p>
                </>

                <Form onSubmit={onSubmit}>
                    <div>
                        <DEPRECATED_VoiceMessageField
                            value={payload ?? VOICEMAIL_DEFAULT_VOICE_MESSAGE}
                            onChange={(message) => {
                                setPayload((payload) => ({
                                    ...message,
                                    allow_to_leave_voicemail:
                                        payload?.allow_to_leave_voicemail ??
                                        true,
                                }))
                            }}
                            horizontal={true}
                            allowNone
                        />
                    </div>

                    <h3 className={css.sectionHeader}>Caller options</h3>
                    <CheckBox
                        isChecked={payload?.allow_to_leave_voicemail ?? false}
                        onChange={(value: boolean) =>
                            setPayload((payload) => ({
                                ...(payload ?? VOICEMAIL_DEFAULT_VOICE_MESSAGE),
                                allow_to_leave_voicemail: value,
                            }))
                        }
                        caption={
                            'When unchecked, the voicemail recording will play but the caller will not be able to leave a message.'
                        }
                    >
                        Allow caller to leave voicemail
                    </CheckBox>
                    <Button
                        className={css.sectionHeader}
                        type="submit"
                        isLoading={isLoading}
                        isDisabled={!isSubmittable}
                    >
                        Save changes
                    </Button>
                </Form>
                {isSubmittable && (
                    <UnsavedChangesPrompt
                        onSave={() => onSubmit()}
                        when={isSubmittable}
                    />
                )}
            </SettingsContent>
        </SettingsPageContainer>
    )
}
