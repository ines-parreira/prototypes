import React from 'react'
import _noop from 'lodash/noop'
import {shallow} from 'enzyme'

import RichFieldWithVariables from '../RichFieldWithVariables'

describe('RichFieldWithVariables', () => {
    it('should render an input with variable dropdowns', () => {
        const component = shallow(
            <RichFieldWithVariables
                value={{text: 'text', html: 'html'}}
                onChange={_noop}
                variableTypes={['ticket.customer', 'current_user']}
            />
        )
        expect(component).toMatchSnapshot()
    })
})
