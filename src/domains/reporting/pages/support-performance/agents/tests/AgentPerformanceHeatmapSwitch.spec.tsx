import React from 'react'

import { act, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { AgentPerformanceHeatmapSwitch } from 'domains/reporting/pages/support-performance/agents/AgentPerformanceHeatmapSwitch'
import {
    initialState as agentPerformanceInitialState,
    toggleHeatmapMode,
} from 'domains/reporting/state/ui/stats/agentPerformanceSlice'
import { AGENT_PERFORMANCE_SLICE_NAME } from 'domains/reporting/state/ui/stats/constants'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { RootState, StoreDispatch } from 'state/types'
import { userEvent } from 'utils/testing/userEvent'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<AgentPerformanceHeatmapSwitch />', () => {
    const defaultState = {
        ui: {
            stats: {
                filters: uiStatsInitialState,
                statsTables: {
                    [AGENT_PERFORMANCE_SLICE_NAME]:
                        agentPerformanceInitialState,
                },
            },
        },
    } as RootState

    it('should show current state of the switch', () => {
        const store = mockStore(defaultState)

        render(
            <Provider store={store}>
                <AgentPerformanceHeatmapSwitch />
            </Provider>,
        )

        expect(screen.getByRole('radio', { name: 'Table' })).toBeChecked()
    })

    it('should trigger toggle action on click', async () => {
        const store = mockStore(defaultState)

        render(
            <Provider store={store}>
                <AgentPerformanceHeatmapSwitch />
            </Provider>,
        )
        act(() => {
            userEvent.click(screen.getByRole('radio', { name: 'Heatmap' }))
        })

        await waitFor(() => {
            expect(store.getActions()).toContainEqual(toggleHeatmapMode())
        })
    })
})
