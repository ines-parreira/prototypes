import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import ArrayExpression from '../ArrayExpression'

describe('ast', () => {
    describe('expressions', () => {
        describe('ArrayExpression', () => {
            it('should render component', () => {
                const parent = fromJS(['body', 0, 'test', 'arguments', 1])
                const elements = [{
                    value: 'hello',
                }, {
                    value: 'world!'
                }]
                expect(
                    shallow(
                        <ArrayExpression
                            actions={{}}
                            elements={elements}
                            leftsiblings={{}}
                            parent={parent}
                            rule={{}}
                            schemas={{}}
                        />
                    )
                ).toMatchSnapshot()
            })
        })
    })
})
