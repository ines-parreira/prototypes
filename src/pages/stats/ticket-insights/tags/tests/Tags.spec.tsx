import React from 'react'
import {screen} from '@testing-library/react'
import {AllUsedTagsTableChart} from 'pages/stats/ticket-insights/tags/AllUsedTagsTableChart'
import {Tags, TAGS_TITLE} from 'pages/stats/ticket-insights/tags/Tags'
import {FiltersPanel} from 'pages/stats/common/filters/FiltersPanel'
import {assumeMock, renderWithStore} from 'utils/testing'
import {RootState} from 'state/types'
import {drillDownSlice, initialState} from 'state/ui/stats/drillDownSlice'
import {defaultStatsFilters} from 'state/stats/statsSlice'
import {fromLegacyStatsFilters} from 'state/stats/utils'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {TagsTrendChart} from 'pages/stats/ticket-insights/tags/TagsTrendChart'
import {TopUsedTagsChart} from 'pages/stats/ticket-insights/tags/TopUsedTagsChart'

jest.mock('pages/stats/common/filters/FiltersPanel')
const filtersPanelMock = assumeMock(FiltersPanel)
jest.mock('pages/stats/ticket-insights/tags/TagsTrendChart')
const TagsTrendChartMock = assumeMock(TagsTrendChart)
jest.mock('pages/stats/ticket-insights/tags/TopUsedTagsChart')
const TopUsedTagsChartMock = assumeMock(TopUsedTagsChart)
jest.mock('pages/stats/ticket-insights/tags/AllUsedTagsTableChart')
const allUsedTagsTableChartMock = assumeMock(AllUsedTagsTableChart)

const componentMock = () => <div />

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
        filtersPanelMock.mockImplementation(componentMock)
        allUsedTagsTableChartMock.mockImplementation(() => <div></div>)
        TagsTrendChartMock.mockImplementation(componentMock)
        TopUsedTagsChartMock.mockImplementation(componentMock)
    })

    it('should render new tags page', () => {
        renderWithStore(<Tags />, defaultState)

        expect(screen.getByText(TAGS_TITLE)).toBeInTheDocument()
    })

    it('should contain filters panel component', () => {
        renderWithStore(<Tags />, defaultState)

        expect(filtersPanelMock).toHaveBeenCalled()
    })

    it('should render the TopUsedTagsChart', () => {
        renderWithStore(<Tags />, defaultState)

        expect(TopUsedTagsChartMock).toHaveBeenCalled()
    })

    it('should contain AllUsedTagsTableChart component', () => {
        renderWithStore(<Tags />, defaultState)

        expect(allUsedTagsTableChartMock).toHaveBeenCalled()
    })
})
