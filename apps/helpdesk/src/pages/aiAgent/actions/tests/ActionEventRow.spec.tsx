import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { billingState } from 'fixtures/billing'
import { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import ActionEventRow from '../components/ActionEventRow'
import { LlmTriggeredExecution } from '../types'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const queryClient = mockQueryClient()

const defaultStore = mockStore({
    billing: fromJS(billingState),
})

describe('ActionEventRow', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks()
    })

    it('renders component', () => {
        const execution = {
            awaited_callbacks: [],
            channel_actions: [],
            configuration_id: '1',
            configuration_internal_id: '1',
            current_step_id: '1',
            id: '1',
            state: {
                channel: 'email',
                trigger: 'llm-prompt',
            },
            trigger: 'llm-prompt',
            triggerable: false,
            status: 'success',
        } as LlmTriggeredExecution
        const { rerender } = renderWithRouter(
            <Provider store={defaultStore}>
                <QueryClientProvider client={queryClient}>
                    <ActionEventRow
                        isSelected={false}
                        onClick={jest.fn()}
                        execution={execution}
                    />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/:shopType/:shopName/ai-agent/actions/events/:id',
                route: '/shopify/my-shop/ai-agent/actions/events/01J0KCFRTMPCESV2KYRG29GQ9H',
            },
        )

        expect(screen.queryByText('keyboard_arrow_right')).toBeInTheDocument()
        expect(screen.queryByText('SUCCESS')).toBeInTheDocument()
        expect(screen.queryByText('ERROR')).not.toBeInTheDocument()

        rerender(
            <Provider store={defaultStore}>
                <QueryClientProvider client={queryClient}>
                    <ActionEventRow
                        isSelected={false}
                        onClick={jest.fn()}
                        execution={{ ...execution, status: 'error' }}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.queryByText('SUCCESS')).not.toBeInTheDocument()
        expect(screen.queryByText('ERROR')).toBeInTheDocument()
    })

    it('handle click event and row selection', () => {
        const execution = {
            awaited_callbacks: [],
            channel_actions: [],
            configuration_id: '1',
            configuration_internal_id: '1',
            current_step_id: '1',
            id: '1',
            state: {
                channel: 'email',
                trigger: 'llm-prompt',
                user_journey_id: 'user_journey_id',
            },
            trigger: 'llm-prompt',
            triggerable: false,
        } as LlmTriggeredExecution
        const handleClick = jest.fn()
        const { rerender } = renderWithRouter(
            <Provider store={defaultStore}>
                <QueryClientProvider client={queryClient}>
                    <ActionEventRow
                        isSelected={false}
                        onClick={handleClick}
                        execution={execution}
                    />
                </QueryClientProvider>
            </Provider>,
        )
        expect(screen.getByRole('row')).not.toHaveClass('isSelected')

        rerender(
            <Provider store={defaultStore}>
                <QueryClientProvider client={queryClient}>
                    <ActionEventRow
                        isSelected={true}
                        onClick={handleClick}
                        execution={execution}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getByRole('row')).toHaveClass('isSelected')
        fireEvent.click(screen.getByText('keyboard_arrow_right'))
        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should open ticket in new tab when ticket button is clicked', () => {
        const execution = {
            awaited_callbacks: [],
            channel_actions: [],
            configuration_id: '1',
            configuration_internal_id: '1',
            current_step_id: '1',
            id: '1',
            state: {
                channel: 'email',
                trigger: 'llm-prompt',
                user_journey_id: 'ticket-123',
            },
            trigger: 'llm-prompt',
            triggerable: false,
        } as LlmTriggeredExecution

        renderWithRouter(
            <Provider store={defaultStore}>
                <QueryClientProvider client={queryClient}>
                    <ActionEventRow
                        isSelected={false}
                        onClick={jest.fn()}
                        execution={execution}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        // Click on the ticket button
        const ticketButton = screen.getByText('ticket-123')
        fireEvent.click(ticketButton)

        // Verify window.open was called with correct parameters
        expect(window.open).toHaveBeenCalledWith(
            '/app/ticket/ticket-123',
            '_blank',
        )
    })

    it('should prevent event propagation when ticket button is clicked', () => {
        const execution = {
            awaited_callbacks: [],
            channel_actions: [],
            configuration_id: '1',
            configuration_internal_id: '1',
            current_step_id: '1',
            id: '1',
            state: {
                channel: 'email',
                trigger: 'llm-prompt',
                user_journey_id: 'ticket-456',
            },
            trigger: 'llm-prompt',
            triggerable: false,
        } as LlmTriggeredExecution

        const handleRowClick = jest.fn()

        renderWithRouter(
            <Provider store={defaultStore}>
                <QueryClientProvider client={queryClient}>
                    <ActionEventRow
                        isSelected={false}
                        onClick={handleRowClick}
                        execution={execution}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        // Click on the ticket button
        const ticketButton = screen.getByText('ticket-456')
        fireEvent.click(ticketButton)

        // Verify the row onClick was not called due to stopPropagation
        expect(handleRowClick).not.toHaveBeenCalled()

        // But window.open should still be called
        expect(window.open).toHaveBeenCalledWith(
            '/app/ticket/ticket-456',
            '_blank',
        )
    })

    it('should not render ticket button when user_journey_id is not present', () => {
        const execution = {
            awaited_callbacks: [],
            channel_actions: [],
            configuration_id: '1',
            configuration_internal_id: '1',
            current_step_id: '1',
            id: '1',
            state: {
                channel: 'email',
                trigger: 'llm-prompt',
                // No user_journey_id
            },
            trigger: 'llm-prompt',
            triggerable: false,
        } as LlmTriggeredExecution

        renderWithRouter(
            <Provider store={defaultStore}>
                <QueryClientProvider client={queryClient}>
                    <ActionEventRow
                        isSelected={false}
                        onClick={jest.fn()}
                        execution={execution}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        // Verify no button is rendered when user_journey_id is not present
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
})
