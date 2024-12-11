import classNames from 'classnames'
import {fromJS} from 'immutable'
import {isEmpty, isEqual} from 'lodash'
import React, {useEffect, useMemo, useState} from 'react'
import {Link} from 'react-router-dom'
import {Form, Label} from 'reactstrap'

import {PhoneFunction} from 'business/twilio'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useAsyncFn from 'hooks/useAsyncFn'
import {
    PhoneIntegration,
    PhoneIntegrationMeta,
    PhoneIntegrationPreferences,
    PhoneRingingBehaviour,
    isPhoneIntegration,
} from 'models/integration/types'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
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
import {isValueInRange} from 'pages/integrations/integration/components/voice/utils'
import css from 'pages/integrations/integration/components/voice/VoiceIntegrationPreferences.less'
import VoiceIntegrationPreferencesCallRecordings from 'pages/integrations/integration/components/voice/VoiceIntegrationPreferencesCallRecordings'
import VoiceIntegrationPreferencesInboundCalls from 'pages/integrations/integration/components/voice/VoiceIntegrationPreferencesInboundCalls'
import VoiceIntegrationPreferencesTranscription from 'pages/integrations/integration/components/voice/VoiceIntegrationPreferencesTranscription'
import {useNotificationTextForRemovalMessage} from 'pages/integrations/integration/hooks/useNotificationTextForRemovalMessage'
import PhoneNumberTitle from 'pages/phoneNumbers/PhoneNumberTitle'
import settingsCss from 'pages/settings/settings.less'
import SettingsContent from 'pages/settings/SettingsContent'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'
import {getNewPhoneNumber} from 'state/entities/phoneNumbers/selectors'
import {
    deleteIntegration,
    updateOrCreateIntegration,
} from 'state/integrations/actions'

type Props = {
    integration: PhoneIntegration
}

export default function VoiceIntegrationPreferences({
    integration,
}: Props): JSX.Element {
    const [isInitialized, setIsInitialized] = useState(false)
    const [title, setTitle] = useState('')
    const [emoji, setEmoji] = useState<string | null>(null)
    const [phoneTeamId, setPhoneTeamId] = useState<Maybe<number | undefined>>(
        integration?.meta?.phone_team_id
    )
    const [preferences, setPreferences] = useState<PhoneIntegrationPreferences>(
        {
            record_inbound_calls: false,
            voicemail_outside_business_hours: false,
            record_outbound_calls: false,
            ringing_behaviour: PhoneRingingBehaviour.RoundRobin,
        }
    )

    const phoneNumberId = integration?.meta?.phone_number_id
    const phoneNumber = useAppSelector(getNewPhoneNumber(phoneNumberId))
    const dispatch = useAppDispatch()

    const confirmationContent = useNotificationTextForRemovalMessage()

    const [{loading: isLoading}, handleSubmit] = useAsyncFn(
        async (event?: React.FormEvent) => {
            event?.preventDefault()

            const newMeta: Partial<PhoneIntegrationMeta> = {
                emoji,
                preferences,
                phone_team_id: phoneTeamId,
            }

            await dispatch(
                updateOrCreateIntegration(
                    fromJS({
                        id: integration.id,
                        name: title,
                        meta: newMeta,
                    })
                )
            )
        },
        [integration, title, emoji, preferences, dispatch, phoneTeamId]
    )

    const [{loading: isDeleting}, handleDelete] = useAsyncFn(async () => {
        await dispatch(deleteIntegration(fromJS(integration)))
    }, [integration, dispatch])

    useEffect(() => {
        if (!isPhoneIntegration(integration) || isInitialized) {
            return
        }
        const {meta} = integration
        const {preferences} = meta

        setTitle(integration.name)
        setEmoji(meta.emoji)
        setPreferences(preferences)
        setIsInitialized(true)
    }, [integration, isInitialized])

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

    const canSubmit = () => {
        if (!isEmpty(validationErrors)) {
            return false
        }

        const integrationWithDefaults = {
            ...integration,
            meta: {
                ...integration.meta,
                preferences: preferencesWithDefaultValues(
                    integration.meta.preferences
                ),
            },
        }

        const unsubmittedSettingsWithDefaults = {
            name: title,
            meta: {
                ...integration.meta,
                ...(phoneTeamId !== undefined
                    ? {phone_team_id: phoneTeamId}
                    : {}),
                emoji,
                preferences: preferencesWithDefaultValues(preferences),
            },
        }

        const updatedIntegration = {
            ...integration,
            ...unsubmittedSettingsWithDefaults,
        }
        return !isEqual(integrationWithDefaults, updatedIntegration)
    }

    const isSubmittable = canSubmit()
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
                        <VoiceIntegrationPreferencesInboundCalls
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
                            <VoiceIntegrationPreferencesCallRecordings
                                preferences={preferences}
                                onPreferencesChange={handlePreferencesChange}
                            />
                            <VoiceIntegrationPreferencesTranscription
                                preferences={preferences}
                                onPreferencesChange={handlePreferencesChange}
                            />
                        </>
                    )}
                    <div>
                        <Button
                            type="submit"
                            isDisabled={!isInitialized || !isSubmittable}
                            isLoading={isLoading}
                        >
                            Save changes
                        </Button>
                        <ConfirmButton
                            className="float-right"
                            intent="destructive"
                            fillStyle="ghost"
                            isDisabled={!isInitialized}
                            isLoading={isDeleting}
                            onConfirm={handleDelete}
                            confirmationContent={confirmationContent}
                        >
                            <ButtonIconLabel icon="delete">
                                Delete integration
                            </ButtonIconLabel>
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
