import { fireEvent, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { STATS_ROUTE_PREFIX } from 'domains/reporting/pages/common/components/constants'
import { AgentNameCellContent } from 'domains/reporting/pages/support-performance/agents/AgentNameCellContent'
import { mergeStatsFilters } from 'domains/reporting/state/stats/statsSlice'
import { agents } from 'fixtures/agents'
import { STATS_ROUTES } from 'routes/constants'
import type { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<AgentNameCellContent>', () => {
    const agent = agents[0]

    const defaultState = {
        agents: fromJS({
            all: agents,
        }),
    } as RootState

    it('should render agent name', () => {
        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <AgentNameCellContent agent={agent} />
            </Provider>,
        )

        expect(screen.getByText(agents[0].name)).toBeInTheDocument()
    })

    it('should dispatch agent id on click agent name', () => {
        const store = mockStore(defaultState)
        renderWithRouter(
            <Provider store={store}>
                <AgentNameCellContent agent={agent} />
            </Provider>,
        )

        fireEvent.click(screen.getByText(agents[0].name))

        expect(store.getActions()).toMatchObject(
            expect.arrayContaining([
                expect.objectContaining(
                    mergeStatsFilters({ agents: [agents[0].id] }),
                ),
            ]),
        )
    })

    it('should redirect to support performance overview by default', () => {
        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <AgentNameCellContent agent={agent} />
            </Provider>,
        )

        expect(screen.getByText(agents[0].name).closest('a')).toHaveAttribute(
            'href',
            `${STATS_ROUTE_PREFIX}${STATS_ROUTES.SUPPORT_PERFORMANCE_OVERVIEW}`,
        )
    })

    it('should redirect to custom route if provided', () => {
        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <AgentNameCellContent
                    agent={agent}
                    redirectTo={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.VOICE_OVERVIEW}`}
                />
            </Provider>,
        )

        expect(screen.getByText(agents[0].name).closest('a')).toHaveAttribute(
            'href',
            `${STATS_ROUTE_PREFIX}${STATS_ROUTES.VOICE_OVERVIEW}`,
        )
    })
})
