import React from 'react'
import {fromJS, List, Map} from 'immutable'
import {fireEvent, render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import _schemas from 'fixtures/openapi.json'

import {humanizeChannel} from 'state/ticket/utils'
import Widget from '../Widget'
import _astCodeEq from './fixtures/astCodeEq.json'
import _astCodeContains from './fixtures/astCodeContains.json'
import _astCodeGteTimedelta from './fixtures/astCodeGteTimedelta.json'
import _astCodeReplyToTicket from './fixtures/astCodeReplyToTicket.json'

const astCodeEq = fromJS(_astCodeEq)
const astCodeContains = fromJS(_astCodeContains)
const astCodeGteTimedelta = fromJS(_astCodeGteTimedelta)
const astCodeReplyToTicket = fromJS(_astCodeReplyToTicket)

const mockStore = configureMockStore([thunk])
const defaultState = {
    entities: {tags: []},
    integrations: fromJS({
        integrations: [],
    }),
}

describe('<Widget />', () => {
    const commonProps = {
        actions: {
            modifyCodeAST: jest.fn(),
            getCondition: jest.fn(),
        },
        leftsiblings: fromJS([
            'definitions',
            'Ticket',
            'properties',
            'subject',
        ]),
        parent: fromJS(['body', 0, 'test', 'arguments', 1, 'elements']),
        schemas: fromJS(_schemas) as Map<any, any>,
        datetimeFormat: 'MM/DD/YYYY h:mm A',
        value: '',
    }

    it('should render case-insensitive MultiSelectField (containsAll operator)', () => {
        const value = ['hello', 'world!']
        const rule = fromJS({
            code_ast: astCodeContains,
        })

        render(
            <Provider store={mockStore(defaultState)}>
                <Widget {...commonProps} value={value} rule={rule} />
            </Provider>
        )
        expect(screen.getByText('hello')).toBeInTheDocument()
        expect(screen.getByText('world!')).toBeInTheDocument()
    })

    it('should render InputField (eq operator)', () => {
        const value = 'hello world!'
        const rule = fromJS({
            code_ast: astCodeEq,
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <Widget {...commonProps} value={value} rule={rule} />
            </Provider>
        )
        expect(screen.getByDisplayValue(value)).toBeInTheDocument()
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
        render(
            <Provider store={mockStore(defaultState)}>
                <Widget
                    {...commonProps}
                    value={value}
                    leftsiblings={leftsiblings}
                    rule={rule}
                />
            </Provider>
        )
        expect(
            screen.getByPlaceholderText('Choose a date...')
        ).toBeInTheDocument()
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
        render(
            <Provider store={mockStore(defaultState)}>
                <Widget
                    {...commonProps}
                    value={value}
                    leftsiblings={leftsiblings}
                    rule={rule}
                />
            </Provider>
        )

        expect(screen.getAllByText(/day\(s\) ago/)).toHaveLength(2)
        expect(screen.getByText('hour(s) ago')).toBeInTheDocument()
    })

    it('should render RichFieldWithVariables', () => {
        const leftsiblings = fromJS(['actions', 'replyToTicket', 'body_html'])
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

        render(
            <Provider store={mockStore(defaultState)}>
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
                />
            </Provider>
        )

        expect(screen.getByText(value)).toBeInTheDocument()
        expect(screen.getByText('Ticket customer')).toBeInTheDocument()
        expect(screen.getAllByText('First name')).toHaveLength(2)
        expect(screen.getByText('Current agent')).toBeInTheDocument()
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
            const value = 'I am a tag'
            const rule = fromJS({
                code_ast: astCodeContains,
            })
            render(
                <Provider store={mockStore(defaultState)}>
                    <Widget
                        {...commonProps}
                        value={value}
                        leftsiblings={leftsiblings}
                        rule={rule}
                    />
                </Provider>
            )
            expect(screen.getByText(value)).toBeInTheDocument()
            expect(
                screen.getByPlaceholderText('Add tags...')
            ).toBeInTheDocument()
        })

        it('should render multi TagsSelect field (addTags action)', () => {
            const leftsiblings = fromJS(['actions', 'addTags', 'tags'])
            const value = 'hello, world, !'
            const rule = fromJS({
                code_ast: astCodeEq,
            })
            render(
                <Provider store={mockStore(defaultState)}>
                    <Widget
                        {...commonProps}
                        value={value}
                        leftsiblings={leftsiblings}
                        rule={rule}
                    />
                </Provider>
            )

            expect(screen.getByText('hello')).toBeInTheDocument()
            expect(screen.getByText('world')).toBeInTheDocument()
            expect(screen.getByText('!')).toBeInTheDocument()
            expect(
                screen.getByPlaceholderText('Add tags...')
            ).toBeInTheDocument()
        })

        it('should render component AssigneeUserSelect', () => {
            const leftsiblings = fromJS(['actions', 'assignee_user'])
            const rule = fromJS({
                code_ast: astCodeEq,
            })
            render(
                <Provider store={mockStore(defaultState)}>
                    <Widget
                        {...commonProps}
                        leftsiblings={leftsiblings}
                        rule={rule}
                    />
                </Provider>
            )

            expect(screen.getByText(/Loading agents/)).toBeInTheDocument()
        })

        it('should render component AssigneeTeamSelect', () => {
            const leftsiblings = fromJS(['actions', 'assignee_team'])
            const rule = fromJS({
                code_ast: astCodeEq,
            })
            render(
                <Provider store={mockStore(defaultState)}>
                    <Widget
                        {...commonProps}
                        leftsiblings={leftsiblings}
                        rule={rule}
                    />
                </Provider>
            )

            expect(screen.getByText('Select an option')).toBeInTheDocument()
        })
    })

    describe('SelfServiceFlowSelect', () => {
        it('should render SelfServiceFlowSelect field', () => {
            const leftsiblings = fromJS([
                'definitions',
                'TicketMessage',
                'properties',
                'self_service_flow',
            ])
            const value = 'flow'
            const rule = fromJS({
                code_ast: astCodeEq,
            })
            render(
                <Provider store={mockStore(defaultState)}>
                    <Widget
                        {...commonProps}
                        value={value}
                        leftsiblings={leftsiblings}
                        rule={rule}
                    />
                </Provider>
            )

            expect(screen.getByRole('textbox')).toHaveValue(value)
        })
    })

    describe('CSAT select', () => {
        it('should render CSAT select field', () => {
            const leftsiblings = fromJS([
                'definitions',
                'SatisfactionSurvey',
                'properties',
                'score',
            ])
            const rule = fromJS({code_ast: astCodeEq})
            const value = 3

            render(
                <Provider store={mockStore(defaultState)}>
                    <Widget
                        {...commonProps}
                        value={value}
                        leftsiblings={leftsiblings}
                        rule={rule}
                    />
                </Provider>
            )

            expect(
                screen.getByText('★★★', {selector: '.label'})
            ).toBeInTheDocument()

            fireEvent.click(screen.getByText('★★★★★'))

            expect(commonProps.actions.modifyCodeAST).toBeCalledWith(
                commonProps.parent,
                5,
                'UPDATE'
            )
        })
    })

    describe('should handle change', () => {
        it('AST ExpressionArray value', () => {
            const value = ['hello', 'world!']
            const rule = fromJS({
                code_ast: astCodeContains,
            })
            render(
                <Provider store={mockStore(defaultState)}>
                    <Widget {...commonProps} value={value} rule={rule} />
                </Provider>
            )

            fireEvent.click(screen.getAllByText('close')[0])
            expect(commonProps.actions.modifyCodeAST).toBeCalledWith(
                commonProps.parent,
                [{type: 'Literal', raw: `'${value[1]}'`, value: value[1]}],
                'UPDATE'
            )
        })

        it('AST Literal value', () => {
            const value = 'hello world!'
            const rule = fromJS({
                code_ast: astCodeEq,
            })
            render(
                <Provider store={mockStore(defaultState)}>
                    <Widget {...commonProps} value={value} rule={rule} />
                </Provider>
            )
            const newValue = 'hello you!'
            fireEvent.change(screen.getByDisplayValue(value), {
                target: {value: newValue},
            })

            expect(commonProps.actions.modifyCodeAST).toBeCalledWith(
                commonProps.parent,
                newValue,
                'UPDATE'
            )
        })
    })

    it('should render humanized labels for ticket channel selection', () => {
        const path = ['definitions', 'Ticket', 'properties', 'channel']
        const leftsiblings = fromJS(path)
        const value = 'contact_form'
        const rule = fromJS({
            code_ast: astCodeEq,
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <Widget
                    {...commonProps}
                    value={value}
                    leftsiblings={leftsiblings}
                    rule={rule}
                />
            </Provider>
        )

        const channels = commonProps.schemas.getIn([
            ...path,
            'meta',
            'enum',
        ]) as List<any>
        expect(screen.getByText('Select an option')).toBeInTheDocument()

        channels.forEach((channel) => {
            expect(
                screen.getByText(humanizeChannel(channel))
            ).toBeInTheDocument()
        })
    })
})
