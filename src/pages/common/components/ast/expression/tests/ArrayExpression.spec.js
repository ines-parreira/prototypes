import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import ArrayExpression from '../ArrayExpression.tsx'

describe('ast', () => {
    describe('expressions', () => {
        describe('ArrayExpression', () => {
            it('should render component and not display any error', () => {
                const parent = fromJS(['body', 0, 'test', 'arguments', 1])
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

            it('should display an error because the field is empty', () => {
                const parent = fromJS(['body', 0, 'test', 'arguments', 1])

                expect(
                    shallow(
                        <ArrayExpression
                            actions={{}}
                            elements={[]}
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
