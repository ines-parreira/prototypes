import React, { useCallback } from 'react'

import classNames from 'classnames'

import {
    LegacyCheckBoxField as CheckBoxField,
    LoadingSpinner,
} from '@gorgias/axiom'
import type { EmailIntegration } from '@gorgias/helpdesk-queries'

import { Form } from 'core/forms'
import FormRow from 'pages/common/forms/FormRow'
import BaseEmailIntegrationInputField from 'pages/integrations/integration/components/email/BaseEmailIntegrationInputField'
import EmailForwardingInstructions from 'pages/integrations/integration/components/email/CustomerOnboarding/EmailForwarding/EmailForwardingInstructions'
import EmailIntegrationOnboardingButtons from 'pages/integrations/integration/components/email/CustomerOnboarding/EmailIntegrationOnboardingButtons'
import { useEmailOnboarding } from 'pages/integrations/integration/components/email/hooks/useEmailOnboarding'
import FormSection from 'pages/settings/SLAs/features/SLAForm/views/FormSection'

import css from './EmailIntegrationForwardingSetupForm.less'

type Values = Partial<{ checked: boolean }>

type Props = {
    integration?: EmailIntegration | undefined
    handleCancel?: () => void
}

export default function EmailIntegrationForwardingSetupForm(props: Props) {
    const {
        integration,
        sendVerification,
        isRequested,
        goToNext,
        isVerified,
        isPending,
    } = useEmailOnboarding(props)

    const defaultValues = {
        checked: isRequested ?? false,
    }

    const handleSubmit = useCallback(() => {
        isRequested ? goToNext() : sendVerification()
    }, [sendVerification, isRequested, goToNext])

    return (
        <>
            <Form<Values>
                defaultValues={defaultValues}
                onValidSubmit={handleSubmit}
            >
                <FormSection
                    title="Forward customer emails to Gorgias"
                    description="Route all of your incoming customer emails from your email provider to your Gorgias inbox. Configuring email forwarding improves the deliverability and trustworthiness of your emails."
                    headingSize="large"
                >
                    <FormRow>
                        <BaseEmailIntegrationInputField label="Gorgias forwarding address" />
                    </FormRow>
                </FormSection>

                <EmailForwardingInstructions
                    email={integration?.meta?.address ?? ''}
                />

                <div className={css.loadingWrapper}>
                    {!isVerified && !isPending && !isRequested && (
                        <CheckBoxField
                            label="I confirm that I have set up email forwarding"
                            value={false}
                            onChange={sendVerification}
                        />
                    )}
                    {isRequested && isPending && !isVerified && (
                        <>
                            <LoadingSpinner size="small" />
                            <p className={css.forwardingFlowText}>
                                We’re sending you a test email to verify your
                                connection to Gorgias
                            </p>
                        </>
                    )}
                    {isVerified && (
                        <>
                            <span className={css.checkIcon}>
                                <i className="material-icons">
                                    <span className="material-icons-outlined">
                                        check
                                    </span>
                                </i>
                            </span>
                            <p className={css.forwardingFlowText}>
                                You’re all set! Customer conversations will
                                appear as tickets in your Gorgias inbox.
                            </p>
                        </>
                    )}
                    {!isPending && isRequested && !isVerified && (
                        <>
                            <i
                                className={classNames(
                                    css.errorIcon,
                                    'material-icons',
                                )}
                            >
                                <span className="material-icons-outlined">
                                    error_outline
                                </span>
                            </i>
                            <p className={css.forwardingFlowText}>
                                We couldn’t verify email forwarding. Please
                                check your forwarding settings and try again.
                            </p>
                        </>
                    )}
                </div>
                <EmailIntegrationOnboardingButtons
                    integration={integration}
                    cancelCallback={props.handleCancel}
                />
            </Form>
        </>
    )
}
