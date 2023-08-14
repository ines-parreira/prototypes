import React, {useEffect, useState} from 'react'
import {Form} from 'reactstrap'
import _isEqual from 'lodash/isEqual'
import classnames from 'classnames'

import {
    isPhoneIntegration,
    PhoneIntegration,
    PhoneIntegrationVoicemailSettings,
    VoiceMessage,
} from 'models/integration/types'
import {VOICEMAIL_DEFAULT_VOICE_MESSAGE} from 'models/integration/constants'
import useAppDispatch from 'hooks/useAppDispatch'
import Button from 'pages/common/components/button/Button'
import ToggleInput from 'pages/common/forms/ToggleInput'
import {updatePhoneVoicemailConfiguration} from 'pages/integrations/integration/components/phone/actions'
import VoiceMessageField from 'pages/integrations/integration/components/voice/VoiceMessageField'
import useVoiceMessageValidation from 'pages/integrations/integration/components/voice/hooks/useVoiceMessageValidation'
import {PhoneFunction} from 'business/twilio'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'
import SettingsContent from 'pages/settings/SettingsContent'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import {fetchIntegrations} from 'state/integrations/actions'

import VoicemailOutsideBusinessHoursSection from './VoicemailOutsideBusinessHoursSection'
import css from './VoiceIntegrationVoicemail.less'

const SUCCESSFUL_SUBMIT_MESSAGE = 'Changes saved.'

type Props = {
    integration: Maybe<PhoneIntegration>
}

export default function VoiceIntegrationVoicemailNew({
    integration,
}: Props): JSX.Element | null {
    const dispatch = useAppDispatch()
    const [payload, setPayload] = useState<
        PhoneIntegrationVoicemailSettings | undefined
    >(integration?.meta?.voicemail)
    const [initialSettings, setInitialSettings] = useState<
        PhoneIntegrationVoicemailSettings | undefined
    >(integration?.meta?.voicemail)
    const {canPayloadBeSubmitted, cleanUpPayload, isValidTextToSpeech} =
        useVoiceMessageValidation()
    const [isLoading, setIsLoading] = useState(false)
    const isIvr = integration?.meta?.function === PhoneFunction.Ivr
    const defaultVoicemailSettings: PhoneIntegrationVoicemailSettings = {
        ...VOICEMAIL_DEFAULT_VOICE_MESSAGE,
        allow_to_leave_voicemail: true,
    }
    const useSameSettingsOutsideBusinessHours =
        payload?.outside_business_hours?.use_during_business_hours_settings ??
        true
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
                    SUCCESSFUL_SUBMIT_MESSAGE
                )
            )

            void dispatch(fetchIntegrations())

            setIsLoading(false)
        }
    }

    const handleChangeOutsideBusinessHoursVoiceMessage = (
        outsideBusinessHoursPayload: VoiceMessage
    ) => {
        // overwrite outside business hours with given voice message choices
        setPayload((payload) => ({
            ...(payload ?? defaultVoicemailSettings),
            outside_business_hours: {
                ...(payload?.outside_business_hours ?? {}),
                ...outsideBusinessHoursPayload,
                use_during_business_hours_settings:
                    useSameSettingsOutsideBusinessHours ?? true,
            },
        }))
    }

    const handleChangeUseSameSettings = (value: boolean) =>
        // overwrite just outside_business_hours.use_during_business_hours
        setPayload((payload) => ({
            ...(payload ?? defaultVoicemailSettings),
            outside_business_hours: {
                ...(payload?.outside_business_hours ??
                    VOICEMAIL_DEFAULT_VOICE_MESSAGE),
                use_during_business_hours_settings: value,
            },
        }))

    if (!isPhoneIntegration(integration)) {
        return null
    }

    return (
        <SettingsPageContainer>
            <SettingsContent>
                {isIvr ? (
                    <>
                        <h3 className={css.ivrTitleHeader}>Set Voicemail</h3>
                        <p className={css.ivrDetails}>
                            For IVR numbers, voicemail is only available outside
                            business hours.
                        </p>
                    </>
                ) : (
                    <h3
                        className={classnames(
                            css.sectionHeader,
                            css.duringBusinessHoursHeader
                        )}
                    >
                        During business hours
                    </h3>
                )}

                <Form onSubmit={onSubmit}>
                    <div>
                        <VoiceMessageField
                            value={payload ?? VOICEMAIL_DEFAULT_VOICE_MESSAGE}
                            onChange={(message) =>
                                setPayload((payload) => ({
                                    ...message,
                                    allow_to_leave_voicemail:
                                        payload?.allow_to_leave_voicemail ??
                                        true,
                                }))
                            }
                            horizontal={true}
                            allowNone
                        />
                    </div>

                    {!isIvr && (
                        <VoicemailOutsideBusinessHoursSection
                            outsideBusinessHoursSettings={
                                payload?.outside_business_hours
                            }
                            onChangeUseSameSettings={
                                handleChangeUseSameSettings
                            }
                            onChangeVoiceMessage={
                                handleChangeOutsideBusinessHoursVoiceMessage
                            }
                        />
                    )}

                    <h3 className={css.sectionHeader}>Caller Options</h3>
                    <ToggleInput
                        isToggled={payload?.allow_to_leave_voicemail ?? false}
                        onClick={(value: boolean) =>
                            setPayload((payload) => ({
                                ...(payload ?? VOICEMAIL_DEFAULT_VOICE_MESSAGE),
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
