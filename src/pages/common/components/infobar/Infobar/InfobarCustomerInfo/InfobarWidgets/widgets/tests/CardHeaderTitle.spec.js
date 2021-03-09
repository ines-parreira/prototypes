import React from 'react'
import {shallow} from 'enzyme'

import {CardHeaderTitle} from '../CardHeaderTitle.tsx'

describe('<CardHeaderTitle/>', () => {
    describe('render()', () => {
        it('should render children', () => {
            const component = shallow(
                <CardHeaderTitle>
                    <p>foo</p>
                </CardHeaderTitle>
            )

            expect(component).toMatchSnapshot()
        })
    })
})
