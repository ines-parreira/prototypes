import React from 'react'
import {screen} from '@testing-library/react'
import {Tags, TAGS_TITLE} from 'pages/stats/ticket-insights/components/Tags'
import {FiltersPanel} from 'pages/stats/common/filters/FiltersPanel'
import {assumeMock, renderWithStore} from 'utils/testing'
import {RootState} from 'state/types'
import {drillDownSlice, initialState} from 'state/ui/stats/drillDownSlice'
import {defaultStatsFilters} from 'state/stats/statsSlice'
import {fromLegacyStatsFilters} from 'state/stats/utils'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {TagsTrendChart} from 'pages/stats/ticket-insights/components/TagsTrendChart'
import {TopUsedTagsChart} from 'pages/stats/ticket-insights/components/TopUsedTagsChart'

jest.mock('pages/stats/common/filters/FiltersPanel')
jest.mock('pages/stats/ticket-insights/components/TagsTrendChart')
jest.mock('pages/stats/ticket-insights/components/TopUsedTagsChart')

const TopUsedTagsCharteMock = assumeMock(TopUsedTagsChart)
const filtersPanelMock = assumeMock(FiltersPanel)
const TagsTrendChartMock = assumeMock(TagsTrendChart)

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
        TagsTrendChartMock.mockImplementation(componentMock)
        TopUsedTagsCharteMock.mockImplementation(componentMock)
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

        expect(TopUsedTagsCharteMock).toHaveBeenCalled()
    })
})
