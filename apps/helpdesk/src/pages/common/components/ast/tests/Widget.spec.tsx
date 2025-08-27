import { assumeMock } from '@repo/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS, List, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useFlag } from 'core/flags'
import _schemas from 'fixtures/openapi.json'
import { humanizeChannel } from 'state/ticket/utils'
import { getLanguageDisplayName } from 'utils'

import Widget from '../Widget'
import _astCodeContains from './fixtures/astCodeContains.json'
import _astCodeEq from './fixtures/astCodeEq.json'
import _astCodeGteTimedelta from './fixtures/astCodeGteTimedelta.json'
import _astCodeReplyToTicket from './fixtures/astCodeReplyToTicket.json'

const astCodeEq = fromJS(_astCodeEq)
const astCodeContains = fromJS(_astCodeContains)
const astCodeGteTimedelta = fromJS(_astCodeGteTimedelta)
const astCodeReplyToTicket = fromJS(_astCodeReplyToTicket)

const mockStore = configureMockStore([thunk])
const defaultState = {
    entities: { tags: [] },
    integrations: fromJS({
        integrations: [],
    }),
}

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

jest.mock('pages/common/components/ast/widget/CustomFieldSelect', () =>
    jest.fn(() => <div>CustomFieldSelect</div>),
)

jest.mock('pages/common/components/ast/widget/PrioritySelect', () =>
    jest.fn(() => <div>PrioritySelect</div>),
)

jest.mock('pages/common/components/ast/widget/SelfServiceFlowSelect', () =>
    jest.fn(() => <div>SelfServiceFlowSelect</div>),
)

