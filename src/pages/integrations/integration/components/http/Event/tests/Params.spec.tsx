import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import Params from '../Params'

describe('Params', () => {
    it('should not render the component because it has no params', () => {
        const component = shallow(<Params />)
        expect(component).toMatchSnapshot()
    })

    it('should render the given params', () => {
        const component = shallow(
            <Params
                params={fromJS({
                    params1: 'value1',
                    params2: 'value2',
                    params3: 'value3',
                })}
            />
        )
        expect(component).toMatchSnapshot()
    })
})
