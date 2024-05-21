import React from 'react'
import {fromJS} from 'immutable'

import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {RuleItemActions} from 'pages/settings/rules/types'
import Literal from 'pages/common/components/ast/Literal'
import {RootState, StoreDispatch} from 'state/types'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const value = 'hey'
const commonProps = {
    rule: fromJS({foo: 'rule'}),
    actions: {} as RuleItemActions,
    leftsiblings: fromJS([{foo: 'leftsiblings'}]),
    parent: fromJS(['body', 0, 'test']),
    schemas: fromJS({foo: 'schemas'}),
}

describe('Literal component', () => {
    it('should return null because the operator is an empty operator', () => {
        const callee = {name: 'isEmpty'}

        const {container} = render(
            <Provider store={mockStore({})}>
                <Literal {...commonProps} callee={callee} value={value} />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display an error because the value is empty', () => {
        const callee = {name: 'eq'}

        const {container} = render(
            <Provider store={mockStore({})}>
                <Literal {...commonProps} callee={callee} value="" />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not display an error because the value is not empty', () => {
        const callee = {name: 'eq'}

        const {container} = render(
            <Provider store={mockStore({})}>
                <Literal {...commonProps} callee={callee} value={value} />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
