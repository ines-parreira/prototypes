import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import ArrayExpression from '../ArrayExpression'
import {RuleItemActions} from '../../../../../settings/rules/RulesSettingsForm'

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
                expect(
                    shallow(
                        <ArrayExpression {...minProps} elements={elements} />
                    )
                ).toMatchSnapshot()
            })

            it('should display an error because the field is empty', () => {
                expect(
                    shallow(<ArrayExpression {...minProps} />)
                ).toMatchSnapshot()
            })
        })
    })
})
