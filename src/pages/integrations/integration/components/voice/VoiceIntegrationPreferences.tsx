import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import {fromJS} from 'immutable'
import {Form, Label} from 'reactstrap'

import classNames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {cloneDeep} from 'lodash'
import {
    PhoneIntegration,
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

import SettingsPageContainer from 'pages/settings/SettingsPageContainer'
import {FeatureFlagKey} from 'config/featureFlags'
import VoiceIntegrationPreferencesInboundCalls from './VoiceIntegrationPreferencesInboundCalls'
import VoiceIntegrationPreferencesHoldMusic from './VoiceIntegrationPreferencesHoldMusic'
import css from './VoiceIntegrationPreferences.less'

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
            custom_hold_music: null,
        }
    )

    const callHoldEnabled = useFlags()[FeatureFlagKey.CallOnHold]

    const phoneNumberId = integration?.meta?.phone_number_id
    const phoneNumber = useAppSelector(getNewPhoneNumber(phoneNumberId))
    const dispatch = useAppDispatch()

    const [{loading: isLoading}, handleSubmit] = useAsyncFn(
        async (event: React.FormEvent) => {
            event.preventDefault()
            const newPreferences = cloneDeep(preferences)

            if (!callHoldEnabled) {
                delete newPreferences.custom_hold_music
            }

            await dispatch(
                updateOrCreateIntegration(
                    fromJS({
                        id: integration.id,
                        name: title,
                        meta: {
                            emoji,
                            preferences: newPreferences,
                            phone_team_id: phoneTeamId,
                        },
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
        setPreferences({
            ...preferences,
            // To be removed when FeatureFlagKey.CallOnHold is removed
            custom_hold_music: preferences.custom_hold_music,
        })
        setIsInitialized(true)
    }, [integration, isInitialized])

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
                        onPreferencesChange={(newPreferences) =>
                            setPreferences((preferences) => ({
                                ...preferences,
                                ...newPreferences,
                            }))
                        }
                        phoneTeamId={phoneTeamId}
                        onPhoneTeamIdChange={setPhoneTeamId}
                    />
                </div>

                {!isIvr && (
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
                {callHoldEnabled && (
                    <div className={css.formSection}>
                        <VoiceIntegrationPreferencesHoldMusic
                            preferences={preferences}
                            onPreferencesChange={(newPreferences) =>
                                setPreferences((preferences) => ({
                                    ...preferences,
                                    ...newPreferences,
                                }))
                            }
                        />
                    </div>
                )}
                <div>
                    <Button
                        type="submit"
                        isDisabled={!isInitialized}
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
        </SettingsPageContainer>
    )
}
