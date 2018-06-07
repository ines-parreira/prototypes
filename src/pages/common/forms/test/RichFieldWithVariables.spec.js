import React from 'react'
import _noop from 'lodash/noop'
import RichFieldWithVariables from '../RichFieldWithVariables'
import {shallow} from 'enzyme'

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
