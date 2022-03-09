import React from 'react'
import {shallow} from 'enzyme'

import {CardHeaderValue} from '../CardHeaderValue'

describe('<CardHeaderValue/>', () => {
    describe('render()', () => {
        it('should render with label', () => {
            const component = shallow(
                <CardHeaderValue label="Label">foo</CardHeaderValue>
            )

            expect(component).toMatchSnapshot()
        })

        it('should render without label', () => {
            const component = shallow(<CardHeaderValue>foo</CardHeaderValue>)

            expect(component).toMatchSnapshot()
        })
    })
})
