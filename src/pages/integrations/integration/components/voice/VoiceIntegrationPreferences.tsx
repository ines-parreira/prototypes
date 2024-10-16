import React, {useEffect, useMemo, useState} from 'react'
import {Link} from 'react-router-dom'
import {fromJS} from 'immutable'
import {Form, Label} from 'reactstrap'

import classNames from 'classnames'
import {isEmpty, isEqual} from 'lodash'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {
    PhoneIntegration,
    PhoneIntegrationMeta,
    PhoneIntegrationPreferences,
    PhoneRingingBehaviour,
    isPhoneIntegration,
} from 'models/integration/types'
import {getNewPhoneNumber} from 'state/entities/phoneNumbers/selectors'
import EmojiTextInput from 'pages/common/forms/EmojiTextInput/EmojiTextInput'
import CheckBox from 'pages/common/forms/CheckBox'
import Button from 'pages/common/components/button/Button'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import PhoneNumberTitle from 'pages/phoneNumbers/PhoneNumberTitle'
import {
    deleteIntegration,
    updateOrCreateIntegration,
} from 'state/integrations/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import {PhoneFunction} from 'business/twilio'
import useAppSelector from 'hooks/useAppSelector'
import useAsyncFn from 'hooks/useAsyncFn'

import settingsCss from 'pages/settings/settings.less'

import {FeatureFlagKey} from 'config/featureFlags'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import VoiceIntegrationPreferencesInboundCalls from './VoiceIntegrationPreferencesInboundCalls'
import VoiceIntegrationPreferencesCallRecordings from './VoiceIntegrationPreferencesCallRecordings'
import VoiceIntegrationPreferencesTranscription from './VoiceIntegrationPreferencesTranscription'
import css from './VoiceIntegrationPreferences.less'
import {isValueInRange} from './utils'

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
    const useCallRecordings: boolean | undefined =
        useFlags()[FeatureFlagKey.RecordingTranscriptions]

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
            !isValueInRange(preferences.ring_time, 10, 600)
        ) {
            errors.ring_time =
                'Ring time must be between 10 and 600 seconds (10 minutes).'
        }
        return errors
    }, [preferences])

    const canSubmit = () => {
        if (!isEmpty(validationErrors)) {
            return false
        }

        const unsubmittedSettings = {
            name: title,
            meta: {
                ...integration.meta,
                ...(phoneTeamId !== undefined
                    ? {phone_team_id: phoneTeamId}
                    : {}),
                emoji,
                preferences,
            },
        }

        // handle the case where the transcribe flags are not present at all
        const integrationWithTranscribe = {
            ...integration,
            meta: {
                ...integration.meta,
                preferences: {
                    ...integration.meta.preferences,
                    transcribe: {
                        recordings: false,
                        voicemails: false,
                        ...(integration.meta.preferences.transcribe ?? {}),
                    },
                },
            },
        }
        const updatedIntegration = {...integration, ...unsubmittedSettings}
        return !(
            isEqual(integration, updatedIntegration) ||
            isEqual(integrationWithTranscribe, updatedIntegration)
        )
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

                {!isIvr && !useCallRecordings && (
                    <div className={css.formSection}>
                        <h2
                            className={classNames(
                                settingsCss.headingSection,
                                css.sectionHeader
                            )}
                        >
                            Outbound calls
                        </h2>
                        <CheckBox
                            isChecked={preferences.record_outbound_calls}
                            onChange={(value) =>
                                setPreferences((preferences) => ({
                                    ...preferences,
                                    record_outbound_calls: value,
                                }))
                            }
                        >
                            Start recording automatically
                        </CheckBox>
                    </div>
                )}
                {!!useCallRecordings && !isIvr && (
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
                        confirmationContent="Are you sure you want to delete this integration? All associated views will be disabled."
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
        </SettingsPageContainer>
    )
}
