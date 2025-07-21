import { useEffect } from 'react'

import { useFormContext } from 'react-hook-form'

import { PhoneFunction, PhoneIntegration } from '@gorgias/helpdesk-queries'
import { Button, Label, SelectField } from '@gorgias/merchant-ui-kit'
import type { SelectFieldRawOption } from '@gorgias/merchant-ui-kit'

import { FormField } from 'core/forms'
import useAppSelector from 'hooks/useAppSelector'
import useSearch from 'hooks/useSearch'
import { IntegrationType } from 'models/integration/constants'
import { NewPhoneNumber } from 'models/phoneNumber/types'
import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'
import EmojiTextInput from 'pages/common/forms/EmojiTextInput/EmojiTextInput'
import PhoneNumberSelectField from 'pages/phoneNumbers/PhoneNumberSelectField'
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
    const phoneFunction = watch('meta.function')

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
                    <FormField
                        name="name"
                        id="name"
                        field={EmojiTextInput}
                        emoji={emoji ?? null}
                        placeholder="Ex: Company Support Line"
                        isRequired
                        onEmojiChange={(emoji: string | null) =>
                            setValue('meta.emoji', emoji, {
                                shouldDirty: true,
                            })
                        }
                    />
                </div>
                <div>
                    <Label className={css.label}>Phone number</Label>
                    <FormField
                        field={PhoneNumberSelectField}
                        name={'meta.phone_number_id'}
                        integrationType={IntegrationType.Phone}
                        inputTransform={(value) =>
                            value ? phoneNumbers[value] : null
                        }
                        outputTransform={(phoneNumber) => phoneNumber?.id}
                        isRequired
                        onCreate={onCreateNewNumber}
                    />
                </div>
                <div>
                    <FormField
                        name={'meta.function'}
                        label={'Function'}
                        field={SelectField}
                        options={[PhoneFunction.Standard, PhoneFunction.Ivr]}
                        selectedOption={phoneFunction}
                        optionMapper={(option: SelectFieldRawOption) => ({
                            value:
                                option === PhoneFunction.Standard
                                    ? 'Standard'
                                    : 'IVR (Interactive Voice Response)',
                        })}
                    />
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
