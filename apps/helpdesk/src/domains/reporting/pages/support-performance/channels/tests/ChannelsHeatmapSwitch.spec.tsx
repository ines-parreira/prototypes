import React from 'react'

import { userEvent } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'

import {
    HEATMAP_MODE_LABEL,
    TABLE_MODE_LABEL,
} from 'domains/reporting/pages/common/components/Table/TableHeatmapSwitch'
import { ChannelsHeatmapSwitch } from 'domains/reporting/pages/support-performance/channels/ChannelsHeatmapSwitch'
import {
    channelsSlice,
    initialState,
    toggleHeatmapMode,
} from 'domains/reporting/state/ui/stats/channelsSlice'
import type { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

describe('ChannelsHeatmapSwitch', () => {
    const defaultState = {
        ui: {
            stats: { [channelsSlice.name]: initialState },
        },
    } as RootState

    it('Should render Table mode', () => {
        renderWithStore(<ChannelsHeatmapSwitch />, defaultState)

        expect(initialState.heatmapMode).toEqual(false)
        expect(
            screen.getByRole('radio', { name: TABLE_MODE_LABEL }),
        ).toBeChecked()
    })

    it('Should render Heatmap mode', () => {
        const state = {
            ui: {
                stats: { [channelsSlice.name]: { heatmapMode: true } },
            },
        } as RootState

        renderWithStore(<ChannelsHeatmapSwitch />, state)

        expect(
            screen.getByRole('radio', { name: HEATMAP_MODE_LABEL }),
        ).toBeChecked()
    })

    it('Should trigger toggle on click', async () => {
        const { store } = renderWithStore(
            <ChannelsHeatmapSwitch />,
            defaultState,
        )

        act(() => {
            userEvent.click(screen.getByRole('radio', { name: 'Heatmap' }))
        })

        await waitFor(() => {
            expect(store.getActions()).toContainEqual(toggleHeatmapMode())
        })
    })
})
