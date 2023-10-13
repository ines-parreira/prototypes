import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'

import {EmailIntegrationCreateForwarding} from '../EmailIntegrationCreateForwarding'

const commonProps: ComponentProps<typeof EmailIntegrationCreateForwarding> = {
    integration: fromJS({
        id: 1,
        name: 'my integration',
        meta: {
            address: 'myintegration@gorgias.io',
        },
    }),
    forwardingEmailAddress: 'forwardingaddress@emails.gorgias.com',
    notify: jest.fn(),
    sendVerificationEmail: jest.fn(),
}

describe('EmailIntegrationCreateForwarding component', () => {
    it('should render', () => {
        const {container} = render(
            <EmailIntegrationCreateForwarding {...commonProps} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render -copied!- button because the email address has just been copied', () => {
        const {container} = render(
            <EmailIntegrationCreateForwarding {...commonProps} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
