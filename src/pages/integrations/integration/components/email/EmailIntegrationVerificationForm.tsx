import {EmailIntegration} from '@gorgias/api-queries'
import React from 'react'

import FormRow from 'pages/common/forms/FormRow'
import BaseEmailIntegrationInputField from 'pages/integrations/integration/components/email/BaseEmailIntegrationInputField'
import Form from 'pages/settings/SLAs/features/SLAForm/views/Form'
import FormSection from 'pages/settings/SLAs/features/SLAForm/views/FormSection'

import EmailIntegrationOnboardingButtons from './EmailIntegrationOnboardingButtons'

import css from './EmailIntegrationVerificationForm.less'
import {useEmailOnboarding} from './hooks/useEmailOnboarding'

type Props = {
    integration?: EmailIntegration | undefined
}

export default function EmailIntegrationVerificationForm(props: Props) {
    const {integration, sendVerification} = useEmailOnboarding(props)

    return (
        <Form onSubmit={sendVerification}>
            <FormContent {...props} />
            <EmailIntegrationOnboardingButtons integration={integration} />
        </Form>
    )
}

function FormContent(props: Props) {
    const {integration, isPending, isVerified} = useEmailOnboarding(props)

    if (isVerified) {
        return (
            <FormSection
                title="Your emails will appear in your Gorgias inbox as tickets."
                description={
                    <>
                        Your email integration has been verified! Your customer
                        emails will now appear in Gorgias as tickets you can
                        handle directly from your inbox.{' '}
                        <a href="https://docs.gorgias.com/en-US/handle-incoming-tickets-81832">
                            Learn more about handling tickets.
                        </a>
                    </>
                }
                headingSize="large"
                icon="check"
                iconClassName={css.successIcon}
            />
        )
    }

    if (isPending) {
        return (
            <FormSection
                title="Verification in progress..."
                description={
                    <>
                        We are waiting for the verification email we sent to{' '}
                        <span className={css.highlightedAddress}>
                            {integration?.meta.address}
                        </span>{' '}
                        to be forwarded back to Gorgias to verify your email
                        integration. This process can take up to 1 minute.
                    </>
                }
                headingSize="large"
                icon="autorenew"
                iconClassName="md-spin"
            />
        )
    }

    return (
        <FormSection
            title="We haven't received your forwarded email."
            description={
                <>
                    Please check you’ve set up the forwarding settings correctly
                    in your support email settings and then resend the
                    verification email to try again.{' '}
                    <a href="https://docs.gorgias.com/en-US/other-provider-81758">
                        View step-by-step email forwarding setup guides.
                    </a>
                </>
            }
            headingSize="large"
            icon="error_outline"
            iconClassName={css.errorIcon}
        >
            <FormRow>
                <BaseEmailIntegrationInputField label="Update forwarding settings to forward a copy of incoming customer emails to:" />
            </FormRow>
        </FormSection>
    )
}
