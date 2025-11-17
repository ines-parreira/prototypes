import type { ComponentProps } from 'react'

import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { appQueryClient } from 'api/queryClient'
import { useFlag } from 'core/flags'
import { useCustomFieldDefinition } from 'custom-fields/hooks/queries/useCustomFieldDefinition'
import {
    customerDropdownFieldDefinition,
    customerInputFieldDefinition,
    ticketDropdownFieldDefinition,
} from 'fixtures/customField'
import _schemas from 'fixtures/openapi.json'
import { humanizeChannel } from 'state/ticket/utils'
import type { RootState } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { getLanguageDisplayName } from 'utils'

import Widget from '../Widget'
import { useGetCustomFieldById } from '../widget/useGetCustomFieldById'
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

const useGetCustomFieldByIdMock = assumeMock(useGetCustomFieldById)
jest.mock('../widget/useGetCustomFieldById')
const queryClient = mockQueryClient()

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinition')
const useCustomFieldDefinitionMock = jest.mocked(useCustomFieldDefinition)

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
        rule: fromJS({
            code_ast: astCodeEq,
        }),
    }

    const renderComponent = (
        props?: Partial<ComponentProps<typeof Widget>>,
        state?: Partial<RootState>,
    ) =>
        render(
            <Provider store={mockStore({ ...defaultState, ...state })}>
                <QueryClientProvider client={appQueryClient}>
                    <Widget {...commonProps} {...props} />
                </QueryClientProvider>
            </Provider>,
        )

    it('should render case-insensitive MultiSelectField (containsAll operator)', () => {
        renderComponent({
            value: ['hello', 'world!'],
            rule: fromJS({
                code_ast: astCodeContains,
            }),
        })
        expect(screen.getByText('hello')).toBeInTheDocument()
        expect(screen.getByText('world!')).toBeInTheDocument()
    })

    it('should render InputField (eq operator)', () => {
        const value = 'hello world!'
        renderComponent({
            value,
        })
        expect(screen.getByDisplayValue(value)).toBeInTheDocument()
    })

    it('should render DatetimeSelect field', () => {
        renderComponent({
            value: '2018-03-28T21:59:32.580209',
            leftsiblings: fromJS([
                'definitions',
                'Ticket',
                'properties',
                'created_datetime',
            ]),
        })
        expect(
            screen.getByPlaceholderText('Choose a date...'),
        ).toBeInTheDocument()
    })

    it('should render TimedeltaSelect field', () => {
        renderComponent({
            value: '1d',
            rule: fromJS({
                code_ast: astCodeGteTimedelta,
            }),
            leftsiblings: fromJS([
                'definitions',
                'Ticket',
                'properties',
                'created_datetime',
            ]),
        })

        expect(screen.getAllByText(/day\(s\) ago/)).toHaveLength(2)
        expect(screen.getByText('hour(s) ago')).toBeInTheDocument()
    })

    it('should render RichFieldWithVariables', () => {
        const value = 'hello my good lad'
        renderComponent({
            leftsiblings: fromJS(['actions', 'replyToTicket', 'body_html']),
            value,
            rule: fromJS({ code_ast: astCodeReplyToTicket }),
            parent: fromJS([
                'body',
                0,
                'expression',
                'arguments',
                1,
                'properties',
                1,
                'value',
                'value',
            ]),
            config: {
                widget: 'rich-field',
                textField: 'body_text',
            },
            properties: [
                {
                    key: { name: 'body_text' },
                    value: { value: 'foo bar' },
                },
            ],
        })

        expect(screen.getByText(value)).toBeInTheDocument()
        expect(screen.getByText('Ticket customer')).toBeInTheDocument()
        expect(screen.getAllByText('First name')).toHaveLength(2)
        expect(screen.getByText('Current agent')).toBeInTheDocument()
    })

    describe('TagsSelect', () => {
        it('should render case sensitive TagsSelect field (tags properties)', () => {
            const value = 'I am a tag'
            renderComponent({
                leftsiblings: fromJS([
                    'definitions',
                    'Ticket',
                    'properties',
                    'tags',
                    'name',
                ]),
                value,
                rule: fromJS({ code_ast: astCodeContains }),
            })

            expect(screen.getByText(value)).toBeInTheDocument()
            expect(
                screen.getByPlaceholderText('Add tags...'),
            ).toBeInTheDocument()
        })

        it('should render multi TagsSelect field (addTags action)', () => {
            const value = 'hello, world, !'
            renderComponent({
                leftsiblings: fromJS(['actions', 'addTags', 'tags']),
                value,
            })

            expect(screen.getByText('hello')).toBeInTheDocument()
            expect(screen.getByText('world')).toBeInTheDocument()
            expect(screen.getByText('!')).toBeInTheDocument()
            expect(
                screen.getByPlaceholderText('Add tags...'),
            ).toBeInTheDocument()
        })

        it('should render component AssigneeUserSelect', () => {
            renderComponent({
                leftsiblings: fromJS(['actions', 'assignee_user']),
            })

            expect(screen.getByText(/Loading agents/)).toBeInTheDocument()
        })

        it('should render component AssigneeTeamSelect', () => {
            renderComponent({
                leftsiblings: fromJS(['actions', 'assignee_team']),
            })

            expect(screen.getByText('Select an option')).toBeInTheDocument()
        })
    })

    describe('SelfServiceFlowSelect', () => {
        it('should render SelfServiceFlowSelect field', () => {
            const value = 'flow'

            renderComponent({
                leftsiblings: fromJS([
                    'definitions',
                    'TicketMessage',
                    'properties',
                    'self_service_flow',
                ]),
                value,
            })

            expect(screen.getByRole('textbox')).toHaveValue(value)
        })
    })

    describe('CSAT select', () => {
        it('should render CSAT select field', () => {
            renderComponent({
                leftsiblings: fromJS([
                    'definitions',
                    'SatisfactionSurvey',
                    'properties',
                    'score',
                ]),
                value: 3,
            })

            expect(
                screen.getByText('★★★', { selector: '.label' }),
            ).toBeInTheDocument()

            fireEvent.click(screen.getByText('★★★★★'))

            expect(commonProps.actions.modifyCodeAST).toHaveBeenCalledWith(
                commonProps.parent,
                5,
                'UPDATE',
                undefined,
                undefined,
            )
        })
    })

    describe('Priority select', () => {
        it('should render PrioritySelect field', () => {
            const enumValues = ['high', 'medium', 'low']
            renderComponent(
                {
                    leftsiblings: fromJS(['actions', 'priority']),
                    value: 'high',
                },
                {
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
                },
            )

            expect(screen.getByText('PrioritySelect')).toBeInTheDocument()
        })
    })

    describe('should handle change', () => {
        it('AST ExpressionArray value', () => {
            const value = ['hello', 'world!']

            renderComponent({
                value,
                rule: fromJS({ code_ast: astCodeContains }),
            })

            fireEvent.click(screen.getAllByText('close')[0])
            expect(commonProps.actions.modifyCodeAST).toHaveBeenCalledWith(
                commonProps.parent,
                [{ type: 'Literal', raw: `'${value[1]}'`, value: value[1] }],
                'UPDATE',
                undefined,
                undefined,
            )
        })

        it('AST Literal value', () => {
            const value = 'hello world!'

            renderComponent({
                value,
            })

            const newValue = 'hello you!'
            fireEvent.change(screen.getByDisplayValue(value), {
                target: { value: newValue },
            })

            expect(commonProps.actions.modifyCodeAST).toHaveBeenCalledWith(
                commonProps.parent,
                newValue,
                'UPDATE',
                undefined,
                undefined,
            )
        })
    })

    it('should render humanized labels for ticket channel selection', () => {
        const path = ['definitions', 'Ticket', 'properties', 'channel']

        renderComponent({
            leftsiblings: fromJS([
                'definitions',
                'Ticket',
                'properties',
                'channel',
            ]),
            value: 'contact_form',
        })

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

        renderComponent({
            leftsiblings: fromJS([
                'definitions',
                'Ticket',
                'properties',
                'language',
            ]),
            value: 'fr',
        })

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
        renderComponent({
            leftsiblings: fromJS([
                'definitions',
                'RechargeSubscription',
                'properties',
                'order_interval_frequency',
            ]),
            value,
        })
        const input = screen.getByDisplayValue(value.toString())

        expect(input).toHaveAttribute('type', 'number')
    })

    it('should handle negative number values by converting to positive', () => {
        const value = 5
        renderComponent({
            leftsiblings: fromJS([
                'definitions',
                'RechargeSubscription',
                'properties',
                'order_interval_frequency',
            ]),
            value,
        })

        fireEvent.change(screen.getByDisplayValue(value), {
            target: { value: '-10' },
        })

        expect(commonProps.actions.modifyCodeAST).toHaveBeenCalledWith(
            commonProps.parent,
            10,
            'UPDATE',
            undefined,
            undefined,
        )
    })

    it('should render snooze picker with custom units', () => {
        const value = '2h'
        renderComponent({
            config: { widget: 'snooze-picker' },
            leftsiblings: fromJS([
                'actions',
                'snoozeTicket',
                'snooze_timedelta',
            ]),
            value,
        })

        expect(screen.getByText('minute(s)')).toBeInTheDocument()
        expect(screen.getAllByText('hour(s)')).toHaveLength(2)
        expect(screen.getByText('day(s)')).toBeInTheDocument()
        expect(screen.getByDisplayValue(2)).toHaveAttribute('type', 'number')
    })

    it('should render custom field select for custom_field-select type', () => {
        renderComponent({
            config: { widget: 'custom_field-select' },
            leftsiblings: fromJS([
                'actions',
                'setCustomFieldValue',
                'custom_field_id',
            ]),
        })

        expect(screen.getByText('CustomFieldSelect')).toBeInTheDocument()
    })

    it('should return null when custom field input has no custom field ID', () => {
        const { container } = renderComponent({
            config: { widget: 'custom_field-input' },
            leftsiblings: fromJS(['actions', 'setCustomFieldValue', 'value']),
            properties: [
                {
                    key: { name: 'custom_field_id' },
                    value: { value: null },
                },
            ],
        })

        expect(container.firstChild).toBeNull()
    })

    it('should render customer field input when customer field ID is present', () => {
        useCustomFieldDefinitionMock.mockReturnValue({
            data: customerInputFieldDefinition,
        } as ReturnType<typeof useCustomFieldDefinition>)
        const rule = fromJS({
            code_ast: astCodeEq,
        })
        const value = 'test customer field value'
        const customerFieldId = customerInputFieldDefinition.id

        render(
            <Provider store={mockStore(defaultState)}>
                <QueryClientProvider client={queryClient}>
                    <Widget
                        {...commonProps}
                        rule={rule}
                        config={{ widget: 'customer_field-input' }}
                        leftsiblings={fromJS([
                            'actions',
                            'setCustomerCustomFieldValue',
                            'value',
                        ])}
                        value={value}
                        properties={[
                            {
                                key: { name: 'Input field' },
                                value: { value: customerFieldId },
                            },
                        ]}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getByDisplayValue(value)).toBeInTheDocument()
    })

    it('should return null when customer field input has no customer field ID', () => {
        const rule = fromJS({
            code_ast: astCodeEq,
        })
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <Widget
                    {...commonProps}
                    rule={rule}
                    config={{ widget: 'customer_field-input' }}
                    leftsiblings={fromJS([
                        'actions',
                        'setCustomerCustomFieldValue',
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
            renderComponent({
                schemas: fromJS({
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
                }),
                leftsiblings: fromJS(['definitions', 'Ticket', 'properties']),
            })

            expect(screen.getByText('Ticket Subject')).toBeInTheDocument()
            expect(screen.getByText('status')).toBeInTheDocument()
        })

        it('should handle operators path and filter deprecated operators', () => {
            renderComponent({
                schemas: fromJS({
                    definitions: {
                        Ticket: {
                            operators: {
                                eq: { label: 'Equals' },
                                neq: { label: 'Not Equals' },
                                contains: { label: 'Deprecated' },
                            },
                        },
                    },
                }),
                leftsiblings: fromJS(['definitions', 'Ticket', 'operators']),
            })

            expect(screen.getByText('Equals')).toBeInTheDocument()
            expect(screen.getByText('Not Equals')).toBeInTheDocument()
            expect(screen.queryByText('Deprecated')).not.toBeInTheDocument()
        })

        it('should handle actions path and set widget type from config', () => {
            renderComponent({
                schemas: fromJS({
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
                }),
                leftsiblings: fromJS([
                    'definitions',
                    'Ticket',
                    'properties',
                    'assignee_user_id',
                ]),
            })

            expect(screen.getByText(/Loading agents/)).toBeInTheDocument()
        })

        it('should handle actions path and generate widget type from last element', () => {
            renderComponent({
                leftsiblings: fromJS(['actions', 'setPriority', 'priority']),
            })

            expect(screen.getByText('PrioritySelect')).toBeInTheDocument()
        })

        it('should handle multi-select type for array values with collection operators', () => {
            const value = ['tag1', 'tag2']
            renderComponent({
                rule: fromJS({
                    code_ast: astCodeContains,
                }),
                leftsiblings: fromJS([
                    'definitions',
                    'Ticket',
                    'properties',
                    'tags',
                    'name',
                ]),
                value,
            })

            expect(screen.getByText(value[0])).toBeInTheDocument()
            expect(screen.getByText(value[1])).toBeInTheDocument()
            expect(
                screen.getByPlaceholderText('Add tags...'),
            ).toBeInTheDocument()
        })

        it('should handle order management flow and store integration paths', () => {
            renderComponent({
                leftsiblings: fromJS([
                    'definitions',
                    'Ticket',
                    'properties',
                    'order_management_flow',
                ]),
            })

            expect(
                screen.getByText('SelfServiceFlowSelect'),
            ).toBeInTheDocument()
        })

        it('should hide properties when meta.rules.hide is true and not current value', () => {
            renderComponent({
                schemas: fromJS({
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
                }),
                leftsiblings: fromJS(['definitions', 'Ticket', 'properties']),
            })

            expect(screen.getByText('Visible Property')).toBeInTheDocument()
            expect(
                screen.queryByText('Hidden Property'),
            ).not.toBeInTheDocument()
        })

        it('should handle case insensitive operators for non-tag fields', () => {
            const value = 'Valuuuue'
            renderComponent({
                rule: fromJS({
                    code_ast: astCodeContains,
                }),
                leftsiblings: fromJS([
                    'definitions',
                    'Ticket',
                    'properties',
                    'subject',
                ]),
                value,
            })

            expect(screen.getByDisplayValue(value)).toBeInTheDocument()
        })

        it('should handle store integration path for self-service', () => {
            renderComponent({
                leftsiblings: fromJS([
                    'definitions',
                    'Ticket',
                    'properties',
                    'store_integration_id',
                ]),
            })

            expect(screen.getByText('Select an option')).toBeInTheDocument()
        })

        it('should handle custom fields path resolution for operators and value input', () => {
            renderComponent({
                leftsiblings: fromJS([
                    'definitions',
                    'Ticket',
                    'properties',
                    'custom_fields',
                    '123',
                    'operators',
                ]),
            })

            expect(screen.getByText('is')).toBeInTheDocument()
            expect(screen.getByText('is not')).toBeInTheDocument()
        })

        it('should handle ticket custom field operators from schemas and convert to widget format', () => {
            useGetCustomFieldByIdMock.mockReturnValue(
                ticketDropdownFieldDefinition,
            )

            renderComponent({
                leftsiblings: fromJS([
                    'definitions',
                    'Ticket',
                    'properties',
                    'custom_fields',
                    ticketDropdownFieldDefinition.id.toString(),
                    'operators',
                ]),
                schemas: fromJS({
                    definitions: {
                        Ticket: {
                            properties: {
                                custom_fields: {
                                    meta: {
                                        operators: {
                                            dropdown: {
                                                eq: { label: 'contains' },
                                                neq: {
                                                    label: 'does not contain',
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                }),
            })

            expect(screen.getByText('contains')).toBeInTheDocument()
            expect(screen.getByText('does not contain')).toBeInTheDocument()
        })

        it('should use BASIC_OPERATORS for self_service_flow operators', () => {
            renderComponent({
                leftsiblings: fromJS([
                    'definitions',
                    'Ticket',
                    'properties',
                    'self_service_flow',
                    'operators',
                ]),
            })

            expect(screen.getByText('Select an option')).toBeInTheDocument()
        })

        it('should handle customer custom field operators from ticket custom fields schemas and convert to widget format', () => {
            useGetCustomFieldByIdMock.mockReturnValue(
                customerDropdownFieldDefinition,
            )

            renderComponent({
                leftsiblings: fromJS([
                    'definitions',
                    'Ticket',
                    'properties',
                    'customer',
                    'properties',
                    'custom_fields',
                    customerDropdownFieldDefinition.id.toString(),
                    'operators',
                ]),
                schemas: fromJS({
                    definitions: {
                        Ticket: {
                            properties: {
                                custom_fields: {
                                    meta: {
                                        operators: {
                                            dropdown: {
                                                eq: { label: 'contains' },
                                                neq: {
                                                    label: 'does not contain',
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                }),
            })

            expect(screen.getByText('contains')).toBeInTheDocument()
            expect(screen.getByText('does not contain')).toBeInTheDocument()
        })

        it('should fallback to BASIC_OPERATORS for customer custom fields when schema not found', () => {
            useGetCustomFieldByIdMock.mockReturnValue(
                ticketDropdownFieldDefinition,
            )

            renderComponent({
                leftsiblings: fromJS([
                    'definitions',
                    'Ticket',
                    'properties',
                    'customer',
                    'properties',
                    'custom_fields',
                    ticketDropdownFieldDefinition.id.toString(),
                    'operators',
                ]),
                schemas: fromJS({
                    definitions: {
                        Ticket: {
                            properties: {},
                        },
                    },
                }),
            })

            expect(screen.getByText('is')).toBeInTheDocument()
            expect(screen.getByText('is not')).toBeInTheDocument()
        })
    })
})
