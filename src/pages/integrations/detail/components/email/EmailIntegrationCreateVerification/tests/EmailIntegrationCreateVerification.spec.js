import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {EmailIntegrationCreateVerification} from '../EmailIntegrationCreateVerification'


const commonProps = {
    integration: fromJS({
        id: 1,
        name: 'my integration',
        meta: {
            address: 'myintegration@gorgias.io'
        }
    }),
    verify: jest.fn(),
    sendVerificationEmail: jest.fn(),
    notify: jest.fn(),
}

describe('<EmailIntegrationCreateVerification/>', () => {
    describe('render()', () => {
        it('should render the regular instructions', () => {
            const component = shallow(
                <EmailIntegrationCreateVerification
                    {...commonProps}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render instructions for the base email integration', () => {
            window.EMAIL_FORWARDING_DOMAIN = 'emails.gorgias.io'

            const integration = fromJS({
                id: 1,
                name: 'my integration',
                meta: {
                    address: 'myintegration@emails.gorgias.io'
                }
            })

            const component = shallow(
                <EmailIntegrationCreateVerification
                    {...commonProps}
                    integration={integration}
                />
            )

            expect(component).toMatchSnapshot()

            delete window.EMAIL_FORWARDING_DOMAIN
        })
    })
})
