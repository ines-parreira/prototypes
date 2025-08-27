import { ComponentProps, ReactNode } from 'react'

import { act, fireEvent, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Expression, Identifier } from 'estree'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { DateTimeFormatMapper, DateTimeFormatType } from 'constants/datetime'
import CustomFieldByIdInput from 'custom-fields/components/CustomFieldByIdInput/CustomFieldByIdInput'
import { IntegrationType } from 'models/integration/constants'
import { IntegrationFromType } from 'models/integration/types'
import { RightContainer } from 'pages/common/components/ViewTable/Filters/Right'
import { FEEDBACK_VALUE_TYPE_FILTER_OPTIONS } from 'pages/common/components/ViewTable/Filters/utils/feedbackValueTypeFilterOptions'
import MultiSelectField from 'pages/common/forms/MultiSelectField'
import { CHANNELS } from 'tickets/common/config'

jest.mock('moment-timezone', () => () => {
    const moment: (date: string) => Record<string, unknown> =
        jest.requireActual('moment-timezone')

    return moment('2019-09-03')
})

jest.mock(
    'pages/common/forms/DatePicker',
    () =>
        ({ children }: { children: ReactNode }) => {
            return <>{children}</>
        },
)

jest.mock(
    'pages/common/forms/MultiSelectField',
    () =>
        ({ onChange, options }: ComponentProps<typeof MultiSelectField>) => {
            return (
                <div data-testid="multi-select-field">
                    MultiSelectField
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => onChange([option.value])}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )
        },
)

jest.mock('pages/common/forms/TimedeltaPicker', () => () => {
    return <div data-testid="timedelta-picker">TimedeltaPicker</div>
})

jest.mock('pages/common/components/ViewTable/FilterDropdown', () => () => {
    return <div data-testid="filter-dropdown">FilterDropdown</div>
})

jest.mock(
    'pages/common/components/ViewTable/FilterMultiSelectField',
    () => () => {
        return (
            <div data-testid="filter-multi-select-field">
                FilterMultiSelectField
            </div>
        )
    },
)

jest.mock(
    'custom-fields/components/CustomFieldByIdInput/CustomFieldByIdInput',
    () =>
        ({
            value,
            onChange,
            dropdownAdditionalProps,
        }: ComponentProps<typeof CustomFieldByIdInput>) => {
            const { allowMultiValues, customDisplayValue } =
                dropdownAdditionalProps || {}
            return (
                <div
                    onClick={() => {
                        allowMultiValues
                            ? onChange([...(value as []), 'baz'] as any)
                            : onChange('baz' as any)
                    }}
                >
                    <>
                        {!!value ? (
                            <div>Value: {JSON.stringify(value)}</div>
                        ) : null}
                    </>
                    {!!customDisplayValue?.(value) && (
                        <div>Custom: {customDisplayValue(value)}</div>
                    )}
                </div>
            )
        },
)

const mockStore = configureMockStore([thunk])
const store = mockStore({})

const updateFieldFilterMock = jest.fn()

