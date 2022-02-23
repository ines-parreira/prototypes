import React from 'react'
import {shallow} from 'enzyme'

import {CardHeaderDetails} from '../CardHeaderDetails'

describe('<CardHeaderDetails/>', () => {
    describe('render()', () => {
        it('should render children', () => {
            const component = shallow(
                <CardHeaderDetails>
                    <p>foo</p>
                    <p>bar</p>
                </CardHeaderDetails>
            )

            expect(component).toMatchSnapshot()
        })
    })
})
