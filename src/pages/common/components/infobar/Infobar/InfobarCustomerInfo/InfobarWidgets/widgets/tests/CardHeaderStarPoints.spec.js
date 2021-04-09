import React from 'react'
import {shallow} from 'enzyme'

import {CardHeaderStarPoints} from '../CardHeaderStarPoints'

describe('<CardHeaderStarPoints/>', () => {
    describe('render()', () => {
        it('should render children', () => {
            const component = shallow(
                <CardHeaderStarPoints>555</CardHeaderStarPoints>
            )

            expect(component).toMatchSnapshot()
        })
    })
})
