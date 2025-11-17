import React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { userEvent } from '@repo/testing'
import { screen } from '@testing-library/react'

import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { FilterLabels } from 'domains/reporting/pages/common/filters/constants'
import HelpCenterFilter, {
    HelpCenterFilterWithState,
} from 'domains/reporting/pages/common/filters/HelpCenterFilter'
import * as statsSlice from 'domains/reporting/state/stats/statsSlice'
import * as filtersSlice from 'domains/reporting/state/ui/stats/filtersSlice'
import type { HelpCenter } from 'models/helpCenter/types'
import {
    FILTER_DROPDOWN_ICON,
    FILTER_VALUE_PLACEHOLDER,
} from 'pages/common/forms/FilterInput/constants'
import { getHelpCentersResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import type { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

const mockedHelpCenterData = getHelpCentersResponseFixture.data
const HELP_CENTER_FILTER_NAME = FilterLabels[FilterKey.HelpCenters]

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { StatFilterSelected: 'stat-filter-selected' },
}))

describe('HelpCenterFilter', () => {
    const defaultState = {
        stats: statsSlice.initialState,
        entities: {
            helpCenter: {
                helpCenters: {
                    helpCentersById: mockedHelpCenterData.reduce(
                        (acc: Record<string, HelpCenter>, hCenter) => {
                            acc[hCenter.id] = hCenter
                            return acc
                        },
                        {},
                    ),
                },
            },
        },
        ui: {
            stats: {
                filters: filtersSlice.initialState,
            },
        },
    } as RootState
    const dispatchUpdate = jest.fn()

    it('should render HelpCenterFilter component', () => {
        renderWithStore(
            <HelpCenterFilter
                value={withDefaultLogicalOperator([])}
                dispatchUpdate={dispatchUpdate}
            />,
            defaultState,
        )
        expect(screen.getByText(HELP_CENTER_FILTER_NAME)).toBeInTheDocument()
    })

    it('should render HelpCenterFilter component as usual with no value provided', () => {
        renderWithStore(
            <HelpCenterFilter
                value={undefined}
                dispatchUpdate={dispatchUpdate}
            />,
            defaultState,
        )
        expect(screen.getByText(HELP_CENTER_FILTER_NAME)).toBeInTheDocument()
    })

    it('should render HelpCenterFilter component without selected help center', () => {
        renderWithStore(
            <HelpCenterFilter
                value={withDefaultLogicalOperator([mockedHelpCenterData[0].id])}
                dispatchUpdate={dispatchUpdate}
            />,
            defaultState,
        )

        expect(screen.getByText(HELP_CENTER_FILTER_NAME)).toBeInTheDocument()
        expect(
            screen.getByText(mockedHelpCenterData[0].name),
        ).toBeInTheDocument()
    })

    it('should check if HelpCenterFilter component is calling dispatch mergeStatsFilters with correct params', () => {
        renderWithStore(
            <HelpCenterFilter
                value={withDefaultLogicalOperator([mockedHelpCenterData[0].id])}
                dispatchUpdate={dispatchUpdate}
            />,
            defaultState,
        )

        userEvent.click(
            screen.getByText(getHelpCentersResponseFixture.data[0].name),
        )

        userEvent.click(
            screen.getByText(getHelpCentersResponseFixture.data[1].name),
        )

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([
                getHelpCentersResponseFixture.data[1].id,
            ]),
        )
    })

    it('should render the HelpCenterFilterWithState and reflect the value coming from store', () => {
        const mockedStoreWithHelpCenterFilters = {
            ...defaultState,
            stats: {
                filters: {
                    ...statsSlice.initialState.filters,
                    helpCenters: withDefaultLogicalOperator([
                        getHelpCentersResponseFixture.data[0].id,
                    ]),
                },
            },
        }

        renderWithStore(
            <HelpCenterFilterWithState />,
            mockedStoreWithHelpCenterFilters,
        )

        expect(
            screen.getByText(getHelpCentersResponseFixture.data[0].name),
        ).toBeInTheDocument()
    })

    it('should call segment analytics log event on filter dropdown close', () => {
        renderWithStore(
            <HelpCenterFilter
                value={withDefaultLogicalOperator([mockedHelpCenterData[0].id])}
                dispatchUpdate={dispatchUpdate}
            />,
            defaultState,
        )

        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))
        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))

        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.StatFilterSelected, {
            name: FilterKey.HelpCenters,
            logical_operator: null,
        })
    })

    describe('HelpCenterFilterWithState', () => {
        it('should render HelpCenterFilterWithState component', () => {
            const spy = jest.spyOn(
                statsSlice,
                'mergeStatsFiltersWithLogicalOperator',
            )

            renderWithStore(<HelpCenterFilterWithState />, defaultState)
            userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
            userEvent.click(screen.getByText(mockedHelpCenterData[0].name))

            expect(
                screen.getByText(FilterLabels[FilterKey.HelpCenters]),
            ).toBeInTheDocument()
            expect(spy).toHaveBeenCalled()
        })
    })
})