const useFlagMock = assumeMock(useFlag)
useFlagMock.mockReturnValue(true)

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
            </Provider>,
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
            </Provider>,
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
            </Provider>,
        )
        expect(
            screen.getByPlaceholderText('Choose a date...'),
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
            </Provider>,
        )

        expect(screen.getAllByText(/day\(s\) ago/)).toHaveLength(2)
        expect(screen.getByText('hour(s) ago')).toBeInTheDocument()
    })

    it('should render RichFieldWithVariables', () => {
        const leftsiblings = fromJS(['actions', 'replyToTicket', 'body_html'])
        const value = 'hello my good lad'
        const rule = fromJS({ code_ast: astCodeReplyToTicket })
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
                            key: { name: 'body_text' },
                            value: { value: 'foo bar' },
                        },
                    ]}
                />
            </Provider>,
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
                </Provider>,
            )
            expect(screen.getByText(value)).toBeInTheDocument()
            expect(
                screen.getByPlaceholderText('Add tags...'),
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
                </Provider>,
            )

            expect(screen.getByText('hello')).toBeInTheDocument()
            expect(screen.getByText('world')).toBeInTheDocument()
            expect(screen.getByText('!')).toBeInTheDocument()
            expect(
                screen.getByPlaceholderText('Add tags...'),
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
                </Provider>,
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
                </Provider>,
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
                </Provider>,
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
            const rule = fromJS({ code_ast: astCodeEq })
            const value = 3

            render(
                <Provider store={mockStore(defaultState)}>
                    <Widget
                        {...commonProps}
                        value={value}
                        leftsiblings={leftsiblings}
                        rule={rule}
                    />
                </Provider>,
            )

            expect(
                screen.getByText('★★★', { selector: '.label' }),
            ).toBeInTheDocument()

            fireEvent.click(screen.getByText('★★★★★'))

            expect(commonProps.actions.modifyCodeAST).toBeCalledWith(
                commonProps.parent,
                5,
                'UPDATE',
            )
        })
    })

    describe('Priority select', () => {
        it('should render PrioritySelect field', () => {
            const enumValues = ['high', 'medium', 'low']
            const leftsiblings = fromJS(['actions', 'priority'])
            const value = 'high'
            const rule = fromJS({
                code_ast: astCodeEq,
            })
            render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        schemas: fromJS({
                            definitions: {
                                Ticket: {
                                    properties: {
                                        priority: {
                                            meta: {
                                                enum: enumValues,
                                            },
                                        },
                                    },
                                },
                            },
                        }),
                    })}
                >
                    <Widget
                        {...commonProps}
                        value={value}
                        leftsiblings={leftsiblings}
                        rule={rule}
                    />
                </Provider>,
            )

            expect(screen.getByText('PrioritySelect')).toBeInTheDocument()
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
                </Provider>,
            )

            fireEvent.click(screen.getAllByText('close')[0])
            expect(commonProps.actions.modifyCodeAST).toBeCalledWith(
                commonProps.parent,
                [{ type: 'Literal', raw: `'${value[1]}'`, value: value[1] }],
                'UPDATE',
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
                </Provider>,
            )
            const newValue = 'hello you!'
            fireEvent.change(screen.getByDisplayValue(value), {
                target: { value: newValue },
            })

            expect(commonProps.actions.modifyCodeAST).toBeCalledWith(
                commonProps.parent,
                newValue,
                'UPDATE',
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
            </Provider>,
        )

        const channels = commonProps.schemas.getIn([
            ...path,
            'meta',
            'enum',
        ]) as List<any>
        expect(screen.getByText('Select an option')).toBeInTheDocument()

        channels.forEach((channel) => {
            expect(
                screen.getByText(humanizeChannel(channel)),
            ).toBeInTheDocument()
        })
    })

    it('should render display names for ticket language selection', () => {
        const path = ['definitions', 'Ticket', 'properties', 'language']
        const leftsiblings = fromJS(path)
        const value = 'fr'
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
            </Provider>,
        )

        const languages = commonProps.schemas.getIn([
            ...path,
            'meta',
            'enum',
        ]) as List<any>

        languages.forEach((language) => {
            expect(
                screen.getByText(getLanguageDisplayName(language) as string),
            ).toBeInTheDocument()
        })
    })

    it('should render number input field for number type', () => {
        const value = 42
        const rule = fromJS({
            code_ast: astCodeEq,
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <Widget
                    {...commonProps}
                    leftsiblings={fromJS([
                        'definitions',
                        'RechargeSubscription',
                        'properties',
                        'order_interval_frequency',
                    ])}
                    value={value}
                    rule={rule}
                />
            </Provider>,
        )
        const input = screen.getByDisplayValue(value.toString())

        expect(input).toHaveAttribute('type', 'number')
    })

    it('should handle negative number values by converting to positive', () => {
        const value = 5
        const rule = fromJS({
            code_ast: astCodeEq,
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <Widget
                    {...commonProps}
                    leftsiblings={fromJS([
                        'definitions',
                        'RechargeSubscription',
                        'properties',
                        'order_interval_frequency',
                    ])}
                    value={value}
                    rule={rule}
                />
            </Provider>,
        )

        fireEvent.change(screen.getByDisplayValue(value), {
            target: { value: '-10' },
        })

        expect(commonProps.actions.modifyCodeAST).toHaveBeenCalledWith(
            commonProps.parent,
            10,
            'UPDATE',
        )
    })

    it('should render snooze picker with custom units', () => {
        const value = '2h'
        const rule = fromJS({
            code_ast: astCodeEq,
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <Widget
                    {...commonProps}
                    config={{ widget: 'snooze-picker' }}
                    leftsiblings={fromJS([
                        'actions',
                        'snoozeTicket',
                        'snooze_timedelta',
                    ])}
                    value={value}
                    rule={rule}
                />
            </Provider>,
        )
        expect(screen.getByText('minute(s)')).toBeInTheDocument()
        expect(screen.getAllByText('hour(s)')).toHaveLength(2)
        expect(screen.getByText('day(s)')).toBeInTheDocument()
        expect(screen.getByDisplayValue(2)).toHaveAttribute('type', 'number')
    })

    it('should render custom field select for custom_field-select type', () => {
        const rule = fromJS({
            code_ast: astCodeEq,
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <Widget
                    {...commonProps}
                    rule={rule}
                    config={{ widget: 'custom_field-select' }}
                    leftsiblings={fromJS([
                        'actions',
                        'setCustomFieldValue',
                        'custom_field_id',
                    ])}
                />
            </Provider>,
        )

        expect(screen.getByText('CustomFieldSelect')).toBeInTheDocument()
    })

    it('should return null when custom field input has no custom field ID', () => {
        const rule = fromJS({
            code_ast: astCodeEq,
        })
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <Widget
                    {...commonProps}
                    rule={rule}
                    config={{ widget: 'custom_field-input' }}
                    leftsiblings={fromJS([
                        'actions',
                        'setCustomFieldValue',
                        'value',
                    ])}
                    properties={[
                        {
                            key: { name: 'custom_field_id' },
                            value: { value: null },
                        },
                    ]}
                />
            </Provider>,
        )

        expect(container.firstChild).toBeNull()
    })

    describe('Widget type determination based on leftsiblings path', () => {
        it('should handle properties path and show props with meta or $ref', () => {
            const rule = fromJS({
                code_ast: astCodeEq,
            })
            const schemasWithProps = fromJS({
                definitions: {
                    Ticket: {
                        properties: {
                            subject: {
                                meta: {
                                    rules: {
                                        label: 'Ticket Subject',
                                    },
                                },
                                description: 'The ticket subject',
                            },
                            status: {
                                $ref: '#/definitions/Status',
                            },
                        },
                    },
                },
            })

            render(
                <Provider store={mockStore(defaultState)}>
                    <Widget
                        {...commonProps}
                        rule={rule}
                        schemas={schemasWithProps}
                        leftsiblings={fromJS([
                            'definitions',
                            'Ticket',
                            'properties',
                        ])}
                    />
                </Provider>,
            )

            expect(screen.getByText('Ticket Subject')).toBeInTheDocument()
            expect(screen.getByText('status')).toBeInTheDocument()
        })

        it('should handle operators path and filter deprecated operators', () => {
            const rule = fromJS({
                code_ast: astCodeEq,
            })
            const schemasWithOperators = fromJS({
                definitions: {
                    Ticket: {
                        operators: {
                            eq: { label: 'Equals' },
                            neq: { label: 'Not Equals' },
                            contains: {
                                label: 'Deprecated',
                            },
                        },
                    },
                },
            })

            render(
                <Provider store={mockStore(defaultState)}>
                    <Widget
                        {...commonProps}
                        rule={rule}
                        schemas={schemasWithOperators}
                        leftsiblings={fromJS([
                            'definitions',
                            'Ticket',
                            'operators',
                        ])}
                    />
                </Provider>,
            )

            expect(screen.getByText('Equals')).toBeInTheDocument()
            expect(screen.getByText('Not Equals')).toBeInTheDocument()
            expect(screen.queryByText('Deprecated')).not.toBeInTheDocument()
        })

        it('should handle actions path and set widget type from config', () => {
            const rule = fromJS({
                code_ast: astCodeEq,
            })
            render(
                <Provider store={mockStore(defaultState)}>
                    <Widget
                        {...commonProps}
                        schemas={fromJS({
                            ..._schemas,
                            definitions: {
                                Ticket: {
                                    properties: {
                                        assignee_user_id: {
                                            meta: {
                                                rules: {
                                                    label: 'assignee user',
                                                    widget: 'assignee_user-select',
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        })}
                        rule={rule}
                        leftsiblings={fromJS([
                            'definitions',
                            'Ticket',
                            'properties',
                            'assignee_user_id',
                        ])}
                    />
                </Provider>,
            )

            expect(screen.getByText(/Loading agents/)).toBeInTheDocument()
        })

        it('should handle actions path and generate widget type from last element', () => {
            const rule = fromJS({
                code_ast: astCodeEq,
            })
            render(
                <Provider store={mockStore(defaultState)}>
                    <Widget
                        {...commonProps}
                        rule={rule}
                        leftsiblings={fromJS([
                            'actions',
                            'setPriority',
                            'priority',
                        ])}
                    />
                </Provider>,
            )

            expect(screen.getByText('PrioritySelect')).toBeInTheDocument()
        })

        it('should handle multi-select type for array values with collection operators', () => {
            const value = ['tag1', 'tag2']
            const rule = fromJS({
                code_ast: astCodeContains,
            })
            render(
                <Provider store={mockStore(defaultState)}>
                    <Widget
                        {...commonProps}
                        value={value}
                        rule={rule}
                        leftsiblings={fromJS([
                            'definitions',
                            'Ticket',
                            'properties',
                            'tags',
                            'name',
                        ])}
                    />
                </Provider>,
            )

            expect(screen.getByText(value[0])).toBeInTheDocument()
            expect(screen.getByText(value[1])).toBeInTheDocument()
            expect(
                screen.getByPlaceholderText('Add tags...'),
            ).toBeInTheDocument()
        })

        it('should handle order management flow and store integration paths', () => {
            const rule = fromJS({
                code_ast: astCodeEq,
            })
            render(
                <Provider store={mockStore(defaultState)}>
                    <Widget
                        {...commonProps}
                        rule={rule}
                        leftsiblings={fromJS([
                            'definitions',
                            'Ticket',
                            'properties',
                            'order_management_flow',
                        ])}
                    />
                </Provider>,
            )

            expect(
                screen.getByText('SelfServiceFlowSelect'),
            ).toBeInTheDocument()
        })

        it('should hide properties when meta.rules.hide is true and not current value', () => {
            const rule = fromJS({
                code_ast: astCodeEq,
            })
            const schemasWithHiddenProps = fromJS({
                definitions: {
                    Ticket: {
                        properties: {
                            visible_prop: {
                                meta: {
                                    rules: {
                                        label: 'Visible Property',
                                    },
                                },
                            },
                            hidden_prop: {
                                meta: {
                                    rules: {
                                        hide: true,
                                        label: 'Hidden Property',
                                    },
                                },
                            },
                        },
                    },
                },
            })

            render(
                <Provider store={mockStore(defaultState)}>
                    <Widget
                        {...commonProps}
                        rule={rule}
                        schemas={schemasWithHiddenProps}
                        leftsiblings={fromJS([
                            'definitions',
                            'Ticket',
                            'properties',
                        ])}
                    />
                </Provider>,
            )

            expect(screen.getByText('Visible Property')).toBeInTheDocument()
            expect(
                screen.queryByText('Hidden Property'),
            ).not.toBeInTheDocument()
        })

        it('should handle case insensitive operators for non-tag fields', () => {
            const rule = fromJS({
                code_ast: astCodeContains,
            })
            const value = 'Valuuuue'

            render(
                <Provider store={mockStore(defaultState)}>
                    <Widget
                        {...commonProps}
                        rule={rule}
                        leftsiblings={fromJS([
                            'definitions',
                            'Ticket',
                            'properties',
                            'subject',
                        ])}
                        value={value}
                    />
                </Provider>,
            )

            expect(screen.getByDisplayValue(value)).toBeInTheDocument()
        })

        it('should handle store integration path for self-service', () => {
            const rule = fromJS({
                code_ast: astCodeEq,
            })
            render(
                <Provider store={mockStore(defaultState)}>
                    <Widget
                        {...commonProps}
                        rule={rule}
                        leftsiblings={fromJS([
                            'definitions',
                            'Ticket',
                            'properties',
                            'store_integration_id',
                        ])}
                    />
                </Provider>,
            )

            expect(screen.getByText('Select an option')).toBeInTheDocument()
        })

        it('should use BASIC_OPERATORS for self_service_flow operators', () => {
            const rule = fromJS({
                code_ast: astCodeEq,
            })
            render(
                <Provider store={mockStore(defaultState)}>
                    <Widget
                        {...commonProps}
                        rule={rule}
                        leftsiblings={fromJS([
                            'definitions',
                            'Ticket',
                            'properties',
                            'self_service_flow',
                            'operators',
                        ])}
                    />
                </Provider>,
            )

            expect(screen.getByText('Select an option')).toBeInTheDocument()
        })
    })
})
