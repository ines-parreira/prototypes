import React, { useState } from 'react'

import cn from 'classnames'
import pick from 'lodash/pick'

import type { EmailIntegration } from '@gorgias/helpdesk-queries'
import { Skeleton, Tag } from '@gorgias/merchant-ui-kit'

import { Form, FormField } from 'core/forms'
import FormRow from 'pages/common/forms/FormRow'
import FormSection from 'pages/settings/SLAs/features/SLAForm/views/FormSection'
import { isEmail } from 'utils'

import EmailIntegrationOnboardingButtons from './EmailIntegrationOnboardingButtons'
import {
    ConnectIntegrationPayload,
    useEmailOnboarding,
} from './hooks/useEmailOnboarding'

import css from './EmailIntegrationOnboarding.less'

type Values = Partial<ConnectIntegrationPayload>

type Props = {
    integration?: EmailIntegration | undefined
}

export default function EmailIntegrationConnectForm(props: Props) {
    const { integration, errors, connectIntegration } =
        useEmailOnboarding(props)
    const [emailAddress, setEmailAddress] = useState('')
    const [displayName, setDisplayName] = useState('')

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
                    title="Connect your support email"
                    description="In order to email your customers through Gorgias, you need to
                connect your support email. Enter the email address you
                currently use to talk with customers and then choose a display
                name that customers will see on your responses."
                    headingSize="large"
                >
                    <FormRow>
                        <FormField
                            name="meta.address"
                            label="Support email address"
                            caption="Enter the email address you currently use to talk with customers."
                            isRequired
                            isDisabled={!!integration}
                            outputTransform={(value) => {
                                setEmailAddress(value)
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
                            label="Display name"
                            caption="The name that customers will see when they receive emails from you. Cannot contain these characters: @,;<>[]"
                            isRequired
                            validation={{
                                validate: (value: string) =>
                                    (!!value &&
                                        /^[^@,;<>\[\]]*$/g.test(value)) ||
                                    'The name that customers will see when they receive emails from you. Cannot contain these characters: @,;<>[]',
                            }}
                            outputTransform={(value) => {
                                setDisplayName(value)
                                return value
                            }}
                        />
                    </FormRow>
                </FormSection>
                <EmailIntegrationOnboardingButtons integration={integration} />
            </Form>
            <div className={cn('full-width p-4', css.formPreview)}>
                <h4 className={css.formPreviewTitle}>Email Preview</h4>

                <div className={css.card}>
                    <div className="flex align-baseline">
                        <i
                            className={cn(
                                'material-icons-outlined',
                                css.emailIcon,
                            )}
                        >
                            email
                        </i>{' '}
                        <p className="heading-subsection-semibold">
                            New Message
                        </p>
                    </div>
                    <div className="flex flex-column">
                        <div className={css.emailPreviewTagWrapper}>
                            <p>From </p>
                            <Tag
                                text={`${displayName || '<Display name>'}${displayName && emailAddress ? ' ' : ''}${emailAddress ? `(${emailAddress})` : '(<Email>)'}`}
                                color="blue"
                            />
                        </div>

                        <div className={css.emailPreviewTagWrapper}>
                            <p>To </p>
                            <Tag
                                text="Customer name (customer@email.com)"
                                color="black"
                            />
                        </div>

                        <div className={css.divider} />
                        <Skeleton count={1} width={480} className="mb-2" />
                        <Skeleton count={1} width={430} />
                    </div>
                </div>
            </div>
        </div>
    )
}
