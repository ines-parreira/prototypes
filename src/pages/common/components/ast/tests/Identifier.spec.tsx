import React from 'react'
import {fromJS} from 'immutable'

import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {RuleItemActions} from 'pages/settings/rules/types'
import Identifier from 'pages/common/components/ast/Identifier'
import {RootState, StoreDispatch} from 'state/types'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('Identifier component', () => {
    it('should render', () => {
        const {container} = render(
            <Provider store={mockStore({})}>
                <Identifier
                    className="foo"
                    name="eq"
                    parent={fromJS(['body', 0, 'expression'])}
                    rule={fromJS({foo: 'rule'})}
                    actions={{} as RuleItemActions}
                    leftsiblings={fromJS([{foo: 'leftsiblings'}])}
                    schemas={fromJS({})}
                />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
