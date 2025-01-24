import classNames from 'classnames'
import React from 'react'
import {useFormContext} from 'react-hook-form'
import {Link} from 'react-router-dom'
import {Label} from 'reactstrap'

import {PhoneFunction} from 'business/twilio'
import FormField from 'components/Form/FormField'
import FormSubmitButton from 'components/Form/FormSubmitButton'
import useAppSelector from 'hooks/useAppSelector'
import {PhoneIntegration} from 'models/integration/types'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import EmojiTextInput from 'pages/common/forms/EmojiTextInput/EmojiTextInput'
import css from 'pages/integrations/integration/components/voice/VoiceIntegrationPreferences.less'
import VoiceIntegrationPreferencesCallRecordings from 'pages/integrations/integration/components/voice/VoiceIntegrationPreferencesCallRecordings'
import VoiceIntegrationPreferencesInboundCalls from 'pages/integrations/integration/components/voice/VoiceIntegrationPreferencesInboundCalls'
import VoiceIntegrationPreferencesTranscription from 'pages/integrations/integration/components/voice/VoiceIntegrationPreferencesTranscription'
import {useNotificationTextForRemovalMessage} from 'pages/integrations/integration/hooks/useNotificationTextForRemovalMessage'
import PhoneNumberTitle from 'pages/phoneNumbers/PhoneNumberTitle'
import settingsCss from 'pages/settings/settings.less'
import {getNewPhoneNumber} from 'state/entities/phoneNumbers/selectors'

import {useDeleteVoiceIntegration} from './useDeleteVoiceIntegration'
import useVoicePreferencesForm, {
    FormValues,
    useFormSubmit,
} from './useVoicePreferencesForm'

type Props = {
    integration: PhoneIntegration
}

export default function VoiceIntegrationPreferencesForm({
    integration,
}: Props): JSX.Element {
    useVoicePreferencesForm(integration)
    const {onSubmit} = useFormSubmit(integration)
    const {isDeleting, handleDelete} = useDeleteVoiceIntegration(integration)

    const methods = useFormContext<FormValues>()
    const {
        setValue,
        watch,
        formState: {isValid, isDirty, isSubmitting},
        handleSubmit,
    } = methods

    const emoji = watch('meta.emoji')
    const phoneNumberId = integration.meta.phone_number_id
    const phoneNumber = useAppSelector(getNewPhoneNumber(phoneNumberId))

    const confirmationContent = useNotificationTextForRemovalMessage()

    const isIvr = integration?.meta?.function === PhoneFunction.Ivr

    return (
        <>
            <div>
                <Label htmlFor="title" className="control-label">
                    App title
                </Label>
                <FormField
                    name="name"
                    id="title"
                    field={EmojiTextInput}
                    emoji={emoji}
                    placeholder="Ex: Company Support Line"
                    isRequired
                    onEmojiChange={(emoji: string | null) =>
                        setValue('meta.emoji', emoji, {
                            shouldDirty: true,
                        })
                    }
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
                <VoiceIntegrationPreferencesInboundCalls isIvr={isIvr} />
            </div>

            {!isIvr && (
                <>
                    <VoiceIntegrationPreferencesCallRecordings />
                    <VoiceIntegrationPreferencesTranscription />
                </>
            )}
            <div>
                <FormSubmitButton
                    type="submit"
                    isDisabled={!isValid || !isDirty}
                    isLoading={isSubmitting}
                >
                    Save changes
                </FormSubmitButton>
                <ConfirmButton
                    className="float-right"
                    intent="destructive"
                    fillStyle="ghost"
                    isLoading={isDeleting}
                    onConfirm={handleDelete}
                    confirmationContent={confirmationContent}
                    leadingIcon="delete"
                >
                    Delete integration
                </ConfirmButton>
            </div>
            <UnsavedChangesPrompt
                onSave={handleSubmit(onSubmit)}
                when={isDirty}
            />
        </>
    )
}
