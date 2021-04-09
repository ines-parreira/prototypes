import React from 'react'
import {shallow} from 'enzyme'

import {CardHeaderYotpoLoyaltyPoints} from '../CardHeaderYotpoLoyaltyPoints'

describe('<CardHeaderYotpoLoyaltyPoints/>', () => {
    describe('render()', () => {
        it('should render children', () => {
            const component = shallow(
                <CardHeaderYotpoLoyaltyPoints>
                    12345
                </CardHeaderYotpoLoyaltyPoints>
            )

            expect(component).toMatchSnapshot()
        })
    })
})
