import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {Widget} from '../Widget'
import _schemas from '../../../../../fixtures/openapi'

import _astCodeEq from './fixtures/astCodeEq'
import _astCodeContains from './fixtures/astCodeContains'
import _astCodeGteTimedelta from './fixtures/astCodeGteTimedelta'
import _astCodeReplyToTicket from './fixtures/astCodeReplyToTicket'

const schemas = fromJS(_schemas)
const astCodeEq = fromJS(_astCodeEq)
const astCodeContains = fromJS(_astCodeContains)
const astCodeGteTimedelta = fromJS(_astCodeGteTimedelta)
const astCodeReplyToTicket = fromJS(_astCodeReplyToTicket)

describe('ast', () => {
    describe('Widget', () => {
        const parent = fromJS(['body', 0, 'test', 'arguments', 1, 'elements'])
        let leftsiblings = fromJS(['definitions', 'Ticket', 'properties', 'subject'])

        it('should render case-insensitive MultiSelectField (containsAll operator)', () => {
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

        it('should render InputField (eq operator)', () => {
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

        it('should render DatetimeSelect field', () => {
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

        it('should render TimedeltaSelect field', () => {
            let leftsiblings = fromJS(['definitions', 'Ticket', 'properties', 'created_datetime'])
            const value = '1d'
            const rule = fromJS({
                code_ast: astCodeGteTimedelta
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

        it('should render RichFieldWithVariables', () => {
            let leftsiblings = fromJS(['actions', 'replyToTicket', 'body_html'])
            const value = 'hello my good lad'
            const rule = fromJS({code_ast: astCodeReplyToTicket})
            const parent = fromJS(['body', 0, 'expression', 'arguments', 1, 'properties', 1, 'value', 'value'])

            expect(
                shallow(
                    <Widget
                        actions={{}}
                        value={value}
                        leftsiblings={leftsiblings}
                        parent={parent}
                        rule={rule}
                        schemas={schemas}
                        config={{
                            widget: 'rich-field',
                            textField: 'body_text'
                        }}
                        properties={[{
                            key: {name: 'body_text'},
                            value: {value: 'foo bar'}
                        }]}
                        hasIntegrationOfTypes={() => true}
                    />
                )
            ).toMatchSnapshot()
        })

        describe('TagsSelect', () => {
            it('should render case sensitive TagsSelect field (tags properties)', () => {
                let leftsiblings = fromJS(['definitions', 'Ticket', 'properties', 'tags', 'name'])
                const value = 'tag'
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
                const newValue = ['hello', 'you!']
                component.instance()._handleChange(newValue)
                expect(modifyCodeASTSpy).toBeCalledWith(parent, newValue.map(val => ({
                    type: 'Literal',
                    raw: `'${val}'`,
                    value: val
                })), 'UPDATE')
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
                const newValue = 'hello you!'
                component.instance()._handleChange(newValue)
                expect(modifyCodeASTSpy).toBeCalledWith(parent, newValue, 'UPDATE')
            })
        })
    })
})
