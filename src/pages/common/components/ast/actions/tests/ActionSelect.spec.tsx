import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import ActionSelect from '../ActionSelect'

const commonProps = {
    actions: {
        modifyCodeAST: jest.fn(),
        getCondition: jest.fn(),
    },
    parent: fromJS(['body', 0, 'expression']),
    value: 'addTags',
}

const nonSystemRule = fromJS({type: 'user'})
const systemRule = fromJS({type: 'system'})

describe('ActionSelect component', () => {
    it('should render all non-system actions for non-system rules', () => {
        const component = shallow(
            <ActionSelect {...commonProps} rule={nonSystemRule} />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render all actions for system rules', () => {
        const component = shallow(
            <ActionSelect {...commonProps} rule={systemRule} />
        )

        expect(component).toMatchSnapshot()
    })

    it('should call actions.modifyCodeAST on click', () => {
        const wrapper = shallow<ActionSelect>(
            <ActionSelect {...commonProps} rule={nonSystemRule} />
        )

        const component = wrapper.instance()
        const newValue = 'newValue'

        component._handleClick(newValue)

        expect(commonProps.actions.modifyCodeAST).toHaveBeenCalledWith(
            commonProps.parent,
            newValue,
            'UPDATE'
        )
    })
})
