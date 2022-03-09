import React from 'react'
import {shallow} from 'enzyme'

import {CardHeaderIcon} from '../CardHeaderIcon'

describe('<CardHeaderIcon/>', () => {
    describe('render()', () => {
        it('should render icon', () => {
            const component = shallow(
                <CardHeaderIcon alt="Foo" src="foo.png" />
            )

            expect(component).toMatchSnapshot()
        })
        it('should render icon with color as background-image', () => {
            const component = shallow(
                <CardHeaderIcon alt="Foo" src="foo.png" color="#123" />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
