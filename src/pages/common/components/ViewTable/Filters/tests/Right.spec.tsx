import React, { ComponentProps, ReactNode } from 'react'

import { render } from '@testing-library/react'
import { Expression, Identifier } from 'estree'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { DateTimeFormatMapper, DateTimeFormatType } from 'constants/datetime'
import CustomFieldByIdInput from 'custom-fields/components/CustomFieldByIdInput/CustomFieldByIdInput'
import { RightContainer } from 'pages/common/components/ViewTable/Filters/Right'
import { CHANNELS } from 'tickets/common/config'
import { userEvent } from 'utils/testing/userEvent'

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

jest.mock('pages/common/forms/MultiSelectField', () => () => {
    return <div data-testid="multi-select-field">MultiSelectField</div>
})

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
            const { getByText } = render(
                <Provider store={store}>
                    <RightContainer {...minProps} {...baseCustomFieldProps} />
                </Provider>,
            )

            expect(getByText('Value: "foo"')).toBeInTheDocument()
        })

        it('should set rendered custom field values for Array expression on mount', () => {
            const { getByText } = render(
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

            expect(getByText('Value: ["foo","bar"]')).toBeInTheDocument()
        })

        it('should set displayed custom field value as undefined on update if node does not provide a value', () => {
            const { rerender, queryByText } = render(
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

            expect(queryByText('Value: "foo"')).not.toBeInTheDocument()
        })

        it('should handle custom field value change', () => {
            const { getByText, container } = render(
                <Provider store={store}>
                    <RightContainer {...minProps} {...baseCustomFieldProps} />
                </Provider>,
            )

            userEvent.click(container.firstChild as Element)

            expect(getByText('Value: "baz"')).toBeInTheDocument()
        })

        it('should handle custom field custom display value', () => {
            const { getByText } = render(
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

            expect(getByText('Custom: 2 fields selected')).toBeInTheDocument()
        })

        it('should return empty string for custom field custom display value if value is empty', () => {
            const { queryByText } = render(
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

            expect(queryByText(/Custom:/)).not.toBeInTheDocument()
        })
    })

    it('should render plain danger button when no field is present, but a value is passed in node', () => {
        const { getByText } = render(
            <Provider store={store}>
                <RightContainer
                    {...minProps}
                    field={undefined}
                    node={{ value: true, raw: 'true', type: 'Literal' }}
                />
            </Provider>,
        )

        expect(getByText('true')).toHaveClass('btn-outline-danger')
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

        const { getByText } = render(
            <Provider store={store}>
                <RightContainer {...props} />
            </Provider>,
        )

        expect(getByText('Me (current user)')).toBeInTheDocument()
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

        const { getByText } = render(
            <Provider store={store}>
                <RightContainer {...customProps} />
            </Provider>,
        )

        expect(getByText('Test Integration')).toBeInTheDocument()
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

        const { getByTestId } = render(
            <Provider store={store}>
                <RightContainer {...customProps} />
            </Provider>,
        )

        expect(getByTestId('multi-select-field')).toBeInTheDocument()
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

        const { getByText } = render(
            <Provider store={store}>
                <RightContainer {...props} />
            </Provider>,
        )

        expect(getByText('Support Team')).toBeInTheDocument()
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

        const { getByText } = render(
            <Provider store={store}>
                <RightContainer {...props} />
            </Provider>,
        )

        expect(getByText('Agent Smith')).toBeInTheDocument()
    })

    it('should render customer label', () => {
        const customerField = fromJS({ name: 'customer', title: 'Customer' })
        const node = { raw: "'99'", type: 'Literal', value: '99' } as Expression
        const props = { ...minProps, field: customerField, node }

        const { getByText } = render(
            <Provider store={store}>
                <RightContainer {...props} />
            </Provider>,
        )

        expect(getByText('Customer #99')).toBeInTheDocument()
    })

    it('should render language display name', () => {
        const languageField = fromJS({ name: 'language', title: 'Language' })
        const node = { raw: "'en'", type: 'Literal', value: 'en' } as Expression
        const props = { ...minProps, field: languageField, node }

        const { getByText } = render(
            <Provider store={store}>
                <RightContainer {...props} />
            </Provider>,
        )

        expect(getByText('English')).toBeInTheDocument()
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

        const { getByTestId } = render(
            <Provider store={store}>
                <RightContainer {...props} />
            </Provider>,
        )

        expect(getByTestId('timedelta-picker')).toBeInTheDocument()
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

        const { getByTestId } = render(
            <Provider store={store}>
                <RightContainer {...props} />
            </Provider>,
        )

        expect(getByTestId('filter-multi-select-field')).toBeInTheDocument()
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

        const { getByTestId } = render(
            <Provider store={store}>
                <RightContainer {...props} />
            </Provider>,
        )

        expect(getByTestId('multi-select-field')).toBeInTheDocument()
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

        const { getByTestId } = render(
            <Provider store={store}>
                <RightContainer {...props} />
            </Provider>,
        )

        expect(getByTestId('multi-select-field')).toBeInTheDocument()
    })

    it('should render default clickable dropdown and toggle FilterDropdown', () => {
        const otherField = fromJS({ name: 'other_field', title: 'Other Field' })
        const node = {
            raw: "'default'",
            type: 'Literal',
            value: 'default',
        } as Expression
        const props = { ...minProps, field: otherField, node }

        const { getByText, queryByTestId, getByTestId } = render(
            <Provider store={store}>
                <RightContainer {...props} />
            </Provider>,
        )

        // The default branch renders a button with the node value.
        const button = getByText('default')
        expect(button).toBeInTheDocument()
        // Initially, the dropdown is not rendered.
        expect(queryByTestId('filter-dropdown')).not.toBeInTheDocument()
        // Click to toggle dropdown
        userEvent.click(button)
        expect(getByTestId('filter-dropdown')).toBeInTheDocument()
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
})
