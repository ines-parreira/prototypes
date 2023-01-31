import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import * as helpers from 'pages/integrations/integration/components/email/helpers'
import {EmailIntegrationCreateVerification} from '../EmailIntegrationCreateVerification'

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

            const component = shallow(
                <EmailIntegrationCreateVerification {...commonProps} />
            )

            expect(component).toMatchSnapshot()
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

            const component = shallow(
                <EmailIntegrationCreateVerification
                    {...commonProps}
                    integration={integration}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render instructions for the activated forwarding email', () => {
            isBaseEmailAddressSpy.mockImplementation(() => false)

            const component = shallow(
                <EmailIntegrationCreateVerification
                    {...commonProps}
                    emailForwardingActivated
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
