import React from 'react'

import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { AutoQAAgentPerformanceHeatmapSwitch } from 'pages/stats/support-performance/auto-qa/AutoQAAgentPerformanceHeatmapSwitch'
import { RootState, StoreDispatch } from 'state/types'
import {
    initialState as autoQAInitialState,
    toggleHeatmapMode,
} from 'state/ui/stats/autoQAAgentPerformanceSlice'
import { AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME } from 'state/ui/stats/constants'
import { initialState as uiStatsInitialState } from 'state/ui/stats/filtersSlice'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<AutoQAAgentPerformanceHeatmapSwitch />', () => {
    const defaultState = {
        ui: {
            stats: {
                filters: uiStatsInitialState,
                statsTables: {
                    [AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME]: autoQAInitialState,
                },
            },
        },
    } as RootState

    it('should show current state of the switch', () => {
        const store = mockStore(defaultState)

        render(
            <Provider store={store}>
                <AutoQAAgentPerformanceHeatmapSwitch />
            </Provider>,
        )

        expect(screen.getByRole('radio', { name: 'Table' })).toBeChecked()
    })

    it('should trigger toggle action on click', async () => {
        const store = mockStore(defaultState)

        render(
            <Provider store={store}>
                <AutoQAAgentPerformanceHeatmapSwitch />
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
