import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'

import EmailIntegrationUpdateLayout from '../EmailIntegrationUpdateLayout.tsx'

const EmailIntegration = fromJS({
    id: 1,
    meta: {address: 'some-email@addres.com'},
})

describe('EmailIntegrationUpdateLayout', () => {
    it('should render the layout for an email integration update', () => {
        const {container} = render(
            <EmailIntegrationUpdateLayout integration={EmailIntegration}>
                <span>
                    Praesent commodo cursus magna, vel scelerisque nisl
                    consectetur et.
                </span>
            </EmailIntegrationUpdateLayout>
        )

        expect(container).toMatchSnapshot()
    })
})
