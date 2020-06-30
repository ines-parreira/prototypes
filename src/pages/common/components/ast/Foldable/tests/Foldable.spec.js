import React from 'react'
import {shallow} from 'enzyme'

import Foldable from '../Foldable'

describe('Foldable component', () => {
    it('should render open', () => {
        const component = shallow(
            <Foldable label={<div>my label</div>}>
                <div>my children</div>
            </Foldable>
        )

        expect(component).toMatchSnapshot()
    })

    it('should render closed', () => {
        const component = shallow(
            <Foldable label={<div>my label</div>}>
                <div>my children</div>
            </Foldable>
        )

        component.setState({isOpen: false})

        expect(component).toMatchSnapshot()
    })
})
