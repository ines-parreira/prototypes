import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'

import EmailIntegrationUpdateLayout from '../EmailIntegrationUpdateLayout'

const minProps: ComponentProps<typeof EmailIntegrationUpdateLayout> = {
    integration: fromJS({
        id: 1,
        meta: {address: 'some-email@address.com'},
    }),
}

describe('EmailIntegrationUpdateLayout', () => {
    it('should render the layout for an email integration update', () => {
        const {container} = render(
            <EmailIntegrationUpdateLayout {...minProps}>
                <span>
                    Praesent commodo cursus magna, vel scelerisque nisl
                    consectetur et.
                </span>
            </EmailIntegrationUpdateLayout>
        )

        expect(container).toMatchSnapshot()
    })
})
