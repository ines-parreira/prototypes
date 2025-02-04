import {
    UpdatePhoneIntegrationSettings,
    useUpdatePhoneSettings,
} from '@gorgias/api-queries'
import classNames from 'classnames'
import {fromJS} from 'immutable'
import {isEmpty, isEqual} from 'lodash'

import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {Link} from 'react-router-dom'
import {Form, Label} from 'reactstrap'

import {PhoneFunction} from 'business/twilio'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useAsyncFn from 'hooks/useAsyncFn'
import {
    DEFAULT_RECORDING_NOTIFICATION,
    VoiceMessageType,
} from 'models/integration/constants'
import {
    PhoneIntegration,
    PhoneIntegrationPreferences,
    VoiceMessage,
    isPhoneIntegration,
} from 'models/integration/types'
import Button from 'pages/common/components/button/Button'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import EmojiTextInput from 'pages/common/forms/EmojiTextInput/EmojiTextInput'
import {
    RING_TIME_DEFAULT_VALUE,
    RING_TIME_MAX_VALUE,
    RING_TIME_MIN_VALUE,
    WAIT_TIME_DEFAULT_ENABLED,
    WAIT_TIME_DEFAULT_VALUE,
    WAIT_TIME_MAX_VALUE,
    WAIT_TIME_MIN_VALUE,
} from 'pages/integrations/integration/components/voice/constants'
import {
    getVoiceMessagePayload,
    isValueInRange,
} from 'pages/integrations/integration/components/voice/utils'
import css from 'pages/integrations/integration/components/voice/VoiceIntegrationPreferences.less'
import {INTEGRATION_REMOVAL_CONFIGURATION_TEXT} from 'pages/integrations/integration/constants'
import PhoneNumberTitle from 'pages/phoneNumbers/PhoneNumberTitle'
import settingsCss from 'pages/settings/settings.less'
import SettingsContent from 'pages/settings/SettingsContent'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'
import {getNewPhoneNumber} from 'state/entities/phoneNumbers/selectors'
import {deleteIntegration, fetchIntegrations} from 'state/integrations/actions'
import {UPDATE_INTEGRATION_ERROR} from 'state/integrations/constants'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import DEPRECATED_VoiceIntegrationPreferencesCallRecordings from './DEPRECATED_VoiceIntegrationPreferencesCallRecordings'
import DEPRECATED_VoiceIntegrationPreferencesInboundCalls from './DEPRECATED_VoiceIntegrationPreferencesInboundCalls'
import DEPRECATED_VoiceIntegrationPreferencesTranscription from './DEPRECATED_VoiceIntegrationPreferencesTranscription'
import useVoiceMessageValidation from './hooks/useVoiceMessageValidation'

type Props = {
    integration: PhoneIntegration
}

