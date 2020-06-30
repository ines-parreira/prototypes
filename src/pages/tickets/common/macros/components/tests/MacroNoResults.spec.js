import React from 'react'
import {shallow} from 'enzyme'
import _noop from 'lodash/noop'

import MacroNoResults from '../MacroNoResults'

describe('MacroNoResults component', () => {
    it('should display no macros available without search query', () => {
        const component = shallow(
            <MacroNoResults searchQuery="" newAction={_noop} />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display no macros found with search query', () => {
        const component = shallow(
            <MacroNoResults searchQuery="Pizza Pepperoni" newAction={_noop} />
        )

        expect(component).toMatchSnapshot()
    })
})
