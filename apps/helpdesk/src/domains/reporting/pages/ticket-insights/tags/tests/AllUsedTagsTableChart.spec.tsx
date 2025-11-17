import React from 'react'

import { assumeMock, userEvent } from '@repo/testing'
import { screen } from '@testing-library/react'

import { HEATMAP_MODE_LABEL } from 'domains/reporting/pages/common/components/Table/TableHeatmapSwitch'
import { PERCENTAGE_LABEL } from 'domains/reporting/pages/common/components/Table/TableValueModeSwitch'
import { AllUsedTagsTable } from 'domains/reporting/pages/ticket-insights/tags/AllUsedTagsTable'
import { AllUsedTagsTableChart } from 'domains/reporting/pages/ticket-insights/tags/AllUsedTagsTableChart'
import {
    initialState,
    tagsReportSlice,
    toggleHeatmapMode,
    toggleValueMode,
} from 'domains/reporting/state/ui/stats/tagsReportSlice'
import type { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

jest.mock('domains/reporting/pages/ticket-insights/tags/AllUsedTagsTable')
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
