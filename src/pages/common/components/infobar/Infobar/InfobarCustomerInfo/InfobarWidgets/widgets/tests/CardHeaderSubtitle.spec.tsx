import React from 'react'
import {shallow} from 'enzyme'

import {CardHeaderSubtitle} from '../CardHeaderSubtitle'

describe('<CardHeaderSubtitle/>', () => {
    describe('render()', () => {
        it('should render children', () => {
            const component = shallow(
                <CardHeaderSubtitle>
                    <p>foo</p>
                </CardHeaderSubtitle>
            )

            expect(component).toMatchSnapshot()
        })
    })
})
