import React from 'react'
import {render} from 'enzyme'
import {fromJS} from 'immutable'

import {EmailIntegrationCreateCustom} from '../EmailIntegrationCreateCustom'

const commonProps = {
    integration: fromJS({
        id: 1,
        name: 'my integration',
        meta: {
            address: 'myintegration@gorgias.io',
        },
    }),
    loading: fromJS({updateIntegration: false}),
}

describe('<EmailIntegrationCreateCustom/>', () => {
    describe('render()', () => {
        it('should render', () => {
            const component = render(
                <EmailIntegrationCreateCustom {...commonProps} />
            )

            expect(component).toMatchSnapshot()
        })
        it('should render update', () => {
            commonProps.loading = fromJS({updateIntegration: true})
            const component = render(
                <EmailIntegrationCreateCustom {...commonProps} />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
