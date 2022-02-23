import React from 'react'
import {shallow} from 'enzyme'

import {CardHeaderStarPoints} from '../CardHeaderStarPoints'

describe('<CardHeaderStarPoints/>', () => {
    describe('render()', () => {
        it('should render children', () => {
            const component = shallow(<CardHeaderStarPoints value="555" />)

            expect(component).toMatchSnapshot()
        })
    })
})
