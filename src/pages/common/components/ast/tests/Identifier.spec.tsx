import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import Identifier from '../Identifier'
import {RuleItemActions} from '../../../../settings/rules/types'

describe('Identifier component', () => {
    it('should render', () => {
        const component = shallow(
            <Identifier
                className="foo"
                name="eq"
                parent={fromJS(['body', 0, 'expression'])}
                rule={fromJS({foo: 'rule'})}
                actions={{} as RuleItemActions}
                leftsiblings={fromJS([{foo: 'leftsiblings'}])}
                schemas={fromJS({})}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
