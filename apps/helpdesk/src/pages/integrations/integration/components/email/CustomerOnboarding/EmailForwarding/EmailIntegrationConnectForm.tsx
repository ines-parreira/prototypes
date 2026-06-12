import React from 'react'

import { Form, FormField } from '@repo/forms'
import type { EmailIntegration } from '@gorgias/helpdesk-queries'
import { pick } from '@gorgias/toolkit'

import { FormRow } from 'pages/common/forms/FormRow'
import { DefaultExportInputField as InputField } from 'pages/common/forms/input/InputField'
import { FormSection } from 'pages/settings/SLAs/features/SLAForm/views/FormSection'
import { isEmail } from 'utils'

import type { ConnectIntegrationPayload } from '../../hooks/useEmailOnboarding'
import { useEmailOnboarding } from '../../hooks/useEmailOnboarding'
import { EmailIntegrationOnboardingButtons } from '../EmailIntegrationOnboardingButtons'
import { EmailPreview } from './EmailPreview'

import css from '../EmailIntegrationOnboarding.less'

type Values = Partial<ConnectIntegrationPayload>

type Props = {
    integration?: EmailIntegration | undefined
    emailAddress?: string
    displayName?: string
    handleEmailChange: (val: string) => void
    handleDisplayChange: (val: string) => void
    handleCancel: () => void
}

export function EmailIntegrationConnectForm(props: Props) {
    const { integration, errors, connectIntegration } =
        useEmailOnboarding(props)

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
                            isRequired
                            label="Email"
                            caption="Please add a work email. We don't recommend using a personal email address (@gmail.com, @outlook.com)."
                            isDisabled={!!integration}
                            validation={{
                                validate: (value: string) =>
                                    isEmail(value) ||
                                    'Email format must include @ and a domain, e.g. example@domain.com',
                            }}
                        >
                            {(field) => (
                                <InputField
                                    {...field}
                                    placeholder="support@yourcompany.com"
                                    onChange={(value) => {
                                        props.handleEmailChange(value)
                                        field.onChange(value)
                                    }}
                                />
                            )}
                        </FormField>
                    </FormRow>
                    <FormRow>
                        <FormField
                            name="name"
                            isRequired
                            label="Email display name"
                            caption="The display name will appear in emails sent to customers. It must not include @, ;, <, >, [ ]."
                            validation={{
                                validate: (value: string) =>
                                    (!!value &&
                                        /^[^@,;<>\[\]]*$/g.test(value)) ||
                                    'The name that customers will see when they receive emails from you. Cannot contain these characters: @,;<>[]',
                            }}
                        >
                            {(field) => (
                                <InputField
                                    {...field}
                                    placeholder="Your Company Support"
                                    onChange={(value) => {
                                        props.handleDisplayChange(value)
                                        field.onChange(value)
                                    }}
                                />
                            )}
                        </FormField>
                    </FormRow>
                </FormSection>
                <div className={css.divider} />
                <EmailPreview
                    emailAddress={props.emailAddress}
                    displayName={props.displayName}
                />
                <EmailIntegrationOnboardingButtons
                    integration={integration}
                    cancelCallback={props.handleCancel}
                />
            </Form>
        </div>
    )
}
