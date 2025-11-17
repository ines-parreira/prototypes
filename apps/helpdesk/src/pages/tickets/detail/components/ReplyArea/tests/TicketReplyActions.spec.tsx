import type { ComponentProps } from 'react'
import React from 'react'

import type { QueryKey, UseQueryResult } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { CustomField } from '@gorgias/helpdesk-types'

import { ACTION_TEMPLATES } from '../../../../../../config'
import { useCustomFieldDefinition } from '../../../../../../custom-fields/hooks/queries/useCustomFieldDefinition'
import {
    customerInputFieldDefinition,
    ticketInputFieldDefinition,
} from '../../../../../../fixtures/customField'
import { integrationsState } from '../../../../../../fixtures/integrations'
import { MacroActionName } from '../../../../../../models/macroAction/types'
import type { RootState } from '../../../../../../state/types'
import { mockQueryClient } from '../../../../../../tests/reactQueryTestingUtils'
import TicketReplyActions from '../TicketReplyActions'

const mockStore = configureMockStore([thunk])
const queryClient = mockQueryClient()

jest.mock('draft-js/lib/generateRandomKey', () => () => '888')
jest.mock(
    '../../../../../../custom-fields/hooks/queries/useCustomFieldDefinition',
)
const useCustomFieldDefinitionMock = jest.mocked(useCustomFieldDefinition)

// Mock useTextWidth to avoid Canvas API issues in tests
jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useTextWidth: (text: string, options: any = {}) => {
        const baseWidth = text ? text.length * 8 : 0
        return baseWidth + (options.padding || 0)
    },
}))

describe('<TicketReplyActions/>', () => {
    const defaultState: Partial<RootState> = {
        integrations: fromJS(integrationsState),
    }

    const minProps: ComponentProps<typeof TicketReplyActions> = {
        ticketId: 1,
        appliedMacro: fromJS({
            actions: [
                ACTION_TEMPLATES.find(
                    (action) => action.name === MacroActionName.AddInternalNote,
                ),
            ],
        }),
        onDelete: jest.fn(),
    }

    const element = document.createElement('div')
    element.setAttribute('id', 'submit-button-div')
    document.body.appendChild(element)

    it('should render the ticket reply macro actions uncollapsed', () => {
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <TicketReplyActions {...minProps} />
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the ticket reply macro actions collapsed', () => {
        const props: ComponentProps<typeof TicketReplyActions> = {
            ticketId: 1,
            appliedMacro: fromJS({
                actions: ACTION_TEMPLATES.filter((action) => {
                    const actions = [
                        MacroActionName.ForwardByEmail,
                        MacroActionName.AddInternalNote,
                        MacroActionName.ShopifyCancelLastOrder,
                        MacroActionName.ShopifyDuplicateLastOrder,
                        MacroActionName.ShopifyPartialRefundLastOrder,
                        MacroActionName.ShopifyRefundShippingCostLastOrder,
                        MacroActionName.RechargeRefundLastCharge,
                        MacroActionName.RechargeRefundLastOrder,
                    ]
                    return actions.includes(action.name)
                }),
            }),
            onDelete: jest.fn(),
        }

        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <TicketReplyActions {...props} />
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should collapse the macro actions', async () => {
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <TicketReplyActions {...minProps} />
            </Provider>,
        )
        const header = screen.getByText('Actions performed')
        const collapsingElement = container.firstChild?.lastChild as HTMLElement

        fireEvent.click(header)
        await waitFor(() => {
            expect(collapsingElement.className).toBe('scrollable collapse')
        })
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call delete action function when the close icon is clicked', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <TicketReplyActions {...minProps} />
            </Provider>,
        )

        fireEvent.click(screen.getByText('close'))
        expect(minProps.onDelete).toHaveBeenCalled()
    })

    it('should render actions with SetCustomerCustomFieldValue and SetCustomFieldValue with custom_field_id', () => {
        const customFieldId1 = 123
        const customFieldId2 = 456
        const customerValue = 'customer field value'
        const ticketValue = 'ticket field value'

        // Mock the custom field definitions for both action types
        useCustomFieldDefinitionMock.mockImplementation((id: number) => {
            if (id === customFieldId1) {
                return {
                    data: {
                        ...customerInputFieldDefinition,
                        id: customFieldId1,
                    },
                    isLoading: false,
                } as UseQueryResult<CustomField, unknown> & {
                    queryKey: QueryKey
                }
            } else if (id === customFieldId2) {
                return {
                    data: {
                        ...ticketInputFieldDefinition,
                        id: customFieldId2,
                    },
                    isLoading: false,
                } as UseQueryResult<CustomField, unknown> & {
                    queryKey: QueryKey
                }
            }
            return {
                data: undefined,
                isLoading: true,
            } as UseQueryResult<CustomField, unknown> & { queryKey: QueryKey }
        })

        const props: ComponentProps<typeof TicketReplyActions> = {
            ticketId: 1,
            appliedMacro: fromJS({
                actions: [
                    {
                        name: MacroActionName.SetCustomerCustomFieldValue,
                        arguments: {
                            custom_field_id: customFieldId1,
                            value: customerValue,
                        },
                    },
                    {
                        name: MacroActionName.SetCustomFieldValue,
                        arguments: {
                            custom_field_id: customFieldId2,
                            value: ticketValue,
                        },
                    },
                ],
            }),
            onDelete: jest.fn(),
        }

        const { container } = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <TicketReplyActions {...props} />
                </Provider>
            </QueryClientProvider>,
        )

        // Verify that both actions are rendered
        const actionComponents = container.querySelectorAll('.component')
        expect(actionComponents).toHaveLength(2)

        // Verify that the badge shows the correct number of actions
        expect(screen.getByText('2')).toBeInTheDocument()

        // Verify that the customer custom field value is displayed (SetCustomerCustomFieldValue)
        expect(screen.getByDisplayValue(customerValue)).toBeInTheDocument()

        // Verify that the ticket custom field value is displayed (SetCustomFieldValue)
        expect(screen.getByDisplayValue(ticketValue)).toBeInTheDocument()

        // Verify that useCustomFieldDefinition was called with the correct IDs
        // This confirms that the component is using the custom_field_id from the arguments
        expect(useCustomFieldDefinitionMock).toHaveBeenCalledWith(
            customFieldId1,
        )
        expect(useCustomFieldDefinitionMock).toHaveBeenCalledWith(
            customFieldId2,
        )
    })
})
