import {EmailIntegration} from '@gorgias/api-queries'
import {Label} from '@gorgias/merchant-ui-kit'
import React, {useCallback} from 'react'

import {Form} from 'components/Form/Form'
import FormField from 'components/Form/FormField'
import CheckBoxField from 'pages/common/forms/CheckBoxField'
import FormRow from 'pages/common/forms/FormRow'
import FormSection from 'pages/settings/SLAs/features/SLAForm/views/FormSection'

import BaseEmailIntegrationInputField from './BaseEmailIntegrationInputField'
import css from './EmailIntegrationForwardingSetupForm.less'
import EmailIntegrationOnboardingButtons from './EmailIntegrationOnboardingButtons'
import {useEmailOnboarding} from './hooks/useEmailOnboarding'

type Values = Partial<{checked: boolean}>

type Props = {
    integration?: EmailIntegration | undefined
}

export default function EmailIntegrationForwardingSetupForm(props: Props) {
    const {integration, sendVerification, isRequested, goToNext} =
        useEmailOnboarding(props)

    const address = integration?.meta.address ?? ''

    const defaultValues = {
        checked: isRequested ?? false,
    }

    const handleSubmit = useCallback(() => {
        isRequested ? goToNext() : sendVerification()
    }, [sendVerification, isRequested, goToNext])

    return (
        <div>
            <Form<Values>
                defaultValues={defaultValues}
                onValidSubmit={handleSubmit}
            >
                <FormSection
                    title="Forward your support emails to Gorgias"
                    description="In this step, you will go to your email provider to set up forwarding rules
                    that will forward a copy of incoming customer emails to Gorgias, where they will appear as tickets."
                    headingSize="large"
                >
                    <FormRow>
                        <Label>
                            1. Sign into {address} and open the email forwarding
                            settings
                        </Label>
                        <p>
                            In a new window, sign into {address} and navigate to
                            the email forwarding settings.
                        </p>
                    </FormRow>
                    <FormRow>
                        <BaseEmailIntegrationInputField label="2. Update forwarding settings to forward a copy of incoming customer emails to:" />
                    </FormRow>
                    <FormRow>
                        <Label>
                            3. Verify emails are forwarding into Gorgias
                            correctly
                        </Label>
                        <p>
                            Check the box to confirm you’ve updated your email
                            forwarding settings and begin verification – Gorgias
                            will send you an email to verify the forwarding loop
                            is successful.
                        </p>
                    </FormRow>
                </FormSection>
                <FormField
                    className={css.confirmCheckbox}
                    name="checked"
                    field={CheckBoxField}
                    label="Yes, I’ve set up email forwarding from my support email address to Gorgias"
                    caption="Check the box to confirm you’ve updated your email forwarding settings."
                    isDisabled={isRequested}
                    isRequired
                />
                <EmailIntegrationOnboardingButtons integration={integration} />
            </Form>
        </div>
    )
}
