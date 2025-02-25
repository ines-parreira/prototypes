import React from 'react'

import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { HEATMAP_MODE_LABEL } from 'pages/stats/common/components/Table/TableHeatmapSwitch'
import { PERCENTAGE_LABEL } from 'pages/stats/common/components/Table/TableValueModeSwitch'
import { AllUsedTagsTable } from 'pages/stats/ticket-insights/tags/AllUsedTagsTable'
import { AllUsedTagsTableChart } from 'pages/stats/ticket-insights/tags/AllUsedTagsTableChart'
import { RootState } from 'state/types'
import {
    initialState,
    tagsReportSlice,
    toggleHeatmapMode,
    toggleValueMode,
} from 'state/ui/stats/tagsReportSlice'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock('pages/stats/ticket-insights/tags/AllUsedTagsTable')
const AllUsedTagsTableMock = assumeMock(AllUsedTagsTable)

describe('<AllUsedTagsTableChart />', () => {
    const defaultState = {
        ui: {
            stats: { [tagsReportSlice.name]: initialState },
        },
    } as RootState

    beforeEach(() => {
        AllUsedTagsTableMock.mockImplementation(() => <div />)
    })

    it('should render Chart Card with AllUserTagsTable', () => {
        renderWithStore(<AllUsedTagsTableChart />, defaultState)
    })

    it('should allow switching to heatmap mode', () => {
        const { store } = renderWithStore(
            <AllUsedTagsTableChart />,
            defaultState,
        )

        const heatmapButton = screen.getByText(HEATMAP_MODE_LABEL)
        userEvent.click(heatmapButton)

        expect(store.getActions()).toContainEqual(toggleHeatmapMode())
    })

    it('should allow switching to percentage mode', () => {
        const { store } = renderWithStore(
            <AllUsedTagsTableChart />,
            defaultState,
        )

        userEvent.click(screen.getByText(PERCENTAGE_LABEL))

        expect(store.getActions()).toContainEqual(toggleValueMode())
    })
})
