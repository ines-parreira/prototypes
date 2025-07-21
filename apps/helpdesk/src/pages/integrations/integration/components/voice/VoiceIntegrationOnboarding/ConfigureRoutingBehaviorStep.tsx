import React from 'react'

import { PhoneFunction, PhoneIntegration } from '@gorgias/helpdesk-queries'
import { Button } from '@gorgias/merchant-ui-kit'

import { FormSubmitButton, useFormContext } from 'core/forms'
import useAppSelector from 'hooks/useAppSelector'
import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'
import { getNewPhoneNumbers } from 'state/entities/phoneNumbers/selectors'

import VoiceIntegrationSettingDistributionBehavior from '../VoiceIntegrationSettingDistributionBehavior'
import VoiceIntegrationOnboardingCancelButton from './VoiceIntegrationOnboardingCancelButton'

import css from './VoiceIntegrationOnboardingStep.less'

export default function ConfigureRoutingBehaviorStep() {
    const { goToPreviousStep } = useNavigateWizardSteps()
    const phoneNumbers = useAppSelector(getNewPhoneNumbers)
    const {
        watch,
        formState: { isValid },
    } = useFormContext<PhoneIntegration>()

    const [phoneFunction, phoneNumberId, queue_id, send_calls_to_voicemail] =
        watch([
            'meta.function',
            'meta.phone_number_id',
            'meta.queue_id',
            'meta.send_calls_to_voicemail',
        ])

    const isSubmitEnabled =
        isValid &&
        (phoneFunction === PhoneFunction.Ivr ||
            send_calls_to_voicemail ||
            queue_id)

    const getPhoneNumberName = (phoneNumberId: number | undefined) => {
        if (!phoneNumberId) {
            return 'this phone line'
        }
        const phoneNumber = phoneNumbers[phoneNumberId]
        return phoneNumber
            ? `${phoneNumber.name} - (${phoneNumber.phone_number_friendly})`
            : 'this phone line'
    }

    return (
        <>
            <div className={css.container}>
                {phoneFunction === PhoneFunction.Ivr ? (
                    <div>
                        <div className={css.header}>{"You're all set."}</div>
                        <div className={css.headerDescription}>
                            Once your voice integration is complete, navigate to
                            the IVR section within the new integration to
                            configure your IVR settings.
                        </div>
                    </div>
                ) : (
                    <div className={css.formContainer}>
                        <div>
                            <div className={css.header}>Routing behavior</div>
                            <div className={css.headerDescription}>
                                Decide how incoming calls to{' '}
                                <b>{getPhoneNumberName(phoneNumberId)}</b>{' '}
                                should be handled.
                            </div>
                        </div>
                        <VoiceIntegrationSettingDistributionBehavior
                            showVoicemailOutsideBusinessHours={false}
                        />
                    </div>
                )}
            </div>
            <div className={css.buttons}>
                <VoiceIntegrationOnboardingCancelButton />
                <div className={css.navigationButtons}>
                    <Button intent="secondary" onClick={goToPreviousStep}>
                        Back
                    </Button>
                    <FormSubmitButton isDisabled={!isSubmitEnabled}>
                        Create voice integration
                    </FormSubmitButton>
                </div>
            </div>
        </>
    )
}
