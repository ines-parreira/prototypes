import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import Identifier from '../Identifier'

describe('Identifier component', () => {
    it('should render', () => {
        const component = shallow(
            <Identifier
                className="foo"
                name="eq"
                parent={fromJS(['body', 0, 'expression'])}
                rule={fromJS({foo: 'rule'})}
                actions={{foo: 'actions'}}
                leftsiblings={{foo: 'leftsiblings'}}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
