import React from 'react'
import {shallow} from 'enzyme'

import {CardHeaderYotpoLoyaltyPoints} from '../CardHeaderYotpoLoyaltyPoints.tsx'

describe('<CardHeaderYotpoLoyaltyPoints/>', () => {
    describe('render()', () => {
        it('should render children', () => {
            const component = shallow(
                <CardHeaderYotpoLoyaltyPoints value="12345" />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
