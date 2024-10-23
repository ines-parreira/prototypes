import {act, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {
    HEATMAP_MODE_LABEL,
    TABLE_MODE_LABEL,
} from 'pages/stats/common/components/Table/TableHeatmapSwitch'
import {ChannelsHeatmapSwitch} from 'pages/stats/support-performance/channels/ChannelsHeatmapSwitch'
import {RootState} from 'state/types'
import {
    channelsSlice,
    initialState,
    toggleHeatmapMode,
} from 'state/ui/stats/channelsSlice'
import {renderWithStore} from 'utils/testing'

describe('ChannelsHeatmapSwitch', () => {
    const defaultState = {
        ui: {
            stats: {[channelsSlice.name]: initialState},
        },
    } as RootState

    it('Should render Table mode', () => {
        renderWithStore(<ChannelsHeatmapSwitch />, defaultState)

        expect(initialState.heatmapMode).toEqual(false)
        expect(
            screen.getByRole('radio', {name: TABLE_MODE_LABEL})
        ).toBeChecked()
    })

    it('Should render Heatmap mode', () => {
        const state = {
            ui: {
                stats: {[channelsSlice.name]: {heatmapMode: true}},
            },
        } as RootState

        renderWithStore(<ChannelsHeatmapSwitch />, state)

        expect(
            screen.getByRole('radio', {name: HEATMAP_MODE_LABEL})
        ).toBeChecked()
    })

    it('Should trigger toggle on click', async () => {
        const {store} = renderWithStore(<ChannelsHeatmapSwitch />, defaultState)

        act(() => {
            userEvent.click(screen.getByRole('radio', {name: 'Heatmap'}))
        })

        await waitFor(() => {
            expect(store.getActions()).toContainEqual(toggleHeatmapMode())
        })
    })
})
