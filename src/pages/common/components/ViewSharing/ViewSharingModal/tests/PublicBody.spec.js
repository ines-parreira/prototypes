import React from 'react'
import {shallow} from 'enzyme'

import PublicBody from '../PublicBody'

describe('<PublicBody/>', () => {
    describe('render()', () => {
        it('should render', () => {
            const component = shallow(<PublicBody />)
            expect(component).toMatchSnapshot()
        })
    })
})
