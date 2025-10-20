import { ComponentProps } from 'react'

import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Expression } from 'estree'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { appQueryClient } from 'api/queryClient'
import { useFlag } from 'core/flags'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { automationSubscriptionProductPrices } from 'fixtures/account'
import { apiListCursorPaginationResponse } from 'fixtures/axiosResponse'
import { billingState } from 'fixtures/billing'
import {
    ticketDropdownFieldDefinition,
    ticketInputFieldDefinition,
} from 'fixtures/customField'
import { rule } from 'fixtures/rule'
import { IDENTIFIER_VARIABLES_BY_CATEGORY } from 'models/rule/constants'
import { IdentifierCategoryKey } from 'models/rule/types'
import { generateExpression } from 'models/rule/utils'
import { RootState } from 'state/types'

import { MemberExpression } from '../MemberExpression'

jest.mock('core/flags')
const mockUseFlag = jest.mocked(useFlag)

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions', () => ({
    useCustomFieldDefinitions: jest.fn(),
}))
const mockUseCustomFieldDefinitions = assumeMock(useCustomFieldDefinitions)

describe('<MemberExpression/>', () => {
    beforeEach(() => {
        mockUseFlag.mockReturnValue(false)
        mockUseCustomFieldDefinitions.mockReturnValue({
            data: apiListCursorPaginationResponse([
                ticketInputFieldDefinition,
                ticketDropdownFieldDefinition,
            ]),
            isLoading: false,
            isFetched: true,
        } as unknown as ReturnType<typeof useCustomFieldDefinitions>)
    })

    const minProps = {
        object: {
            loc: {
                start: {
                    line: 1,
                    column: 7,
                },
                end: {
                    line: 1,
                    column: 26,
                },
            },
            type: 'MemberExpression' as const,
            optional: false,
            computed: false,
            object: {
                loc: {
                    start: {
                        line: 1,
                        column: 7,
                    },
                    end: {
                        line: 1,
                        column: 21,
                    },
                },
                type: 'MemberExpression' as const,
                optional: false,
                computed: false,
                object: {
                    loc: {
                        start: {
                            line: 1,
                            column: 7,
                        },
                        end: {
                            line: 1,
                            column: 14,
                        },
                    },
                    type: 'Identifier' as const,
                    name: 'message',
                },
                property: {
                    loc: {
                        start: {
                            line: 1,
                            column: 15,
                        },
                        end: {
                            line: 1,
                            column: 21,
                        },
                    },
                    type: 'Identifier' as const,
                    name: 'source',
                },
            },
            property: {
                loc: {
                    start: {
                        line: 1,
                        column: 22,
                    },
                    end: {
                        line: 1,
                        column: 26,
                    },
                },
                type: 'Identifier' as const,
                name: 'from',
            },
        },
        property: {
            loc: {
                start: {
                    line: 1,
                    column: 27,
                },
                end: {
                    line: 1,
                    column: 34,
                },
            },
            type: 'Identifier' as const,
            name: 'address',
        },
        rule: fromJS(rule),
        actions: {
            modifyCodeAST: jest.fn(),
            getCondition: jest.fn(),
        },
        parent: fromJS(['body', 0, 'test', 'arguments', 0]),
    }

    const mockStore = configureMockStore([thunk])

    const renderComponent = (
        props?: Partial<ComponentProps<typeof MemberExpression>>,
        state?: Partial<RootState>,
    ) =>
        render(
            <Provider
                store={mockStore({
                    billing: fromJS(billingState),
                    currentAccount: fromJS({
                        current_subscription: {
                            products: automationSubscriptionProductPrices,
                        },
                    }),
                    ...state,
                })}
            >
                <QueryClientProvider client={appQueryClient}>
                    <MemberExpression {...minProps} {...props} />
                </QueryClientProvider>
            </Provider>,
        )

    it('should render', () => {
        renderComponent()

        expect(
            screen.getByText('message source from address'),
        ).toBeInTheDocument()
        expect(screen.getByText('Message')).toBeInTheDocument()
        expect(screen.getByText('Ticket')).toBeInTheDocument()
        expect(screen.getByText('Customer')).toBeInTheDocument()
        expect(screen.getByText('Self Service')).toBeInTheDocument()
    })

    it('should update the dropdown on clicking a category', () => {
        const { container } = renderComponent()
        const newValue = 'Customer'

        fireEvent.click(screen.getByText(newValue))
        expect(container.querySelector('.backOption')?.textContent).toContain(
            newValue,
        )
    })

    it('should update the rule on clicking a variable option', () => {
        renderComponent()

        fireEvent.click(screen.getByText('Customer'))
        fireEvent.click(screen.getByText('Email'))
        const actionCall = (
            minProps.actions.modifyCodeAST as jest.MockedFunction<
                typeof minProps.actions.modifyCodeAST
            >
        ).mock.calls[0]
        expect(actionCall).toHaveLength(5)
        expect(actionCall[0]).toEqualImmutable(minProps.parent)

        const value = IDENTIFIER_VARIABLES_BY_CATEGORY[
            IdentifierCategoryKey.Customer
        ]
            .find(({ label }) => label === 'Email')
            ?.value!.split('.')
            .reverse()
        const outputContent = (item: Map<any, any>, count: number) => {
            if (item.get('object')) {
                expect(item.getIn(['property', 'name'])).toBe(value![count])
                outputContent(item.get('object'), count + 1)
            } else {
                expect(item.get('name')).toBe(value![count])
            }
        }

        outputContent(actionCall[1] as Map<any, any>, 0)

        expect(actionCall[2]).toBe('UPDATE')
    })

    it('should exclude quick responses from the drop down', () => {
        renderComponent()

        expect(screen.queryByText('Quick Responses')).not.toBeInTheDocument()
        fireEvent.click(screen.getByText('Self Service'))
        expect(screen.queryByText('Quick Responses')).not.toBeInTheDocument()
    })

    it('should show the priority option', () => {
        mockUseFlag.mockReturnValue(true)
        renderComponent()

        fireEvent.click(screen.getByText('Ticket'))
        expect(screen.queryByText('Priority')).toBeInTheDocument()
    })

    it('should show custom fields option', () => {
        renderComponent()

        fireEvent.click(screen.getByText('Ticket'))
        expect(screen.queryByText('Ticket fields')).toBeInTheDocument()
    })

    it('should handle custom fields selection and show second dropdown', async () => {
        mockUseFlag.mockReturnValue(true)
        renderComponent()

        fireEvent.click(screen.getByText('Ticket'))
        fireEvent.click(screen.getByText('Ticket fields'))

        await waitFor(() => {
            expect(screen.getAllByText('Input field')).toHaveLength(2)
            expect(screen.getByText('Dropdown field')).toBeInTheDocument()
        })

        await waitFor(() => {
            // The handleSelect should have been called and modifyCodeAST should be triggered
            const actionCall = (
                minProps.actions.modifyCodeAST as jest.MockedFunction<
                    typeof minProps.actions.modifyCodeAST
                >
            ).mock.calls[0]
            expect(actionCall).toHaveLength(5)
            expect(actionCall[0]).toEqualImmutable(minProps.parent)
            expect(actionCall[2]).toBe('UPDATE')
        })
    })

    it('should handle custom field selection from second dropdown', async () => {
        mockUseFlag.mockReturnValue(true)
        renderComponent()

        fireEvent.click(screen.getByText('Ticket'))
        fireEvent.click(screen.getByText('Ticket fields'))

        await waitFor(() => {
            // Click on a different custom field to trigger handleSelectCustomField
            fireEvent.click(screen.getAllByText('Input field')[1])

            // Should have two calls: one from useEffect and one from handleSelectCustomField
            const actionCalls = (
                minProps.actions.modifyCodeAST as jest.MockedFunction<
                    typeof minProps.actions.modifyCodeAST
                >
            ).mock.calls
            expect(actionCalls).toHaveLength(2)
            expect(actionCalls[1][0]).toEqualImmutable(minProps.parent)
            expect(actionCalls[1][2]).toBe('UPDATE')
        })
    })

    it('should show loading state for custom fields', () => {
        mockUseFlag.mockReturnValue(true)
        mockUseCustomFieldDefinitions.mockReturnValue({
            data: apiListCursorPaginationResponse([]),
            isLoading: true,
            isFetched: false,
        } as unknown as ReturnType<typeof useCustomFieldDefinitions>)

        renderComponent()

        fireEvent.click(screen.getByText('Ticket'))
        fireEvent.click(screen.getByText('Ticket fields'))

        expect(screen.getByText('Loading custom fields...')).toBeInTheDocument()
    })

    it('should filter out deactivated custom fields', () => {
        mockUseFlag.mockReturnValue(true)
        const deactivatedField = {
            ...ticketInputFieldDefinition,
            id: 999,
            label: 'Deactivated Field',
            deactivated_datetime: '2023-01-01T00:00:00Z',
        }
        mockUseCustomFieldDefinitions.mockReturnValue({
            data: apiListCursorPaginationResponse([
                ticketInputFieldDefinition,
                deactivatedField,
            ]),
            isLoading: false,
            isFetched: true,
        } as unknown as ReturnType<typeof useCustomFieldDefinitions>)

        renderComponent()

        fireEvent.click(screen.getByText('Ticket'))
        fireEvent.click(screen.getByText('Ticket fields'))

        expect(screen.getAllByText('Input field')).toHaveLength(2)
        expect(screen.queryByText('Deactivated Field')).not.toBeInTheDocument()
    })

    it('should filter categories based on integration types', () => {
        renderComponent(
            {},
            {
                integrations: fromJS({
                    integrations: [
                        {
                            type: 'recharge',
                        },
                    ],
                }),
            },
        )

        expect(screen.queryByText('Shopify Last Order')).not.toBeInTheDocument()
        expect(screen.queryByText('Shopify Customer')).not.toBeInTheDocument()
        expect(
            screen.queryByText('Magento2 Last Order'),
        ).not.toBeInTheDocument()
        expect(screen.queryByText('Magento2 Customer')).not.toBeInTheDocument()
        expect(
            screen.queryByText('Recharge Last Subscription'),
        ).toBeInTheDocument()
        expect(screen.queryByText('Recharge Customer')).toBeInTheDocument()
        expect(screen.queryByText('Smile Customer')).not.toBeInTheDocument()
        expect(
            screen.queryByText('BigCommerce Last Order'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('BigCommerce Customer'),
        ).not.toBeInTheDocument()
        expect(screen.queryByText('Self Service')).toBeInTheDocument()
    })

    it('should render integration icons', () => {
        const { container } = renderComponent(
            {
                object: {
                    computed: false,
                    type: 'MemberExpression' as const,
                    optional: false,
                    property: {
                        name: 'last_order',
                        type: 'Identifier' as const,
                    },
                    object: {
                        computed: false,
                        type: 'MemberExpression' as const,
                        optional: false,
                        property: {
                            name: 'shopify',
                            type: 'Identifier' as const,
                        },
                        object: {
                            computed: false,
                            type: 'MemberExpression' as const,
                            optional: false,
                            property: {
                                name: 'integrations',
                                type: 'Identifier' as const,
                            },
                            object: {
                                computed: false,
                                type: 'MemberExpression' as const,
                                optional: false,
                                property: {
                                    name: 'customer',
                                    type: 'Identifier' as const,
                                },
                                object: {
                                    name: 'ticket',
                                    type: 'Identifier' as const,
                                },
                            },
                        },
                    },
                },
                property: {
                    type: 'Identifier' as const,
                    name: 'created_at',
                },
            },
            {
                integrations: fromJS({
                    integrations: [
                        {
                            type: 'shopify',
                        },
                    ],
                }),
            },
        )

        expect(container.querySelector('.logo')).toBeInTheDocument()
    })

    it('should handle subcategory with children', () => {
        renderComponent()

        fireEvent.click(screen.getByText('Message'))

        // Look for a subcategory that has children (like 'Receiver' which has subcategories)
        expect(screen.getByText('Receiver')).toBeInTheDocument()
    })

    it('should handle empty custom fields data', () => {
        mockUseFlag.mockReturnValue(true)
        mockUseCustomFieldDefinitions.mockReturnValue({
            data: apiListCursorPaginationResponse([]),
            isLoading: false,
            isFetched: true,
        } as unknown as ReturnType<typeof useCustomFieldDefinitions>)

        renderComponent()

        fireEvent.click(screen.getByText('Ticket'))
        fireEvent.click(screen.getByText('Ticket fields'))

        expect(screen.queryByText('Input field')).not.toBeInTheDocument()
        expect(screen.queryByText('Dropdown field')).not.toBeInTheDocument()
    })

    it('should handle custom fields with no active fields', () => {
        mockUseFlag.mockReturnValue(true)
        const allDeactivatedFields = [
            {
                ...ticketInputFieldDefinition,
                deactivated_datetime: '2023-01-01T00:00:00Z',
            },
            {
                ...ticketDropdownFieldDefinition,
                id: 999,
                deactivated_datetime: '2023-01-01T00:00:00Z',
            },
        ]
        mockUseCustomFieldDefinitions.mockReturnValue({
            data: apiListCursorPaginationResponse(allDeactivatedFields),
            isLoading: false,
            isFetched: true,
        } as unknown as ReturnType<typeof useCustomFieldDefinitions>)

        renderComponent()

        fireEvent.click(screen.getByText('Ticket'))
        fireEvent.click(screen.getByText('Ticket fields'))

        expect(screen.queryByText('Input field')).not.toBeInTheDocument()
        expect(screen.queryByText('Dropdown field')).not.toBeInTheDocument()
    })

    it('should call useCustomFieldDefinitions with correct query options when custom fields are selected', () => {
        mockUseFlag.mockReturnValue(true)
        renderComponent()

        fireEvent.click(screen.getByText('Ticket'))
        fireEvent.click(screen.getByText('Ticket fields'))

        expect(mockUseCustomFieldDefinitions).toHaveBeenCalledWith(
            {
                archived: false,
                object_type: 'Ticket',
            },
            {
                query: {
                    enabled: true,
                },
            },
        )
    })

    it('should call useCustomFieldDefinitions with enabled: false initially', () => {
        mockUseFlag.mockReturnValue(true)
        renderComponent()

        expect(mockUseCustomFieldDefinitions).toHaveBeenCalledWith(
            {
                archived: false,
                object_type: 'Ticket',
            },
            {
                query: {
                    enabled: false,
                },
            },
        )
    })

    it('should not trigger handleSelectCustomField when no active custom fields exist', async () => {
        mockUseFlag.mockReturnValue(true)
        mockUseCustomFieldDefinitions.mockReturnValue({
            data: apiListCursorPaginationResponse([]),
            isLoading: false,
            isFetched: true,
        } as unknown as ReturnType<typeof useCustomFieldDefinitions>)

        renderComponent()

        fireEvent.click(screen.getByText('Ticket'))
        fireEvent.click(screen.getByText('Ticket fields'))

        const actionCalls = (
            minProps.actions.modifyCodeAST as jest.MockedFunction<
                typeof minProps.actions.modifyCodeAST
            >
        ).mock.calls

        expect(actionCalls).toHaveLength(0)
    })

    it('should preselect the matching custom field from the AST path without updating the AST', async () => {
        mockUseFlag.mockReturnValue(true)
        const modifyCodeAST = jest.fn()
        const customFieldExpression = generateExpression([
            'value',
            ticketInputFieldDefinition.id.toString(),
            'custom_fields',
            'ticket',
        ])

        renderComponent({
            actions: {
                ...minProps.actions,
                modifyCodeAST,
            },
            object: customFieldExpression.object as Expression,
            property: customFieldExpression.property,
        })

        await waitFor(() => {
            expect(screen.getAllByText('Input field').length).toBeGreaterThan(0)
        })

        expect(modifyCodeAST).not.toHaveBeenCalled()
    })

    it('should select the first active custom field when the AST path lacks a custom field id', async () => {
        mockUseFlag.mockReturnValue(true)
        const modifyCodeAST = jest.fn()
        const customFieldExpression = generateExpression([
            'value',
            'custom_fields',
            'ticket',
        ])

        renderComponent({
            actions: {
                ...minProps.actions,
                modifyCodeAST,
            },
            object: customFieldExpression.object as Expression,
            property: customFieldExpression.property,
        })

        const actionCall = await waitFor(() => {
            expect(modifyCodeAST).toHaveBeenCalledTimes(1)
            return modifyCodeAST.mock.calls[0]
        })
        expect(actionCall[0]).toEqualImmutable(minProps.parent)
        expect(actionCall[2]).toBe('UPDATE')
        expect(actionCall[1]).toEqualImmutable(
            fromJS(
                generateExpression([
                    'value',
                    ticketInputFieldDefinition.id.toString(),
                    'custom_fields',
                    'ticket',
                ]),
            ),
        )
        expect(actionCall[4]).toBeDefined()
    })

    it('should select the first active custom field when the id in the AST path is not found', async () => {
        mockUseFlag.mockReturnValue(true)
        const modifyCodeAST = jest.fn()
        const customFieldExpression = generateExpression([
            'value',
            '999999',
            'custom_fields',
            'ticket',
        ])

        renderComponent({
            actions: {
                ...minProps.actions,
                modifyCodeAST,
            },
            object: customFieldExpression.object as Expression,
            property: customFieldExpression.property,
        })

        const actionCall = await waitFor(() => {
            expect(modifyCodeAST).toHaveBeenCalledTimes(1)
            return modifyCodeAST.mock.calls[0]
        })
        expect(actionCall[0]).toEqualImmutable(minProps.parent)
        expect(actionCall[2]).toBe('UPDATE')
        expect(actionCall[1]).toEqualImmutable(
            fromJS(
                generateExpression([
                    'value',
                    ticketInputFieldDefinition.id.toString(),
                    'custom_fields',
                    'ticket',
                ]),
            ),
        )
        expect(actionCall[4]).toBeDefined()
    })

    it('should call handleSelectCustomField when clicking on custom field option', async () => {
        mockUseFlag.mockReturnValue(true)
        renderComponent()

        fireEvent.click(screen.getByText('Ticket'))
        fireEvent.click(screen.getByText('Ticket fields'))
        fireEvent.click(screen.getByText('Dropdown field'))

        const actionCalls = (
            minProps.actions.modifyCodeAST as jest.MockedFunction<
                typeof minProps.actions.modifyCodeAST
            >
        ).mock.calls

        expect(actionCalls).toHaveLength(2)

        const handleSelectCustomFieldCall = actionCalls[1]
        expect(handleSelectCustomFieldCall[0]).toEqualImmutable(minProps.parent)
        expect(handleSelectCustomFieldCall[2]).toBe('UPDATE')
        expect(handleSelectCustomFieldCall[4]).toBeDefined()

        const expression = handleSelectCustomFieldCall[1]
        expect(expression).toEqualImmutable(
            fromJS({
                computed: false,
                object: {
                    computed: false,
                    object: {
                        computed: false,
                        object: {
                            name: 'ticket',
                            type: 'Identifier',
                        },
                        property: {
                            name: 'custom_fields',
                            type: 'Identifier',
                        },
                        type: 'MemberExpression',
                    },
                    property: {
                        name: ticketDropdownFieldDefinition.id.toString(),
                        type: 'Identifier',
                    },
                    type: 'MemberExpression',
                },
                property: {
                    name: 'value',
                    type: 'Identifier',
                },
                type: 'MemberExpression',
            }),
        )
    })

    it('should handle back navigation and reset selectedCategory to null', () => {
        renderComponent()

        fireEvent.click(screen.getByText('Customer'))
        expect(screen.queryByText('Message')).not.toBeInTheDocument()

        fireEvent.click(screen.getByText('Customer')) // This is the back button

        expect(screen.getByText('Message')).toBeInTheDocument()
        expect(screen.getByText('Ticket')).toBeInTheDocument()
        expect(screen.getByText('Customer')).toBeInTheDocument()
    })

    describe('Customer Custom Fields', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(true)
            mockUseCustomFieldDefinitions.mockReturnValue({
                data: apiListCursorPaginationResponse([
                    {
                        ...ticketInputFieldDefinition,
                        id: 101,
                        label: 'Customer Name',
                        definition: {
                            ...ticketInputFieldDefinition.definition,
                            object_type: 'Customer',
                        },
                    },
                    {
                        ...ticketDropdownFieldDefinition,
                        id: 102,
                        label: 'Customer Type',
                        definition: {
                            ...ticketDropdownFieldDefinition.definition,
                            object_type: 'Customer',
                        },
                    },
                ]),
                isLoading: false,
                isFetched: true,
            } as unknown as ReturnType<typeof useCustomFieldDefinitions>)
        })

        it('should show customer custom fields when Customer fields is selected', async () => {
            renderComponent()

            fireEvent.click(screen.getByText('Customer'))
            fireEvent.click(screen.getByText('Customer fields'))

            await waitFor(() => {
                // Check that both customer custom fields are available in the dropdown
                expect(screen.getAllByText('Customer Name')).toHaveLength(2) // Selected value + dropdown option
                expect(screen.getByText('Customer Type')).toBeInTheDocument()
            })
        })

        it('should auto-select first customer custom field when Customer fields is selected', async () => {
            const mockModifyCodeAST = jest.fn()
            renderComponent({
                actions: {
                    modifyCodeAST: mockModifyCodeAST,
                    getCondition: jest.fn(),
                },
            })

            fireEvent.click(screen.getByText('Customer'))
            fireEvent.click(screen.getByText('Customer fields'))

            await waitFor(() => {
                expect(mockModifyCodeAST).toHaveBeenCalledWith(
                    fromJS(['body', 0, 'test', 'arguments', 0]),
                    fromJS({
                        computed: false,
                        object: {
                            computed: false,
                            object: {
                                computed: false,
                                object: {
                                    computed: false,
                                    object: {
                                        name: 'ticket',
                                        type: 'Identifier',
                                    },
                                    property: {
                                        name: 'customer',
                                        type: 'Identifier',
                                    },
                                    type: 'MemberExpression',
                                },
                                property: {
                                    name: 'custom_fields',
                                    type: 'Identifier',
                                },
                                type: 'MemberExpression',
                            },
                            property: {
                                name: '101',
                                type: 'Identifier',
                            },
                            type: 'MemberExpression',
                        },
                        property: {
                            name: 'value',
                            type: 'Identifier',
                        },
                        type: 'MemberExpression',
                    }),
                    'UPDATE',
                    undefined,
                    'text',
                )
            })
        })

        it('should allow selecting different customer custom fields', async () => {
            const modifyCodeAST = jest.fn()
            renderComponent({
                actions: {
                    modifyCodeAST,
                    getCondition: jest.fn(),
                },
            })

            fireEvent.click(screen.getByText('Customer'))
            fireEvent.click(screen.getByText('Customer fields'))

            await waitFor(() => {
                // Customer Name should be auto-selected (appears in both selected value and dropdown)
                expect(screen.getAllByText('Customer Name')).toHaveLength(2)
                expect(modifyCodeAST).toHaveBeenCalled()
            })

            fireEvent.click(
                screen.getByRole('button', { name: 'Customer Name' }),
            )

            fireEvent.click(
                screen.getByRole('menuitem', { name: 'Customer Type' }),
            )

            await waitFor(() => {
                // After selection, Customer Type should be selected (appears in both selected value and dropdown)
                expect(screen.getAllByText('Customer Type')).toHaveLength(2)
            })

            const customerSelectionCall = modifyCodeAST.mock.calls.at(-1)!

            expect(customerSelectionCall[0]).toEqualImmutable(minProps.parent)
            expect(customerSelectionCall[2]).toBe('UPDATE')
            expect(customerSelectionCall[1]).toEqualImmutable(
                fromJS(
                    generateExpression([
                        'value',
                        '102',
                        'custom_fields',
                        'customer',
                        'ticket',
                    ]),
                ),
            )
            expect(customerSelectionCall[4]).toBeDefined()
        })
    })
})
