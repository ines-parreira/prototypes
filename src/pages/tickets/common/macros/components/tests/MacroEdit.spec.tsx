import React, {ComponentProps} from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'
import _noop from 'lodash/noop'

import {MacroEdit} from '../MacroEdit'

describe('MacroEdit component', () => {
    const defaultProps = ({
        actions: fromJS([]),
        agents: fromJS({}),
        currentMacro: fromJS({id: 1}),
        hasIntegrationOfTypes: _noop,
        name: 'Pizza Pepperoni',
        setActions: _noop,
        setName: _noop,
    } as any) as ComponentProps<typeof MacroEdit>

    it('should render the macro edit form', () => {
        const component = mount(<MacroEdit {...defaultProps} />)
        expect(component).toMatchSnapshot()
    })

    it('should change name input value', () => {
        const component = mount(
            <MacroEdit {...defaultProps} name="Pizza Capricciosa" />
        )

        expect(component.find('input#id-name').props().value).toBe(
            'Pizza Capricciosa'
        )
    })
})
