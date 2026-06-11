import { useEffect } from 'react'

import { FormField } from '@repo/forms'
import { useFormContext } from 'react-hook-form'

import { LegacyButton as Button, Label } from '@gorgias/axiom'
import type { PhoneIntegration } from '@gorgias/helpdesk-queries'

import useAppSelector from 'hooks/useAppSelector'
import { useSearch } from 'hooks/useSearch'
import { IntegrationType } from 'models/integration/constants'
import type { NewPhoneNumber } from 'models/phoneNumber/types'
import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'
import EmojiTextInput from 'pages/common/forms/EmojiTextInput/EmojiTextInput'
import PhoneNumberSelectField from 'pages/phoneNumbers/PhoneNumberSelectField'
import BusinessHoursSelectField from 'pages/settings/businessHours/BusinessHoursSelectField'
import { getNewPhoneNumbers } from 'state/entities/phoneNumbers/selectors'

import VoiceIntegrationOnboardingCancelButton from './VoiceIntegrationOnboardingCancelButton'

import css from './VoiceIntegrationOnboardingStep.less'

type Props = {
    onCreateNewNumber: (phoneNumber: NewPhoneNumber) => void
}

const AddPhoneNumberStep = ({ onCreateNewNumber }: Props) => {
    const { phoneNumberId } = useSearch<{
        phoneNumberId: string
    }>()
    const phoneNumbers = useAppSelector(getNewPhoneNumbers)

    const { goToNextStep } = useNavigateWizardSteps()
    const {
        setValue,
        watch,
        formState: { isValid },
    } = useFormContext<PhoneIntegration>()

    const emoji = watch('meta.emoji')

    useEffect(() => {
        if (phoneNumberId) {
            setValue('meta.phone_number_id', parseInt(phoneNumberId))
        }
    }, [phoneNumberId, setValue])

    return (
        <div className={css.container}>
            <div className={css.formContainer}>
                <div className={css.header}>Add phone number</div>
                <div>
                    <Label className={css.label}>Integration name</Label>
                    <FormField name="name" isRequired>
                        {(field) => (
                            <EmojiTextInput
                                {...field}
                                id="name"
                                emoji={emoji ?? null}
                                placeholder="Ex: Company Support Line"
                                onEmojiChange={(emoji: string | null) =>
                                    setValue('meta.emoji', emoji, {
                                        shouldDirty: true,
                                    })
                                }
                            />
                        )}
                    </FormField>
                </div>
                <div>
                    <Label className={css.label}>Phone number</Label>
                    <FormField name={'meta.phone_number_id'} isRequired>
                        {(field) => (
                            <PhoneNumberSelectField
                                {...field}
                                integrationType={IntegrationType.Phone}
                                onCreate={onCreateNewNumber}
                                value={
                                    field.value
                                        ? phoneNumbers[field.value]
                                        : null
                                }
                                onChange={(phoneNumber) =>
                                    field.onChange(phoneNumber?.id)
                                }
                            />
                        )}
                    </FormField>
                </div>
                <div>
                    <FormField name="business_hours_id" isRequired>
                        {(field) => <BusinessHoursSelectField {...field} />}
                    </FormField>
                </div>
            </div>
            <div className={css.buttons}>
                <VoiceIntegrationOnboardingCancelButton />
                <Button
                    intent="primary"
                    isDisabled={!isValid}
                    onClick={() => {
                        goToNextStep()
                    }}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}

export default AddPhoneNumberStep
