import {
    QueryClientProvider,
    QueryKey,
    UseQueryResult,
} from '@tanstack/react-query'
import { createEvent, fireEvent, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { CustomField } from '@gorgias/helpdesk-types'

import { FORM_CONTENT_TYPE } from 'config'
import { useCustomFieldDefinition } from 'custom-fields/hooks/queries/useCustomFieldDefinition'
import { customerInputFieldDefinition } from 'fixtures/customField'
import { integrationsState } from 'fixtures/integrations'
import { MacroActionName } from 'models/macroAction/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { TicketReplyActionContainer } from '../TicketReplyAction'

jest.mock('lodash/debounce', () => (fn: (...args: any[]) => void) => fn)

const queryClient = mockQueryClient()

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinition')
const useCustomFieldDefinitionMock = jest.mocked(useCustomFieldDefinition)

// Mock useTextWidth to avoid Canvas API issues in tests
jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useTextWidth: (text: string, options: any = {}) => {
        // Simple mock that returns a basic width calculation
        const baseWidth = text ? text.length * 8 : 0
        return baseWidth + (options.padding || 0)
    },
}))

describe('<TicketReplyAction />', () => {
    const mockStore = configureMockStore([thunk])
    const minProps = {
        action: fromJS({
            name: MacroActionName.AddInternalNote,
            arguments: {},
        }),
        index: 1,
        remove: jest.fn(),
        ticketId: 1,
        updateActionArgsOnApplied: jest.fn(),
        appNode: null,
    }

    it('should call updateActionArgsOnApplied when the internal note is updated', () => {
        const { container } = render(
            <Provider
                store={mockStore({ integrations: fromJS(integrationsState) })}
            >
                <TicketReplyActionContainer {...minProps} />
            </Provider>,
        )
        const editor = container.querySelector('.public-DraftEditor-content')!
        const event = createEvent.paste(editor, {
            clipboardData: {
                types: ['text/plain'],
                getData: () => 'hello',
            },
        })

        fireEvent(editor, event)
        fireEvent(editor, event)

        expect(minProps.updateActionArgsOnApplied).toHaveBeenCalledTimes(3)
    })

    it('should call updateActionArgsOnApplied when the dict argument is updated', () => {
        render(
            <Provider
                store={mockStore({ integrations: fromJS(integrationsState) })}
            >
                <TicketReplyActionContainer
                    {...minProps}
                    action={fromJS({
                        name: MacroActionName.Http,
                        arguments: {
                            content_type: FORM_CONTENT_TYPE,
                            form: [
                                {
                                    editable: true,
                                    key: 'foo',
                                    value: 'bar',
                                },
                            ],
                        },
                    })}
                />
            </Provider>,
        )

        fireEvent.change(screen.getByDisplayValue(/bar/), {
            target: { value: 'baz' },
        })

        expect(minProps.updateActionArgsOnApplied).toHaveBeenNthCalledWith(
            1,
            1,
            fromJS({
                content_type: FORM_CONTENT_TYPE,
                form: [
                    {
                        editable: true,
                        key: 'foo',
                        value: 'baz',
                    },
                ],
            }),
            1,
        )
    })

    it('should call updateActionArgsOnApplied when the argument is updated', () => {
        render(
            <Provider
                store={mockStore({ integrations: fromJS(integrationsState) })}
            >
                <TicketReplyActionContainer
                    {...minProps}
                    action={fromJS({
                        name: MacroActionName.ShopifyCancelLastOrder,
                        arguments: {
                            restock: true,
                            refund: true,
                        },
                    })}
                />
            </Provider>,
        )

        fireEvent.click(screen.queryAllByRole('checkbox')[0])

        expect(minProps.updateActionArgsOnApplied).toHaveBeenNthCalledWith(
            1,
            1,
            fromJS({
                restock: false,
                refund: true,
            }),
            1,
        )
    })

    it('should render priority-select when action has priority-select input type', () => {
        const priority = 'high'
        render(
            <Provider
                store={mockStore({ integrations: fromJS(integrationsState) })}
            >
                <TicketReplyActionContainer
                    {...minProps}
                    action={fromJS({
                        name: MacroActionName.SetPriority,
                        arguments: {
                            priority,
                        },
                    })}
                />
            </Provider>,
        )

        expect(screen.getByText(new RegExp(priority, 'i'))).toBeInTheDocument()
    })

    it('should render customer field components when action has customer_field-input type', () => {
        const value = 'plop'
        useCustomFieldDefinitionMock.mockReturnValue({
            data: customerInputFieldDefinition,
            isLoading: false,
        } as UseQueryResult<CustomField, unknown> & { queryKey: QueryKey })
        render(
            <Provider
                store={mockStore({ integrations: fromJS(integrationsState) })}
            >
                <QueryClientProvider client={queryClient}>
                    <TicketReplyActionContainer
                        {...minProps}
                        action={fromJS({
                            name: MacroActionName.SetCustomerCustomFieldValue,
                            arguments: {
                                custom_field_id: 123,
                                value,
                            },
                        })}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getByDisplayValue(value)).toBeInTheDocument()
    })

    it('should return null when customer_field-input has no custom_field_id', () => {
        render(
            <Provider
                store={mockStore({ integrations: fromJS(integrationsState) })}
            >
                <QueryClientProvider client={queryClient}>
                    <TicketReplyActionContainer
                        {...minProps}
                        action={fromJS({
                            name: MacroActionName.SetCustomerCustomFieldValue,
                            arguments: {
                                // No custom_field_id provided
                                value: 'some value',
                            },
                        })}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.queryByDisplayValue('some value')).not.toBeInTheDocument()
    })
})
