import React from 'react'
import {shallow} from 'enzyme'
import Widget from '../Widget'
import {fromJS} from 'immutable'
import _schemas from '../../../../../fixtures/openapi'
import _astCodeEq from './fixtures/astCodeEq'
import _astCodeContains from './fixtures/astCodeContains'

const schemas = fromJS(_schemas)
const astCodeEq = fromJS(_astCodeEq)
const astCodeContains = fromJS(_astCodeContains)

describe('ast', () => {
    describe('Widget', () => {
        const parent = fromJS(['body', 0, 'test', 'arguments', 1, 'elements'])
        let leftsiblings = fromJS(['definitions', 'Ticket', 'properties', 'subject'])

        describe('should render', () => {
            it('MultiSelectField (containsAll operator)', () => {
                const value = ['hello', 'world!',]
                const rule = fromJS({
                    code_ast: astCodeContains
                })

                expect(
                    shallow(
                        <Widget
                            actions={{}}
                            value={value}
                            leftsiblings={leftsiblings}
                            parent={parent}
                            rule={rule}
                            schemas={schemas}
                        />
                    )
                ).toMatchSnapshot()
            })

            it('InputField (eq operator)', () => {
                const value = 'hello world!'
                const rule = fromJS({
                    code_ast: astCodeEq
                })
                expect(
                    shallow(
                        <Widget
                            actions={{}}
                            value={value}
                            leftsiblings={leftsiblings}
                            parent={parent}
                            rule={rule}
                            schemas={schemas}
                        />
                    )
                ).toMatchSnapshot()
            })

            it('DatetimeSelect field', () => {
                let leftsiblings = fromJS(['definitions', 'Ticket', 'properties', 'created_datetime'])
                const value = '2018-03-28T21:59:32.580209'
                const rule = fromJS({
                    code_ast: astCodeEq
                })
                expect(
                    shallow(
                        <Widget
                            actions={{}}
                            value={value}
                            leftsiblings={leftsiblings}
                            parent={parent}
                            rule={rule}
                            schemas={schemas}
                        />
                    )
                ).toMatchSnapshot()
            })

            describe('TagsSelect', () => {
                it('should render TagsSelect field (tags properties)', () => {
                    let leftsiblings = fromJS(['definitions', 'Ticket', 'properties', 'tags', 'name'])
                    const value = 'tag'
                    const rule = fromJS({
                        code_ast: astCodeEq
                    })
                    expect(
                        shallow(
                            <Widget
                                actions={{}}
                                value={value}
                                leftsiblings={leftsiblings}
                                parent={parent}
                                rule={rule}
                                schemas={schemas}
                            />
                        )
                    ).toMatchSnapshot()
                })

                it('should render multi TagsSelect field (addTags action)', () => {
                    let leftsiblings = fromJS(['actions', 'addTags', 'tags'])
                    const value = 'hello, world, !'
                    const rule = fromJS({
                        code_ast: astCodeEq
                    })
                    expect(
                        shallow(
                            <Widget
                                actions={{}}
                                value={value}
                                leftsiblings={leftsiblings}
                                parent={parent}
                                rule={rule}
                                schemas={schemas}
                            />
                        )
                    ).toMatchSnapshot()
                })

            })


        })

        describe('should handle change', () => {
            let modifyCodeASTSpy = null
            let actions = null

            beforeEach(() => {
                modifyCodeASTSpy = jest.fn()
                actions = {
                    modifyCodeAST: modifyCodeASTSpy
                }
            })

            it('AST ExpressionArray value', () => {
                const value = ['hello', 'world!',]
                const rule = fromJS({
                    code_ast: astCodeContains
                })
                const component = shallow(
                    <Widget
                        actions={actions}
                        value={value}
                        leftsiblings={leftsiblings}
                        parent={parent}
                        rule={rule}
                        schemas={schemas}
                    />
                )
                component.instance()._handleChange(['hello', 'you!'])
                expect(modifyCodeASTSpy.mock).toMatchSnapshot()
            })

            it('AST Literal value', () => {
                const value = 'hello world!'
                const rule = fromJS({
                    code_ast: astCodeEq
                })
                const modifyCodeASTSpy = jest.fn()
                const actions = {
                    modifyCodeAST: modifyCodeASTSpy
                }
                const component = shallow(
                    <Widget
                        actions={actions}
                        value={value}
                        leftsiblings={leftsiblings}
                        parent={parent}
                        rule={rule}
                        schemas={schemas}
                    />
                )
                component.instance()._handleChange('hello you!')
                expect(modifyCodeASTSpy.mock).toMatchSnapshot()
            })
        })
    })
})
