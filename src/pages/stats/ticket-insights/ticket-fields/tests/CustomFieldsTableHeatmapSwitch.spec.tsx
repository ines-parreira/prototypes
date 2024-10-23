import {act, render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {CustomFieldsTableHeatmapSwitch} from 'pages/stats/ticket-insights/ticket-fields/CustomFieldsTableHeatmapSwitch'
import {RootState, StoreDispatch} from 'state/types'
import {
    ticketInsightsSlice,
    initialState,
    toggleHeatmapMode,
} from 'state/ui/stats/ticketInsightsSlice'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<TicketInsightsHeatmapSwitch />', () => {
    const defaultState = {
        ui: {
            stats: {
                [ticketInsightsSlice.name]: initialState,
            },
        },
    } as RootState

    it('should show current state of the switch', () => {
        const store = mockStore(defaultState)

        render(
            <Provider store={store}>
                <CustomFieldsTableHeatmapSwitch />
            </Provider>
        )

        expect(screen.getByRole('radio', {name: 'Table'})).toBeChecked()
    })

    it('should trigger toggle action on click', async () => {
        const store = mockStore(defaultState)

        render(
            <Provider store={store}>
                <CustomFieldsTableHeatmapSwitch />
            </Provider>
        )
        act(() => {
            userEvent.click(screen.getByRole('radio', {name: 'Heatmap'}))
        })

        await waitFor(() => {
            expect(store.getActions()).toContainEqual(toggleHeatmapMode())
        })
    })
})
