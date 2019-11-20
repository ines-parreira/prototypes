import React from 'react'
import {render} from 'enzyme'

import {EmailIntegrationCreate} from '../EmailIntegrationCreate'


describe('<EmailIntegrationCreate/>', () => {
    describe('render()', () => {
        it('should render', () => {
            const component = render(
                <EmailIntegrationCreate outlookRedirectUri={'test'}/>
            )
            expect(component).toMatchSnapshot()
        })
    })
})
