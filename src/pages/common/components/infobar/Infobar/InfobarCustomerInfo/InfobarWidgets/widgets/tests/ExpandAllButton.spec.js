import React from 'react'
import {shallow} from 'enzyme'

import ExpandAllButton from '../ExpandAllButton.tsx'

describe('<ExpandAllButton/>', () => {
    describe('render()', () => {
        it('should render', () => {
            const component = shallow(<ExpandAllButton />)

            expect(component).toMatchSnapshot()
        })
    })
})
