import userEvent from '@testing-library/user-event'
import React from 'react'
import {screen} from '@testing-library/react'
import {FilterLabels} from 'pages/stats/common/filters/constants'
import {ADD_FILTER_BUTTON_LABEL} from 'pages/stats/common/filters/AddFilterButton'
import {RootState} from 'state/types'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {FilterKey} from 'models/stat/types'
import {
    FiltersPanel,
    UNSUPPORTED_FILTER_PLACEHOLDER,
} from 'pages/stats/common/filters/FiltersPanel'
import {initialState, statsSlice} from 'state/stats/statsSlice'
import {renderWithStore} from 'utils/testing'

describe('FiltersPanel', () => {
    const defaultState = {
        [statsSlice.name]: initialState,
        ui: {
            stats: uiStatsInitialState,
        },
    } as RootState
    const persistentFilters = [FilterKey.Period]
    const optionalFilter = FilterKey.Channels
    const optionalFilters = [optionalFilter, FilterKey.LocaleCodes]
    const supportedFilters = [
        FilterKey.Period,
        FilterKey.Channels,
        FilterKey.Integrations,
    ]

    it('should render the panel without filters', () => {
        const {container} = renderWithStore(<FiltersPanel />, defaultState)

        expect(container.firstChild).toContainHTML(
            '<div class="wrapper"></div>'
        )
    })

    it.each(supportedFilters)(
        'should render all supported filters',
        (filter) => {
            renderWithStore(
                <FiltersPanel
                    persistentFilters={[filter]}
                    optionalFilters={[]}
                />,
                defaultState
            )

            expect(
                screen.getByText(new RegExp(FilterLabels[filter]))
            ).toBeInTheDocument()
        }
    )

    it('should render a placeholder for unsupported filter', () => {
        const unsupportedFilter = FilterKey.HelpCenters
        renderWithStore(
            <FiltersPanel
                persistentFilters={[unsupportedFilter]}
                optionalFilters={[]}
            />,
            defaultState
        )

        expect(
            screen.getByText(new RegExp(UNSUPPORTED_FILTER_PLACEHOLDER))
        ).toBeInTheDocument()
    })

    it('should render only persistentFilters by default', () => {
        renderWithStore(
            <FiltersPanel
                persistentFilters={persistentFilters}
                optionalFilters={optionalFilters}
            />,
            defaultState
        )

        persistentFilters.forEach((filter) => {
            expect(screen.getByText(FilterLabels[filter])).toBeInTheDocument()
        })

        optionalFilters.forEach((filter) => {
            expect(
                screen.queryByText(FilterLabels[filter])
            ).not.toBeInTheDocument()
        })
    })

    it('should allow adding optional Filters', () => {
        renderWithStore(
            <FiltersPanel
                persistentFilters={persistentFilters}
                optionalFilters={optionalFilters}
            />,
            defaultState
        )

        userEvent.click(
            screen.getByRole('button', {
                name: new RegExp(ADD_FILTER_BUTTON_LABEL),
            })
        )

        userEvent.click(
            screen.getByRole('option', {name: FilterLabels[optionalFilter]})
        )

        expect(
            screen.queryByText(new RegExp(FilterLabels[optionalFilter]))
        ).toBeInTheDocument()
    })

    it('should render selected optional Filters by default', () => {
        const state = {
            ...defaultState,
            [statsSlice.name]: {
                filters: {
                    ...initialState.filters,
                    [optionalFilter]: ['1', '2'],
                },
            },
        } as RootState

        renderWithStore(
            <FiltersPanel
                persistentFilters={persistentFilters}
                optionalFilters={optionalFilters}
            />,
            state
        )

        expect(
            screen.queryByText(new RegExp(FilterLabels[optionalFilter]))
        ).toBeInTheDocument()
    })
})
