import React, { useState } from 'react'

import pick from 'lodash/pick'

import type { EmailIntegration } from '@gorgias/helpdesk-queries'
import { Button } from '@gorgias/merchant-ui-kit'

import { Form, FormField } from 'core/forms'
import FormRow from 'pages/common/forms/FormRow'
import history from 'pages/history'
import EmailGenericModal from 'pages/integrations/integration/components/email/components/EmailGenericModal'
import FormSection from 'pages/settings/SLAs/features/SLAForm/views/FormSection'
import { isEmail } from 'utils'

import {
    ConnectIntegrationPayload,
    useEmailOnboarding,
} from '../../hooks/useEmailOnboarding'
import EmailIntegrationOnboardingButtons from '../EmailIntegrationOnboardingButtons'

import css from '../EmailIntegrationOnboarding.less'

type Values = Partial<ConnectIntegrationPayload>

type Props = {
    integration?: EmailIntegration | undefined
    emailAddress?: string
    displayName?: string
    handleEmailChange: (val: string) => void
    handleDisplayChange: (val: string) => void
}

export default function EmailIntegrationConnectForm(props: Props) {
    const { integration, errors, connectIntegration } =
        useEmailOnboarding(props)

    const [showWarningModal, setShowWarningModal] = useState(false)

    const defaultValues: Values = integration
        ? pick(integration, ['name', 'meta.address'])
        : {
              name: '',
              meta: {
                  address: '',
              },
          }

    const handleSubmit = (data: Values) => {
        connectIntegration(data as ConnectIntegrationPayload)
    }

    return (
        <div className="flex">
            <EmailGenericModal
                showModal={showWarningModal}
                title="Leave email setup?"
                description="If you leave now, you’ll lose your progress and the email integration won’t be created."
            >
                <Button
                    intent="secondary"
                    onClick={() => setShowWarningModal(false)}
                >
                    Back to Editing
                </Button>
                <Button
                    intent="destructive"
                    onClick={() => history.push('/app/settings/channels/email')}
                >
                    Discard Email integration
                </Button>
            </EmailGenericModal>
            <Form<Values>
                className={css.form}
                defaultValues={defaultValues}
                onValidSubmit={handleSubmit}
                errors={errors}
            >
                <FormSection
                    title="Add your support email"
                    description="Set up the email your customers will see when you reply from Gorgias. You’ll need admin access to your email provider to complete this step."
                    headingSize="large"
                >
                    <FormRow>
                        <FormField
                            name="meta.address"
                            label="Email"
                            caption="Please add a work email. We don't recommend using a personal email address (@gmail.com, @outlook.com)."
                            isRequired
                            placeholder="support@yourcompany.com"
                            isDisabled={!!integration}
                            outputTransform={(value) => {
                                props.handleEmailChange(value)
                                return value
                            }}
                            validation={{
                                validate: (value: string) =>
                                    isEmail(value) ||
                                    'Email format must include @ and a domain, e.g. example@domain.com',
                            }}
                        />
                    </FormRow>
                    <FormRow>
                        <FormField
                            name="name"
                            label="Email display name"
                            caption="The display name will appear in emails sent to customers. It must not include @, ;, <, >, [ ]."
                            placeholder="Your Company Support"
                            isRequired
                            outputTransform={(value) => {
                                props.handleDisplayChange(value)
                                return value
                            }}
                            validation={{
                                validate: (value: string) =>
                                    (!!value &&
                                        /^[^@,;<>\[\]]*$/g.test(value)) ||
                                    'The name that customers will see when they receive emails from you. Cannot contain these characters: @,;<>[]',
                            }}
                        />
                    </FormRow>
                </FormSection>
                <EmailIntegrationOnboardingButtons
                    integration={integration}
                    {...{
                        cancelCallback: () => {
                            if (props.emailAddress || props.displayName) {
                                setShowWarningModal(true)
                            } else {
                                setShowWarningModal(false)
                                history.push('/app/settings/channels/email')
                            }
                        },
                    }}
                />
            </Form>
        </div>
    )
}
