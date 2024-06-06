import {act, render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {
    PERCENTAGE_LABEL,
    TicketInsightsValueModeSwitch,
    TOTAL_COUNT_LABEL,
} from 'pages/stats/TicketInsightsValueModeSwitch'
import {initialState} from 'state/stats/statsSlice'
import {RootState, StoreDispatch} from 'state/types'
import {
    ticketInsightsSlice,
    toggleValueMode,
    ValueMode,
} from 'state/ui/stats/ticketInsightsSlice'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<TicketInsightsValueModeSwitch />', () => {
    it('should render TotalCount mode as active when selected', () => {
        const state = {
            stats: initialState,
            ui: {
                [ticketInsightsSlice.name]: {
                    ...initialState,
                    valueMode: ValueMode.TotalCount,
                },
            },
        } as unknown as RootState

        render(
            <Provider store={mockStore(state)}>
                <TicketInsightsValueModeSwitch />
            </Provider>
        )

        expect(
            screen.getByRole('radio', {name: TOTAL_COUNT_LABEL})
        ).toBeChecked()
    })

    it('should render Percentage mode as active when selected', () => {
        const state = {
            stats: initialState,
            ui: {
                [ticketInsightsSlice.name]: {
                    ...initialState,
                    valueMode: ValueMode.Percentage,
                },
            },
        } as unknown as RootState

        render(
            <Provider store={mockStore(state)}>
                <TicketInsightsValueModeSwitch />
            </Provider>
        )

        expect(
            screen.getByRole('radio', {name: PERCENTAGE_LABEL})
        ).toBeChecked()
    })

    it('should dispatch mode toggle action on click', async () => {
        const state = {
            stats: initialState,
            ui: {
                [ticketInsightsSlice.name]: {
                    ...initialState,
                    valueMode: ValueMode.TotalCount,
                },
            },
        } as unknown as RootState
        const store = mockStore(state)

        render(
            <Provider store={store}>
                <TicketInsightsValueModeSwitch />
            </Provider>
        )

        act(() => {
            const radioButton = screen.getByRole('radio', {
                name: PERCENTAGE_LABEL,
            })
            userEvent.click(radioButton)
        })

        await waitFor(() => {
            expect(store.getActions()).toContainEqual(toggleValueMode())
        })
    })
})
