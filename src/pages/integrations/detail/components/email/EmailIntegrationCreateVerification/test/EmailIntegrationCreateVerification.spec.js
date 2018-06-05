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

describe('EmailIntegrationCreateVerification component', () => {
    it('should render', () => {
        const component = shallow(
            <EmailIntegrationCreateVerification
                {...commonProps}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
