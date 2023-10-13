import React from 'react'
import {render} from '@testing-library/react'

import {EmailIntegrationCreate} from '../EmailIntegrationCreate'

describe('<EmailIntegrationCreate/>', () => {
    describe('render()', () => {
        it('should render', () => {
            const {container} = render(
                <EmailIntegrationCreate
                    gmailRedirectUri={'testGmail'}
                    outlookRedirectUri={'testOutlook'}
                    dispatch={jest.fn()}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
