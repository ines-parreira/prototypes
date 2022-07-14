import React from 'react'
import {render} from 'enzyme'

import {EmailIntegrationCreate} from '../EmailIntegrationCreate'

describe('<EmailIntegrationCreate/>', () => {
    describe('render()', () => {
        it('should render', () => {
            const component = render(
                <EmailIntegrationCreate
                    gmailRedirectUri={'testGmail'}
                    outlookRedirectUri={'testOutlook'}
                    dispatch={jest.fn()}
                />
            )
            expect(component).toMatchSnapshot()
        })
    })
})
