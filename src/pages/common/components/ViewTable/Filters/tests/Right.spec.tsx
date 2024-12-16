import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {Identifier} from 'estree'
import {fromJS} from 'immutable'
import React, {ComponentProps, ReactNode} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {DateTimeFormatMapper, DateTimeFormatType} from 'constants/datetime'
import CustomFieldByIdInput from 'custom-fields/components/CustomFieldByIdInput/CustomFieldByIdInput'
import {RightContainer} from 'pages/common/components/ViewTable/Filters/Right'
import {CHANNELS} from 'tickets/common/config'

jest.mock('moment-timezone', () => () => {
    const moment: (date: string) => Record<string, unknown> =
        jest.requireActual('moment-timezone')

    return moment('2019-09-03')
})

jest.mock(
    'pages/common/forms/DatePicker',
    () =>
        ({children}: {children: ReactNode}) => {
            return <>{children}</>
        }
)

jest.mock(
    'custom-fields/components/CustomFieldByIdInput/CustomFieldByIdInput',
    () =>
        ({
            value,
            onChange,
            dropdownAdditionalProps,
        }: ComponentProps<typeof CustomFieldByIdInput>) => {
            const {allowMultiValues, customDisplayValue} =
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
        }
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
        const {container} = render(
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
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render humanized label if ticket channel is selected', () => {
        const {container} = render(
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
            </Provider>
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
            const {getByText} = render(
                <Provider store={store}>
                    <RightContainer {...minProps} {...baseCustomFieldProps} />
                </Provider>
            )

            expect(getByText('Value: "foo"')).toBeInTheDocument()
        })

        it('should set rendered custom field values for Array expression on mount', () => {
            const {getByText} = render(
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
                </Provider>
            )

            expect(getByText('Value: ["foo","bar"]')).toBeInTheDocument()
        })

        it('should set displayed custom field value as undefined on update if node does not provide a value', () => {
            const {rerender, queryByText} = render(
                <Provider store={store}>
                    <RightContainer {...minProps} {...baseCustomFieldProps} />
                </Provider>
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
                </Provider>
            )

            expect(queryByText('Value: "foo"')).not.toBeInTheDocument()
        })

        it('should handle custom field value change', () => {
            const {getByText, container} = render(
                <Provider store={store}>
                    <RightContainer {...minProps} {...baseCustomFieldProps} />
                </Provider>
            )

            userEvent.click(container.firstChild as Element)

            expect(getByText('Value: "baz"')).toBeInTheDocument()
        })

        it('should handle custom field custom display value', () => {
            const {getByText} = render(
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
                </Provider>
            )

            expect(getByText('Custom: 2 fields selected')).toBeInTheDocument()
        })

        it('should return empty string for custom field custom display value if value is empty', () => {
            const {queryByText} = render(
                <Provider store={store}>
                    <RightContainer
                        {...minProps}
                        {...baseCustomFieldProps}
                        node={{
                            type: 'ArrayExpression',
                            elements: [],
                        }}
                    />
                </Provider>
            )

            expect(queryByText(/Custom:/)).not.toBeInTheDocument()
        })
    })

    it('should render plain danger button when no field is present, but a value is passed in node', () => {
        const {getByText} = render(
            <Provider store={store}>
                <RightContainer
                    {...minProps}
                    field={undefined}
                    node={{value: true, raw: 'true', type: 'Literal'}}
                />
            </Provider>
        )

        expect(getByText('true')).toHaveClass('btn-outline-danger')
    })

    it('should render nothing when no field is present and no value is passed in node', () => {
        const {container} = render(
            <Provider store={store}>
                <RightContainer
                    {...minProps}
                    field={undefined}
                    // @ts-ignore this is not likely to happen, but there is a safeguard in place
                    node={{}}
                />
            </Provider>
        )

        expect(container).toBeEmptyDOMElement()
    })
})
