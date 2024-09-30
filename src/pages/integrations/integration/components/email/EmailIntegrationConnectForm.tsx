import React from 'react'
import {pick} from 'lodash'
import Form from 'pages/settings/SLAs/features/SLAForm/views/Form'

import {EmailIntegration} from 'models/integration/types'
import FormField from 'pages/settings/SLAs/features/SLAForm/views/FormField'
import FormSection from 'pages/settings/SLAs/features/SLAForm/views/FormSection'
import FormRow from 'pages/common/forms/FormRow'
import {isEmail} from 'utils'

import EmailIntegrationOnboardingButtons from './EmailIntegrationOnboardingButtons'
import {
    ConnectIntegrationPayload,
    useEmailOnboarding,
} from './hooks/useEmailOnboarding'

type Values = Partial<ConnectIntegrationPayload>

type Props = {
    integration?: EmailIntegration | undefined
}

export default function EmailIntegrationConnectForm(props: Props) {
    const {integration, errors, connectIntegration} = useEmailOnboarding(props)

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
        <div>
            <Form<Values>
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
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
                        />
                    </FormRow>
                </FormSection>
                <EmailIntegrationOnboardingButtons integration={integration} />
            </Form>
        </div>
    )
}
