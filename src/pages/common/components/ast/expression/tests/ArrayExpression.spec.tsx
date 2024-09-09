import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import ArrayExpression from 'pages/common/components/ast/expression/ArrayExpression'
import {RuleItemActions} from 'pages/settings/rules/types'

const mockStore = configureMockStore([thunk])

describe('ast', () => {
    describe('expressions', () => {
        describe('ArrayExpression', () => {
            const minProps = {
                actions: {} as RuleItemActions,
                elements: [],
                leftsiblings: fromJS([]),
                parent: fromJS(['body', 0, 'test', 'arguments', 1]),
                rule: fromJS({}),
                schemas: fromJS({}),
            }

            it('should render component and not display any error', () => {
                const elements = [
                    {
                        value: 'hello',
                    },
                    {
                        value: 'world!',
                    },
                ]

                const {container} = render(
                    <Provider store={mockStore({})}>
                        <ArrayExpression {...minProps} elements={elements} />
                    </Provider>
                )

                expect(container.firstChild).toMatchSnapshot()
            })

            it('should display an error because the field is empty', () => {
                const {container} = render(
                    <Provider store={mockStore({})}>
                        <ArrayExpression {...minProps} />
                    </Provider>
                )

                expect(container.firstChild).toMatchSnapshot()
            })
        })
    })
})
