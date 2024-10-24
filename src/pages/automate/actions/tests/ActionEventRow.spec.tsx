import {QueryClientProvider} from '@tanstack/react-query'
import {fireEvent, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {billingState} from 'fixtures/billing'
import {RootState, StoreDispatch} from 'state/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {renderWithRouter} from 'utils/testing'

import ActionEventRow from '../components/ActionEventRow'
import {LlmTriggeredExecution} from '../types'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const queryClient = mockQueryClient()

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}))

const defaultStore = mockStore({
    billing: fromJS(billingState),
})

describe('ActionEventRow', () => {
    it('renders component', () => {
        const execution = {
            awaited_callbacks: [],
            channel_actions: [],
            configuration_id: '1',
            configuration_internal_id: '1',
            current_step_id: '1',
            id: '1',
            state: {
                trigger: 'llm-prompt',
            },
            trigger: 'llm-prompt',
            triggerable: false,
            success: true,
        } as LlmTriggeredExecution
        const {rerender} = renderWithRouter(
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
            }
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
                        execution={{...execution, success: false}}
                    />
                </QueryClientProvider>
            </Provider>
        )

        expect(screen.queryByText('SUCCESS')).not.toBeInTheDocument()
        expect(screen.queryByText('ERROR')).toBeInTheDocument()
    })

    it('handle click event', () => {
        const execution = {
            awaited_callbacks: [],
            channel_actions: [],
            configuration_id: '1',
            configuration_internal_id: '1',
            current_step_id: '1',
            id: '1',
            state: {
                trigger: 'llm-prompt',
                user_journey_id: 'user_journey_id',
            },
            trigger: 'llm-prompt',
            triggerable: false,
        } as LlmTriggeredExecution
        const handleClick = jest.fn()
        const {rerender} = renderWithRouter(
            <Provider store={defaultStore}>
                <QueryClientProvider client={queryClient}>
                    <ActionEventRow
                        isSelected={false}
                        onClick={handleClick}
                        execution={execution}
                    />
                </QueryClientProvider>
            </Provider>
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
                </QueryClientProvider>{' '}
            </Provider>
        )

        expect(screen.getByRole('row')).toHaveClass('isSelected')
        fireEvent.click(screen.getByText('keyboard_arrow_right'))
        expect(handleClick).toHaveBeenCalledTimes(1)

        fireEvent.click(screen.getByText('user_journey_id'))
        expect(mockHistoryPush).toHaveBeenCalledWith(
            '/app/ticket/user_journey_id'
        )
    })
})