export default function DEPRECATED_VoiceIntegrationPreferences({
    integration,
}: Props): JSX.Element {
    const {areVoiceMessagesTheSame} = useVoiceMessageValidation()

    const [backendTitle, setBackendTitle] = useState(integration.name)
    const [backendMeta, setBackendMeta] = useState(integration.meta)

    const [title, setTitle] = useState(integration.name)
    const [emoji, setEmoji] = useState<string | null>(integration.meta.emoji)
    const [phoneTeamId, setPhoneTeamId] = useState<Maybe<number | undefined>>(
        integration.meta.phone_team_id
    )
    const [preferences, setPreferences] = useState<PhoneIntegrationPreferences>(
        integration.meta.preferences
    )
    const [recordingNotification, setRecordingNotification] =
        useState<VoiceMessage>(
            integration.meta.recording_notification ??
                DEFAULT_RECORDING_NOTIFICATION
        )

    const phoneNumberId = integration.meta.phone_number_id
    const phoneNumber = useAppSelector(getNewPhoneNumber(phoneNumberId))
    const dispatch = useAppDispatch()

    const {mutate: updatePhoneSettings, isLoading} = useUpdatePhoneSettings({
        mutation: {
            onSuccess: () => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Integration settings successfully updated.',
                    })
                )
                void dispatch(fetchIntegrations())
            },
            onError: (error) => {
                void dispatch({
                    type: UPDATE_INTEGRATION_ERROR,
                    error,
                    verbose: true,
                })
            },
        },
    })

    const [{loading: isDeleting}, handleDelete] = useAsyncFn(async () => {
        await dispatch(deleteIntegration(fromJS(integration)))
    }, [integration, dispatch])

    const validationErrors = useMemo(() => {
        const errors: Record<string, string> = {}
        if (
            preferences.ring_time !== undefined &&
            !isValueInRange(
                preferences.ring_time,
                RING_TIME_MIN_VALUE,
                RING_TIME_MAX_VALUE
            )
        ) {
            errors.ring_time =
                'Ring time must be between 10 and 600 seconds (10 minutes).'
        }
        if (
            preferences.wait_time?.value !== undefined &&
            !isValueInRange(
                preferences.wait_time.value,
                WAIT_TIME_MIN_VALUE,
                WAIT_TIME_MAX_VALUE
            )
        ) {
            errors.wait_time =
                'Wait time must be between 10 and 3600 seconds (1 hour).'
        }
        return errors
    }, [preferences])

    const preferencesWithDefaultValues = (
        inputPreferences: PhoneIntegrationPreferences
    ): PhoneIntegrationPreferences => {
        return {
            ring_time: RING_TIME_DEFAULT_VALUE,
            ...inputPreferences,
            transcribe: {
                recordings: false,
                voicemails: false,
                ...(inputPreferences.transcribe ?? {}),
            },
            wait_time: {
                enabled: WAIT_TIME_DEFAULT_ENABLED,
                value: WAIT_TIME_DEFAULT_VALUE,
                ...(inputPreferences.wait_time ?? {}),
            },
        }
    }

    useEffect(() => {
        if (!isEqual(backendTitle, integration.name)) {
            setTitle(integration.name)
            setBackendTitle(integration.name)
        }
        if (!isEqual(integration.meta, backendMeta)) {
            setEmoji(integration.meta.emoji)
            setPhoneTeamId(integration.meta.phone_team_id)
            setPreferences(integration.meta.preferences)
            setRecordingNotification(
                integration.meta.recording_notification ??
                    DEFAULT_RECORDING_NOTIFICATION
            )
            setBackendMeta(integration.meta)
        }
    }, [backendMeta, backendTitle, integration.meta, integration.name])

    const isRecordingNotificationValid = useMemo(() => {
        if (
            !preferences.record_inbound_calls &&
            !preferences.record_outbound_calls
        ) {
            return true
        }

        if (
            recordingNotification.voice_message_type ===
                VoiceMessageType.TextToSpeech &&
            !recordingNotification.text_to_speech_content
        ) {
            return false
        }

        if (
            recordingNotification.voice_message_type ===
                VoiceMessageType.VoiceRecording &&
            !recordingNotification.new_voice_recording_file &&
            !backendMeta.recording_notification?.voice_recording_file_path
        ) {
            return false
        }
        return true
    }, [
        backendMeta.recording_notification,
        preferences.record_inbound_calls,
        preferences.record_outbound_calls,
        recordingNotification,
    ])

    const isRecordingNotificationDirty = useMemo(() => {
        return !areVoiceMessagesTheSame(
            recordingNotification,
            backendMeta.recording_notification || DEFAULT_RECORDING_NOTIFICATION
        )
    }, [
        areVoiceMessagesTheSame,
        backendMeta.recording_notification,
        recordingNotification,
    ])

    const arePreferencesDirty = useMemo(() => {
        return !isEqual(
            preferencesWithDefaultValues(backendMeta.preferences),
            preferencesWithDefaultValues(preferences)
        )
    }, [backendMeta, preferences])

    const areRootSettingsDirty = useMemo(() => {
        return (
            title !== backendTitle ||
            emoji !== backendMeta.emoji ||
            phoneTeamId !== backendMeta.phone_team_id
        )
    }, [backendMeta, backendTitle, emoji, phoneTeamId, title])

    const isDirty =
        isRecordingNotificationDirty ||
        arePreferencesDirty ||
        areRootSettingsDirty

    const isValid = isEmpty(validationErrors) && isRecordingNotificationValid
    const isSubmittable = isDirty && isValid

    const handleSubmit = useCallback(
        (event?: React.FormEvent) => {
            event?.preventDefault()

            let newSettings: UpdatePhoneIntegrationSettings = {}

            if (areRootSettingsDirty) {
                newSettings = {
                    name: title,
                    emoji,
                    phone_team_id: phoneTeamId,
                }
            }

            if (arePreferencesDirty) {
                newSettings = {...newSettings, preferences}
            }

            if (isRecordingNotificationDirty) {
                const recordingNotificationPayload = getVoiceMessagePayload(
                    recordingNotification
                )
                newSettings = recordingNotificationPayload
                    ? {
                          ...newSettings,
                          recording_notification: recordingNotificationPayload,
                      }
                    : newSettings
            }

            updatePhoneSettings({
                integrationId: integration.id,
                data: newSettings,
            })
        },
        [
            arePreferencesDirty,
            areRootSettingsDirty,
            emoji,
            integration.id,
            isRecordingNotificationDirty,
            phoneTeamId,
            preferences,
            recordingNotification,
            title,
            updatePhoneSettings,
        ]
    )

    const handlePreferencesChange = (
        newPreferences: Partial<PhoneIntegrationPreferences>
    ) =>
        setPreferences((preferences) => ({
            ...preferences,
            ...newPreferences,
        }))

    if (!isPhoneIntegration(integration)) {
        return <div />
    }

    const isIvr = integration?.meta?.function === PhoneFunction.Ivr

    return (
        <SettingsPageContainer>
            <SettingsContent>
                <Form onSubmit={handleSubmit} className={css.form}>
                    <div>
                        <Label htmlFor="title" className="control-label">
                            App title
                        </Label>
                        <EmojiTextInput
                            id="title"
                            value={title}
                            emoji={emoji}
                            placeholder="Ex: Company Support Line"
                            required
                            onChange={setTitle}
                            onEmojiChange={setEmoji}
                        />
                    </div>
                    <div className={css.formSection}>
                        <h2
                            className={classNames(
                                settingsCss.headingSection,
                                css.sectionHeader
                            )}
                        >
                            Phone number
                        </h2>

                        <div className={css.appRow}>
                            {phoneNumber && (
                                <PhoneNumberTitle phoneNumber={phoneNumber} />
                            )}
                            <div className={css.appLink}>
                                <Link
                                    to={`/app/settings/phone-numbers/${integration.meta.phone_number_id}`}
                                >
                                    Manage Phone Number
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className={css.formSection}>
                        <DEPRECATED_VoiceIntegrationPreferencesInboundCalls
                            isIvr={isIvr}
                            preferences={preferences}
                            onPreferencesChange={handlePreferencesChange}
                            phoneTeamId={phoneTeamId}
                            onPhoneTeamIdChange={setPhoneTeamId}
                            errors={validationErrors}
                        />
                    </div>

                    {!isIvr && (
                        <>
                            <DEPRECATED_VoiceIntegrationPreferencesCallRecordings
                                preferences={preferences}
                                onPreferencesChange={handlePreferencesChange}
                                recordingNotification={recordingNotification}
                                onRecordingNotificationChange={
                                    setRecordingNotification
                                }
                            />
                            <DEPRECATED_VoiceIntegrationPreferencesTranscription
                                preferences={preferences}
                                onPreferencesChange={handlePreferencesChange}
                            />
                        </>
                    )}
                    <div>
                        <Button
                            type="submit"
                            isDisabled={!isSubmittable}
                            isLoading={isLoading}
                        >
                            Save changes
                        </Button>
                        <ConfirmButton
                            className="float-right"
                            intent="destructive"
                            fillStyle="ghost"
                            isLoading={isDeleting}
                            onConfirm={handleDelete}
                            confirmationContent={
                                INTEGRATION_REMOVAL_CONFIGURATION_TEXT
                            }
                            leadingIcon="delete"
                        >
                            Delete integration
                        </ConfirmButton>
                    </div>
                </Form>
                <UnsavedChangesPrompt
                    onSave={() => handleSubmit()}
                    when={isSubmittable}
                />
            </SettingsContent>
        </SettingsPageContainer>
    )
}
