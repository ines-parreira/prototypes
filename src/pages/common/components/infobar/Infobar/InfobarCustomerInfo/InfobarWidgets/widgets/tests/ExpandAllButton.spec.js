import React from 'react'
import {shallow} from 'enzyme'

import ExpandAllButton from '../ExpandAllButton'

describe('<ExpandAllButton/>', () => {
    describe('render()', () => {
        it('should render', () => {
            const component = shallow(<ExpandAllButton />)

            expect(component).toMatchSnapshot()
        })
    })
})
