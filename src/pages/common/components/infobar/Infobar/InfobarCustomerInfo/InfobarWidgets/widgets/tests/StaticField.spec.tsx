import React from 'react'
import {shallow} from 'enzyme'

import {StaticField} from '../StaticField'

describe('<StaticField/>', () => {
    describe('render()', () => {
        it('should render with label', () => {
            const component = shallow(
                <StaticField label="Label">foo</StaticField>
            )

            expect(component).toMatchSnapshot()
        })

        it('should render without label', () => {
            const component = shallow(<StaticField>foo</StaticField>)

            expect(component).toMatchSnapshot()
        })
    })
})
