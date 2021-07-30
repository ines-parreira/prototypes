import React from 'react'
import {shallow} from 'enzyme'

import {CardHeaderStatusLabel} from '../CardHeaderStatusLabel.tsx'

describe('<CardHeaderStatusLabel/>', () => {
    describe('render()', () => {
        it('should render children', () => {
            const component = shallow(
                <CardHeaderStatusLabel>123</CardHeaderStatusLabel>
            )

            expect(component).toMatchSnapshot()
        })
    })
})