describe('<Right />', () => {
    const minProps = {
        agents: fromJS([]),
        areFiltersValid: true,
        config: fromJS({}),
        empty: false,
        field: fromJS({
            name: 'created',
            title: 'Created',
            path: 'created_datetime',
            filter: {
                sort: {
                    created_datetime: 'desc',
                },
            },
        }),
        index: 0,
        integrations: fromJS([]),
        objectPath: 'ticket.created_datetime',
        operator: {
            loc: {
                end: {
                    line: 1,
                    column: 3,
                },
                start: {
                    line: 1,
                    column: 0,
                },
            },
            name: 'gte',
            type: 'Identifier',
        } as Identifier,
        tags: fromJS([]),
        teams: fromJS([]),
        updateFieldFilter: updateFieldFilterMock,
        datetimeFormat:
            DateTimeFormatMapper[
                DateTimeFormatType.COMPACT_DATE_WITH_TIME_EN_GB_24_HOUR
            ],
        storeMappings: [],
        storeIntegrationMapping: [],
    } as unknown as ComponentProps<typeof RightContainer>

    it('should default the current datetime when the date value is invalid', () => {
        const { container } = render(
            <Provider store={store}>
                <RightContainer
                    {...minProps}
                    node={{
                        loc: {
                            end: {
                                line: 1,
                                column: 54,
                            },
                            start: {
                                line: 1,
                                column: 29,
                            },
                        },
                        raw: "'2021-12-1T06:00:00.000Z'",
                        type: 'Literal',
                        value: '2021-12-1T06:00:00.000Z',
                    }}
                />
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render humanized label if ticket channel is selected', () => {
        const { container } = render(
            <Provider store={store}>
                <RightContainer
                    {...minProps}
                    operator={{
                        name: 'eq',
                        type: 'Identifier',
                    }}
                    node={{
                        raw: "'contact_form'",
                        type: 'Literal',
                        value: 'contact_form',
                    }}
                    field={fromJS({
                        name: 'channel',
                        title: 'Channel',
                        enum: CHANNELS,
                    })}
                />
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render MultiSelectField for priority field with ArrayExpression', async () => {
        render(
            <Provider store={store}>
                <RightContainer
                    {...minProps}
                    operator={{
                        name: 'eq',
                        type: 'Identifier',
                    }}
                    node={{
                        type: 'ArrayExpression',
                        elements: [
                            {
                                type: 'Literal',
                                value: 'high',
                                raw: "'high'",
                            },
                            {
                                type: 'Literal',
                                value: 'medium',
                                raw: "'medium'",
                            },
                        ],
                    }}
                    field={fromJS({
                        name: 'priority',
                        title: 'Priority',
                        filter: {
                            enum: [
                                { value: 'low', label: 'Low' },
                                { value: 'medium', label: 'Medium' },
                                { value: 'high', label: 'High' },
                            ],
                        },
                    })}
                />
            </Provider>,
        )

        expect(screen.getByTestId('multi-select-field')).toBeInTheDocument()

        await act(async () => {
            await userEvent.click(screen.getByText('Low'))
        })

        expect(updateFieldFilterMock).toHaveBeenCalledWith(minProps.index, [
            'low',
        ])
    })

    describe('custom field expression tests', () => {
        const baseCustomFieldProps = {
            operator: {
                name: 'eq',
                type: 'Identifier' as const,
            },
            node: {
                type: 'Literal' as const,
                value: 'foo',
                raw: "'foo'",
            },
            field: fromJS({
                name: 'ticket_field',
                title: 'Ticket Field',
                path: 'custom_fields',
            }),
            objectPath: 'ticket.custom_fields[123].value',
        }

        it('should set rendered custom field value on mount', () => {
            render(
                <Provider store={store}>
                    <RightContainer {...minProps} {...baseCustomFieldProps} />
                </Provider>,
            )

            expect(screen.getByText('Value: "foo"')).toBeInTheDocument()
        })

        it('should set rendered custom field values for Array expression on mount', () => {
            render(
                <Provider store={store}>
                    <RightContainer
                        {...minProps}
                        {...baseCustomFieldProps}
                        node={{
                            type: 'ArrayExpression',
                            elements: [
                                {
                                    type: 'Literal',
                                    value: 'foo',
                                    raw: "'foo'",
                                },
                                {
                                    type: 'Literal',
                                    value: 'bar',
                                    raw: "'bar'",
                                },
                            ],
                        }}
                    />
                </Provider>,
            )

            expect(screen.getByText('Value: ["foo","bar"]')).toBeInTheDocument()
        })

        it('should set displayed custom field value as undefined on update if node does not provide a value', () => {
            const { rerender } = render(
                <Provider store={store}>
                    <RightContainer {...minProps} {...baseCustomFieldProps} />
                </Provider>,
            )

            rerender(
                <Provider store={store}>
                    <RightContainer
                        {...minProps}
                        {...baseCustomFieldProps}
                        node={{
                            ...baseCustomFieldProps.node,
                            value: '',
                            raw: "''",
                        }}
                    />
                </Provider>,
            )

            expect(screen.queryByText('Value: "foo"')).not.toBeInTheDocument()
        })

        it('should handle custom field value change', async () => {
            const user = userEvent.setup()
            const { container } = render(
                <Provider store={store}>
                    <RightContainer {...minProps} {...baseCustomFieldProps} />
                </Provider>,
            )

            await act(async () => {
                await user.click(container.firstChild as Element)
            })

            expect(screen.getByText('Value: "baz"')).toBeInTheDocument()
        })

        it('should handle custom field custom display value', () => {
            render(
                <Provider store={store}>
                    <RightContainer
                        {...minProps}
                        {...baseCustomFieldProps}
                        node={{
                            type: 'ArrayExpression',
                            elements: [
                                {
                                    type: 'Literal',
                                    value: 'foo',
                                    raw: "'foo'",
                                },
                                {
                                    type: 'Literal',
                                    value: 'bar',
                                    raw: "'bar'",
                                },
                            ],
                        }}
                    />
                </Provider>,
            )

            expect(
                screen.getByText('Custom: 2 fields selected'),
            ).toBeInTheDocument()
        })

        it('should return empty string for custom field custom display value if value is empty', () => {
            render(
                <Provider store={store}>
                    <RightContainer
                        {...minProps}
                        {...baseCustomFieldProps}
                        node={{
                            type: 'ArrayExpression',
                            elements: [],
                        }}
                    />
                </Provider>,
            )

            expect(screen.queryByText(/Custom:/)).not.toBeInTheDocument()
        })
    })

    it('should render plain danger button when no field is present, but a value is passed in node', () => {
        render(
            <Provider store={store}>
                <RightContainer
                    {...minProps}
                    field={undefined}
                    node={{ value: true, raw: 'true', type: 'Literal' }}
                />
            </Provider>,
        )

        expect(screen.getByText('true')).toHaveClass('btn-outline-danger')
    })

    it('should render nothing when no field is present and no value is passed in node', () => {
        const { container } = render(
            <Provider store={store}>
                <RightContainer
                    {...minProps}
                    field={undefined}
                    // @ts-ignore this is not likely to happen, but there is a safeguard in place
                    node={{}}
                />
            </Provider>,
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('should render current user label when value is "{{current_user.id}}"', () => {
        const node = {
            raw: "'{{current_user.id}}'",
            type: 'Literal',
            value: '{{current_user.id}}',
        } as Expression
        const field = fromJS({ name: 'dummy_field', title: 'Dummy' })
        const props = { ...minProps, field, node }

        render(
            <Provider store={store}>
                <RightContainer {...props} />
            </Provider>,
        )

        expect(screen.getByText('Me (current user)')).toBeInTheDocument()
    })

    it('should render integration label for single integration', () => {
        const integrationField = fromJS({
            name: 'integrations',
            title: 'Integrations',
            filter: {},
        })
        const node = {
            raw: "'123'",
            type: 'Literal',
            value: '123',
        } as Expression
        const integrations = fromJS([{ id: 123, name: 'Test Integration' }])
        const props = {
            ...minProps,
            field: integrationField,
            node,
            agents: fromJS([]),
            teams: fromJS([]),
        }
        const customProps = { ...props, integrations }

        render(
            <Provider store={store}>
                <RightContainer {...customProps} />
            </Provider>,
        )

        expect(screen.getByText('Test Integration')).toBeInTheDocument()
    })

    it('should render MultiSelectField for integrations when node is ArrayExpression', () => {
        const integrationField = fromJS({
            name: 'integrations',
            title: 'Integrations',
            filter: {},
        })
        const node = {
            type: 'ArrayExpression',
            elements: [{ type: 'Literal', value: '123', raw: "'123'" }],
        } as Expression
        const integrations = fromJS([{ id: 123, name: 'Test Integration' }])
        const props = {
            ...minProps,
            field: integrationField,
            node,
            agents: fromJS([]),
            teams: fromJS([]),
        }
        const customProps = { ...props, integrations }

        render(
            <Provider store={store}>
                <RightContainer {...customProps} />
            </Provider>,
        )

        expect(screen.getByTestId('multi-select-field')).toBeInTheDocument()
    })

    it('should render team name for AssigneeTeam', () => {
        const teamField = fromJS({
            name: 'assignee_team',
            title: 'Assignee Team',
        })
        const node = { raw: "'42'", type: 'Literal', value: '42' } as Expression
        const team = fromJS({ id: 42, name: 'Support Team' })
        const props = {
            ...minProps,
            field: teamField,
            node,
            agents: fromJS([]),
            teams: fromJS([team]),
        }

        render(
            <Provider store={store}>
                <RightContainer {...props} />
            </Provider>,
        )

        expect(screen.getByText('Support Team')).toBeInTheDocument()
    })

    it('should render agent name for Assignee', () => {
        const agentField = fromJS({ name: 'assignee', title: 'Assignee' })
        const node = { raw: "'55'", type: 'Literal', value: '55' } as Expression
        const agent = fromJS({ id: 55, name: 'Agent Smith' })
        const props = {
            ...minProps,
            field: agentField,
            node,
            agents: fromJS([agent]),
            teams: fromJS([]),
        }

        render(
            <Provider store={store}>
                <RightContainer {...props} />
            </Provider>,
        )

        expect(screen.getByText('Agent Smith')).toBeInTheDocument()
    })

    it('should render customer label', () => {
        const customerField = fromJS({ name: 'customer', title: 'Customer' })
        const node = { raw: "'99'", type: 'Literal', value: '99' } as Expression
        const props = { ...minProps, field: customerField, node }

        render(
            <Provider store={store}>
                <RightContainer {...props} />
            </Provider>,
        )

        expect(screen.getByText('Customer #99')).toBeInTheDocument()
    })

    it('should render language display name', () => {
        const languageField = fromJS({ name: 'language', title: 'Language' })
        const node = { raw: "'en'", type: 'Literal', value: 'en' } as Expression
        const props = { ...minProps, field: languageField, node }

        render(
            <Provider store={store}>
                <RightContainer {...props} />
            </Provider>,
        )

        expect(screen.getByText('English')).toBeInTheDocument()
    })

    it('should render TimedeltaPicker for datetime field with timedelta operator', () => {
        const timedeltaOperator = { name: 'gteTimedelta', type: 'Identifier' }
        const datetimeField = fromJS({
            name: 'other',
            title: 'Other',
            path: 'something_datetime',
        })
        const node = {
            raw: "'2020-01-01T00:00:00.000Z'",
            type: 'Literal',
            value: '2020-01-01T00:00:00.000Z',
        } as Expression
        const props = {
            ...minProps,
            operator: timedeltaOperator,
            field: datetimeField,
            node,
        } as any

        render(
            <Provider store={store}>
                <RightContainer {...props} />
            </Provider>,
        )

        expect(screen.getByTestId('timedelta-picker')).toBeInTheDocument()
    })

    it('should render FilterMultiSelectField for Tags', () => {
        const tagsField = fromJS({ name: 'tags', title: 'Tags' })
        const node = {
            type: 'ArrayExpression',
            elements: [
                { type: 'Literal', value: 'tag1', raw: "'tag1'" },
                { type: 'Literal', value: 'tag2', raw: "'tag2'" },
            ],
        } as Expression
        const props = { ...minProps, field: tagsField, node }

        render(
            <Provider store={store}>
                <RightContainer {...props} />
            </Provider>,
        )

        expect(
            screen.getByTestId('filter-multi-select-field'),
        ).toBeInTheDocument()
    })

    it('should render MultiSelectField for Channel when node is ArrayExpression', () => {
        const channelField = fromJS({
            name: 'channel',
            title: 'Channel',
            filter: {
                enum: CHANNELS,
            },
        })
        const node = {
            type: 'ArrayExpression',
            elements: [{ type: 'Literal', value: 'email', raw: "'email'" }],
        } as Expression
        const props = { ...minProps, field: channelField, node }

        render(
            <Provider store={store}>
                <RightContainer {...props} />
            </Provider>,
        )

        expect(screen.getByTestId('multi-select-field')).toBeInTheDocument()
    })

    it('should render MultiSelectField for CSATScore', () => {
        const csatField = fromJS({
            name: 'csat_score',
            title: 'CSAT Score',
            filter: { enum: [1, 2, 3, 4, 5] },
        })
        const node = {
            type: 'ArrayExpression',
            elements: [{ type: 'Literal', value: 2, raw: '2' }],
        } as Expression
        const props = { ...minProps, field: csatField, node }

        render(
            <Provider store={store}>
                <RightContainer {...props} />
            </Provider>,
        )

        expect(screen.getByTestId('multi-select-field')).toBeInTheDocument()
    })

    it('should render MultiSelectField for Feedback', () => {
        const feedbackField = fromJS({
            name: 'feedback',
            title: 'Feedback',
            filter: { enum: FEEDBACK_VALUE_TYPE_FILTER_OPTIONS },
        })
        const node = {
            type: 'ArrayExpression',
            elements: [
                {
                    type: 'Literal',
                    value: 'TICKET_RATING_GOOD',
                    raw: "'TICKET_RATING_GOOD'",
                },
            ],
        } as Expression
        const props = { ...minProps, field: feedbackField, node }

        render(
            <Provider store={store}>
                <RightContainer {...props} />
            </Provider>,
        )

        expect(screen.getByTestId('multi-select-field')).toBeInTheDocument()
        expect(screen.getByText('Source used - negative')).toBeInTheDocument()
        expect(screen.getByText('Source used - positive')).toBeInTheDocument()
        fireEvent.click(screen.getByText('Source used - negative'))

        expect(updateFieldFilterMock).toHaveBeenCalledWith(minProps.index, [
            'KNOWLEDGE_THUMBS_DOWN',
        ])
    })

    it('should render default clickable dropdown and toggle FilterDropdown', async () => {
        const user = userEvent.setup()
        const otherField = fromJS({ name: 'other_field', title: 'Other Field' })
        const node = {
            raw: "'default'",
            type: 'Literal',
            value: 'default',
        } as Expression
        const props = { ...minProps, field: otherField, node }

        render(
            <Provider store={store}>
                <RightContainer {...props} />
            </Provider>,
        )

        // The default branch renders a button with the node value.
        const button = screen.getByText('default')
        expect(button).toBeInTheDocument()
        // Initially, the dropdown is not rendered.
        expect(screen.queryByTestId('filter-dropdown')).not.toBeInTheDocument()
        // Click to toggle dropdown
        await act(async () => {
            await user.click(button)
        })
        expect(screen.getByTestId('filter-dropdown')).toBeInTheDocument()
    })

    it('should call _selectFirstOption when node value is empty and field has one option', () => {
        const optionField = fromJS({
            name: 'option_field',
            title: 'Option Field',
            filter: fromJS({ enum: ['only-option'] }),
        })
        const node = { raw: "''", type: 'Literal', value: '' } as Expression
        const updateMock = jest.fn()
        const props = {
            ...minProps,
            field: optionField,
            node,
            updateFieldFilter: updateMock,
        }
        render(
            <Provider store={store}>
                <RightContainer {...props} />
            </Provider>,
        )
        expect(updateMock).toHaveBeenCalledWith(minProps.index, 'only-option')
    })

    describe('store field rendering', () => {
        const storeField = fromJS({
            name: 'store',
            title: 'Store',
            path: 'store_id',
            filter: {},
        })

        it('should render MultiSelectField for store field when node is ArrayExpression', () => {
            const node = {
                type: 'ArrayExpression',
                elements: [
                    { type: 'Literal', value: 1, raw: '1' },
                    { type: 'Literal', value: 2, raw: '2' },
                ],
            } as Expression

            const props = {
                ...minProps,
                field: storeField,
                node,
                storeIntegrationMapping: [
                    {
                        integration: {
                            id: 1,
                            name: 'Store 1',
                        } as IntegrationFromType<
                            | IntegrationType.Shopify
                            | IntegrationType.BigCommerce
                            | IntegrationType.Magento2
                        >,
                        id: 1,
                    },
                    {
                        integration: {
                            id: 2,
                            name: 'Store 2',
                        } as IntegrationFromType<
                            | IntegrationType.Shopify
                            | IntegrationType.BigCommerce
                            | IntegrationType.Magento2
                        >,
                        id: 2,
                    },
                ],
            }

            render(
                <Provider store={store}>
                    <RightContainer {...props} />
                </Provider>,
            )

            expect(screen.getByTestId('multi-select-field')).toBeInTheDocument()
            expect(screen.getByText('Store 1')).toBeInTheDocument()
            expect(screen.getByText('Store 2')).toBeInTheDocument()

            fireEvent.click(screen.getByText('Store 1'))
            expect(updateFieldFilterMock).toHaveBeenCalledWith(minProps.index, [
                1,
            ])
        })

        it('should render store value for single store value', () => {
            const node = {
                raw: '1',
                type: 'Literal',
                value: 1,
            } as Expression

            const props = {
                ...minProps,
                field: storeField,
                node,
                storeIntegrationMapping: [
                    {
                        integration: {
                            id: 1,
                            name: 'Store 1',
                        } as IntegrationFromType<
                            | IntegrationType.Shopify
                            | IntegrationType.BigCommerce
                            | IntegrationType.Magento2
                        >,
                        id: 1,
                    },
                ],
            }

            render(
                <Provider store={store}>
                    <RightContainer {...props} />
                </Provider>,
            )

            expect(screen.getByText('Store 1')).toBeInTheDocument()
        })
    })
})
