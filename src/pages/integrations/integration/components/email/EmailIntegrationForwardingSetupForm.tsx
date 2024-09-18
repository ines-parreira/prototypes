import React from 'react'
import Form from 'pages/settings/SLAs/features/SLAForm/views/Form'

import {EmailIntegration} from 'models/integration/types'
import FormField from 'pages/settings/SLAs/features/SLAForm/views/FormField'
import FormSection from 'pages/settings/SLAs/features/SLAForm/views/FormSection'
import FormRow from 'pages/common/forms/FormRow'
import CheckBoxField from 'pages/common/forms/CheckBoxField'

import BaseEmailIntegrationInputField from './BaseEmailIntegrationInputField'
import EmailIntegrationOnboardingButtons from './EmailIntegrationOnboardingButtons'
import {useEmailOnboarding} from './hooks/useEmailOnboarding'

import css from './EmailIntegrationForwardingSetupForm.less'

type Values = Partial<{checked: boolean}>

type Props = {
    integration?: EmailIntegration | undefined
}

export default function EmailIntegrationForwardingSetupForm(props: Props) {
    const {integration, sendVerification, isRequested} =
        useEmailOnboarding(props)
    const address = integration?.meta.address ?? ''

    const defaultValues = {
        checked: isRequested ?? false,
    }

    return (
        <div>
            <Form<Values>
                defaultValues={defaultValues}
                onSubmit={sendVerification}
            >
                <FormSection
                    title="Forward your support emails to Gorgias"
                    description="In this step, you will go to your email provider to set up forwarding rules
                    that will forward a copy of incoming customer emails to Gorgias, where they will appear as tickets."
                >
                    <FormRow>
                        <h3>
                            1. Sign into {address} and open the email forwarding
                            settings
                        </h3>
                        <p>
                            In a new window, sign into {address} and navigate to
                            the email forwarding settings.
                        </p>
                    </FormRow>
                    <FormRow>
                        <h3>
                            2. Update forwarding settings to forward a copy of
                            incoming customer emails to:
                        </h3>
                        <BaseEmailIntegrationInputField />
                    </FormRow>
                    <FormRow>
                        <h3>
                            3. Verify emails are forwarding into Gorgias
                            correctly
                        </h3>
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
                    isRequired
                />
                <EmailIntegrationOnboardingButtons integration={integration} />
            </Form>
        </div>
    )
}
