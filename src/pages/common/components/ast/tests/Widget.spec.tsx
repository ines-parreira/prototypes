import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {Widget} from '../Widget'
import _schemas from '../../../../../fixtures/openapi.json'
import {RuleItemActions} from '../../../../settings/rules/RulesSettingsForm'

import _astCodeEq from './fixtures/astCodeEq.json'
import _astCodeContains from './fixtures/astCodeContains.json'
import _astCodeGteTimedelta from './fixtures/astCodeGteTimedelta.json'
import _astCodeReplyToTicket from './fixtures/astCodeReplyToTicket.json'

const astCodeEq = fromJS(_astCodeEq)
const astCodeContains = fromJS(_astCodeContains)
const astCodeGteTimedelta = fromJS(_astCodeGteTimedelta)
const astCodeReplyToTicket = fromJS(_astCodeReplyToTicket)

describe('ast', () => {
    describe('Widget', () => {
        const commonProps = {
            actions: {} as RuleItemActions,
            leftsiblings: fromJS([
                'definitions',
                'Ticket',
                'properties',
                'subject',
            ]),
            parent: fromJS(['body', 0, 'test', 'arguments', 1, 'elements']),
            schemas: fromJS(_schemas),
        } as ComponentProps<typeof Widget>

        it('should render case-insensitive MultiSelectField (containsAll operator)', () => {
            const value = ['hello', 'world!']
            const rule = fromJS({
                code_ast: astCodeContains,
            })

            expect(
                shallow(<Widget {...commonProps} value={value} rule={rule} />)
            ).toMatchSnapshot()
        })

        it('should render InputField (eq operator)', () => {
            const value = 'hello world!'
            const rule = fromJS({
                code_ast: astCodeEq,
            })
            expect(
                shallow(<Widget {...commonProps} value={value} rule={rule} />)
            ).toMatchSnapshot()
        })

        it('should render DatetimeSelect field', () => {
            const leftsiblings = fromJS([
                'definitions',
                'Ticket',
                'properties',
                'created_datetime',
            ])
            const value = '2018-03-28T21:59:32.580209'
            const rule = fromJS({
                code_ast: astCodeEq,
            })
            expect(
                shallow(
                    <Widget
                        {...commonProps}
                        value={value}
                        leftsiblings={leftsiblings}
                        rule={rule}
                    />
                )
            ).toMatchSnapshot()
        })

        it('should render TimedeltaSelect field', () => {
            const leftsiblings = fromJS([
                'definitions',
                'Ticket',
                'properties',
                'created_datetime',
            ])
            const value = '1d'
            const rule = fromJS({
                code_ast: astCodeGteTimedelta,
            })
            expect(
                shallow(
                    <Widget
                        {...commonProps}
                        value={value}
                        leftsiblings={leftsiblings}
                        rule={rule}
                    />
                )
            ).toMatchSnapshot()
        })

        it('should render RichFieldWithVariables', () => {
            const leftsiblings = fromJS([
                'actions',
                'replyToTicket',
                'body_html',
            ])
            const value = 'hello my good lad'
            const rule = fromJS({code_ast: astCodeReplyToTicket})
            const parent = fromJS([
                'body',
                0,
                'expression',
                'arguments',
                1,
                'properties',
                1,
                'value',
                'value',
            ])

            expect(
                shallow(
                    <Widget
                        {...commonProps}
                        value={value}
                        leftsiblings={leftsiblings}
                        parent={parent}
                        rule={rule}
                        config={{
                            widget: 'rich-field',
                            textField: 'body_text',
                        }}
                        properties={[
                            {
                                key: {name: 'body_text'},
                                value: {value: 'foo bar'},
                            },
                        ]}
                        hasIntegrationOfTypes={() => true}
                    />
                )
            ).toMatchSnapshot()
        })

        describe('TagsSelect', () => {
            it('should render case sensitive TagsSelect field (tags properties)', () => {
                const leftsiblings = fromJS([
                    'definitions',
                    'Ticket',
                    'properties',
                    'tags',
                    'name',
                ])
                const value = 'tag'
                const rule = fromJS({
                    code_ast: astCodeContains,
                })
                expect(
                    shallow(
                        <Widget
                            {...commonProps}
                            value={value}
                            leftsiblings={leftsiblings}
                            rule={rule}
                        />
                    )
                ).toMatchSnapshot()
            })

            it('should render multi TagsSelect field (addTags action)', () => {
                const leftsiblings = fromJS(['actions', 'addTags', 'tags'])
                const value = 'hello, world, !'
                const rule = fromJS({
                    code_ast: astCodeEq,
                })
                expect(
                    shallow(
                        <Widget
                            {...commonProps}
                            value={value}
                            leftsiblings={leftsiblings}
                            rule={rule}
                        />
                    )
                ).toMatchSnapshot()
            })

            it('should render component AssigneeUserSelect', () => {
                const leftsiblings = fromJS(['actions', 'assignee_user'])
                const rule = fromJS({
                    code_ast: astCodeEq,
                })
                expect(
                    shallow(
                        <Widget
                            {...commonProps}
                            leftsiblings={leftsiblings}
                            rule={rule}
                        />
                    )
                ).toMatchSnapshot()
            })

            it('should render component AssigneeTeamSelect', () => {
                const leftsiblings = fromJS(['actions', 'assignee_team'])
                const rule = fromJS({
                    code_ast: astCodeEq,
                })
                expect(
                    shallow(
                        <Widget
                            {...commonProps}
                            leftsiblings={leftsiblings}
                            rule={rule}
                        />
                    )
                ).toMatchSnapshot()
            })
        })

        describe('should handle change', () => {
            let modifyCodeASTSpy: jest.MockedFunction<any>
            let getCondition: jest.MockedFunction<any>
            let actions: RuleItemActions

            beforeEach(() => {
                modifyCodeASTSpy = jest.fn()
                getCondition = jest.fn()
                actions = {
                    modifyCodeAST: modifyCodeASTSpy,
                    getCondition,
                }
            })

            it('AST ExpressionArray value', () => {
                const value = ['hello', 'world!']
                const rule = fromJS({
                    code_ast: astCodeContains,
                })
                const component = shallow<Widget>(
                    <Widget
                        {...commonProps}
                        actions={actions}
                        value={value}
                        rule={rule}
                    />
                )
                const newValue = ['hello', 'you!']
                component.instance()._handleChange(newValue)
                expect(modifyCodeASTSpy).toBeCalledWith(
                    commonProps.parent,
                    newValue.map((val) => ({
                        type: 'Literal',
                        raw: `'${val}'`,
                        value: val,
                    })),
                    'UPDATE'
                )
            })

            it('AST Literal value', () => {
                const value = 'hello world!'
                const rule = fromJS({
                    code_ast: astCodeEq,
                })
                const component = shallow<Widget>(
                    <Widget
                        {...commonProps}
                        actions={actions}
                        value={value}
                        rule={rule}
                    />
                )
                const newValue = 'hello you!'
                component.instance()._handleChange(newValue)
                expect(modifyCodeASTSpy).toBeCalledWith(
                    commonProps.parent,
                    newValue,
                    'UPDATE'
                )
            })
        })
    })
})
