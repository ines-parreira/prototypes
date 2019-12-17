import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {EmailIntegrationCreateForwarding} from '../EmailIntegrationCreateForwarding'


const commonProps = {
    integration: fromJS({
        id: 1,
        name: 'my integration',
        meta: {
            address: 'myintegration@gorgias.io'
        }
    }),
    forwardingEmailAddress: 'forwardingaddress@emails.gorgias.com'
}


describe('EmailIntegrationCreateForwarding component', () => {
    it('should render', () => {
        const component = shallow(
            <EmailIntegrationCreateForwarding
                {...commonProps}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render -copied!- button because the email address has just been copied', () => {
        const component = shallow(
            <EmailIntegrationCreateForwarding
                {...commonProps}
            />
        ).setState({isCopied: true})

        expect(component).toMatchSnapshot()
    })
})
