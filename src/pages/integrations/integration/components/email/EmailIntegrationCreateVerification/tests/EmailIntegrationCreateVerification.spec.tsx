import {fireEvent, render} from '@testing-library/react'
import {fromJS} from 'immutable'
import React, {ComponentProps} from 'react'

import {EmailIntegrationCreateVerification} from 'pages/integrations/integration/components/email/EmailIntegrationCreateVerification/EmailIntegrationCreateVerification'
import * as helpers from 'pages/integrations/integration/components/email/helpers'
import {INTEGRATION_REMOVAL_CONFIGURATION_TEXT} from 'pages/integrations/integration/constants'

const isBaseEmailAddressSpy = jest.spyOn(helpers, 'isBaseEmailAddress')

const commonProps: ComponentProps<typeof EmailIntegrationCreateVerification> = {
    forwardingEmailAddress: 'hmq29fh29zfmh29fzq2f3@emails-acme.gorgi.us',
    integration: fromJS({
        id: 1,
        name: 'my integration',
        meta: {
            address: 'myintegration@gorgias.io',
        },
    }),
    emailForwardingActivated: false,
    deleteIntegration: jest.fn(),
    sendVerificationEmail: jest.fn(),
    notify: jest.fn(),
    resendAccountVerificationEmail: jest.fn(),
    verifyEmailIntegrationManually: jest.fn(),
}

describe('<EmailIntegrationCreateVerification/>', () => {
    describe('render()', () => {
        it('should render the regular instructions', () => {
            isBaseEmailAddressSpy.mockImplementation(() => false)

            const {container} = render(
                <EmailIntegrationCreateVerification {...commonProps} />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render instructions for the base email integration', () => {
            const integration = fromJS({
                id: 1,
                name: 'my integration',
                meta: {
                    address: 'myintegration@emails.gorgias.com',
                },
            })

            isBaseEmailAddressSpy.mockImplementation(() => true)

            const {container} = render(
                <EmailIntegrationCreateVerification
                    {...commonProps}
                    integration={integration}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render instructions for the activated forwarding email', () => {
            isBaseEmailAddressSpy.mockImplementation(() => false)

            const {container} = render(
                <EmailIntegrationCreateVerification
                    {...commonProps}
                    emailForwardingActivated
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should check the delete email message, it should not contain the text about "saved filters"', () => {
            isBaseEmailAddressSpy.mockImplementation(() => false)

            const {getByText} = render(
                <EmailIntegrationCreateVerification
                    {...commonProps}
                    emailForwardingActivated
                />
            )

            fireEvent.click(getByText(/Delete email address/i))

            expect(
                getByText(INTEGRATION_REMOVAL_CONFIGURATION_TEXT)
            ).toBeInTheDocument()
        })

        it('should check the delete email message, it should contain the text about "saved filters" when feature flag is enabled', () => {
            isBaseEmailAddressSpy.mockImplementation(() => false)

            const {getByText, getByRole} = render(
                <EmailIntegrationCreateVerification
                    {...{
                        ...commonProps,
                    }}
                    emailForwardingActivated
                />
            )

            fireEvent.click(
                getByRole('button', {name: /Delete email address/i})
            )

            expect(
                getByText(INTEGRATION_REMOVAL_CONFIGURATION_TEXT)
            ).toBeInTheDocument()
        })
    })
})
