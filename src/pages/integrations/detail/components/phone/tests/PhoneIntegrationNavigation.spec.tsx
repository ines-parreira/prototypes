import React from 'react'
import {render} from '@testing-library/react'
import {fromJS, Map} from 'immutable'

import PhoneIntegrationNavigation from '../PhoneIntegrationNavigation'

describe('<PhoneIntegrationNavigation/>', () => {
    let integration: Map<string, any>

    beforeEach(() => {
        integration = fromJS({
            id: 1,
        })
    })

    describe('render()', () => {
        it('should render', () => {
            const {container} = render(
                <PhoneIntegrationNavigation integration={integration} />
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
