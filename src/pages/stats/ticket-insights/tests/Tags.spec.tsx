import React from 'react'
import {screen} from '@testing-library/react'
import {Tags, NEW_TAGS_TITLE} from 'pages/stats/ticket-insights/components/Tags'
import {FiltersPanel} from 'pages/stats/common/filters/FiltersPanel'
import {assumeMock, renderWithStore} from 'utils/testing'
import {RootState} from 'state/types'
import {drillDownSlice, initialState} from 'state/ui/stats/drillDownSlice'
import {defaultStatsFilters} from 'state/stats/statsSlice'
import {fromLegacyStatsFilters} from 'state/stats/utils'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'

jest.mock('pages/stats/common/filters/FiltersPanel')

const filtersPanelMock = assumeMock(FiltersPanel)

describe('<Tags>', () => {
    const defaultState = {
        stats: {
            filters: fromLegacyStatsFilters(defaultStatsFilters),
        },
        ui: {
            stats: uiStatsInitialState,
            [drillDownSlice.name]: initialState,
        },
    } as RootState

    beforeEach(() => {
        filtersPanelMock.mockImplementation(() => <div>FilterPanel</div>)
    })

    it('should render new tags page', () => {
        renderWithStore(<Tags />, defaultState)

        expect(screen.getByText(NEW_TAGS_TITLE)).toBeInTheDocument()
    })

    it('should contain filters panel component', () => {
        renderWithStore(<Tags />, defaultState)

        expect(filtersPanelMock).toHaveBeenCalled()
    })
})
