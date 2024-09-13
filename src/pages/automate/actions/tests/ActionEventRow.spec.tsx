import React from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {screen} from '@testing-library/react'
import {QueryClientProvider} from '@tanstack/react-query'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import {RootState, StoreDispatch} from 'state/types'
import {billingState} from 'fixtures/billing'
import {renderWithRouter} from 'utils/testing'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import ActionEventRow from '../components/ActionEventRow'
import {LlmTriggeredExecution} from '../types'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const queryClient = mockQueryClient()

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
        } as LlmTriggeredExecution
        renderWithRouter(
            <Provider store={defaultStore}>
                <QueryClientProvider client={queryClient}>
                    <ActionEventRow execution={execution} />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/:shopType/:shopName/ai-agent/actions/events/:id',
                route: '/shopify/my-shop/ai-agent/actions/events/01J0KCFRTMPCESV2KYRG29GQ9H',
            }
        )

        expect(screen.getByText('keyboard_arrow_right')).toBeInTheDocument()
    })
})
