import React from 'react'

import {FiltersPanelComponent} from 'pages/stats/common/filters/FiltersPanel'
import {SavedFilterComponentMap} from 'pages/stats/common/filters/FiltersPanelConfig'
import {
    SAVABLE_FILTERS,
    SavedFiltersPanel,
} from 'pages/stats/common/filters/SavedFiltersPanel'
import * as statsSlice from 'state/stats/statsSlice'
import {RootState} from 'state/types'
import * as filtersSlice from 'state/ui/stats/filtersSlice'

import {assumeMock, renderWithStore} from 'utils/testing'

jest.mock('pages/stats/common/filters/FiltersPanel')
const FiltersPanelComponentMock = assumeMock(FiltersPanelComponent)

describe('SavedFiltersPanel', () => {
    const defaultState = {
        stats: statsSlice.initialState,
        ui: {
            stats: {
                filters: filtersSlice.initialState,
            },
        },
    } as RootState

    beforeEach(() => {
        FiltersPanelComponentMock.mockImplementation(() => <div />)
    })

    it('should render FiltersPanel with own config', () => {
        renderWithStore(<SavedFiltersPanel />, defaultState)

        expect(FiltersPanelComponentMock).toHaveBeenCalledWith(
            expect.objectContaining({
                optionalFilters: SAVABLE_FILTERS,
                filterComponentMap: SavedFilterComponentMap,
            }),
            {}
        )
    })
})
