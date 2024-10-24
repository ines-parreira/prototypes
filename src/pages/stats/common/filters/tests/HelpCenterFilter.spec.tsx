import {screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import {SegmentEvent, logEvent} from 'common/segment'
import {HelpCenter} from 'models/helpCenter/types'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {FilterKey} from 'models/stat/types'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {FILTER_DROPDOWN_ICON} from 'pages/stats/common/components/Filter/constants'
import {FilterLabels} from 'pages/stats/common/filters/constants'
import HelpCenterFilter, {
    HelpCenterFilterWithState,
} from 'pages/stats/common/filters/HelpCenterFilter'
import {initialState} from 'state/stats/statsSlice'
import {RootState} from 'state/types'
import {renderWithStore} from 'utils/testing'

const mockedHelpCenterData = getHelpCentersResponseFixture.data
const HELP_CENTER_FILTER_NAME = FilterLabels[FilterKey.HelpCenters]

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {StatFilterSelected: 'stat-filter-selected'},
}))

describe('HelpCenterFilter', () => {
    const mockStore = {
        entities: {
            helpCenter: {
                helpCenters: {
                    helpCentersById: mockedHelpCenterData.reduce(
                        (acc: Record<string, HelpCenter>, hCenter) => {
                            acc[hCenter.id] = hCenter
                            return acc
                        },
                        {}
                    ),
                },
            },
        },
    } as RootState

    it('should render HelpCenterFilter component', () => {
        renderWithStore(
            <HelpCenterFilter value={withDefaultLogicalOperator([])} />,
            mockStore
        )
        expect(screen.getByText(HELP_CENTER_FILTER_NAME)).toBeInTheDocument()
    })

    it('should render HelpCenterFilter component as usual with no value provided', () => {
        renderWithStore(<HelpCenterFilter value={undefined} />, mockStore)
        expect(screen.getByText(HELP_CENTER_FILTER_NAME)).toBeInTheDocument()
    })

    it('should render HelpCenterFilter component without selected help center', () => {
        renderWithStore(
            <HelpCenterFilter
                value={withDefaultLogicalOperator([mockedHelpCenterData[0].id])}
            />,
            mockStore
        )

        expect(screen.getByText(HELP_CENTER_FILTER_NAME)).toBeInTheDocument()
        expect(
            screen.getByText(mockedHelpCenterData[0].name)
        ).toBeInTheDocument()
    })

    it('should check if HelpCenterFilter component is calling dispatch mergeStatsFilters with correct params', () => {
        renderWithStore(
            <HelpCenterFilter
                value={withDefaultLogicalOperator([mockedHelpCenterData[0].id])}
            />,
            mockStore
        )

        userEvent.click(
            screen.getByText(getHelpCentersResponseFixture.data[0].name)
        )

        userEvent.click(
            screen.getByText(getHelpCentersResponseFixture.data[1].name)
        )

        expect(mockedDispatch).toHaveBeenCalledWith({
            payload: {
                helpCenters: withDefaultLogicalOperator([
                    getHelpCentersResponseFixture.data[1].id,
                ]),
            },
            type: 'stats/mergeStatsFiltersWithLogicalOperator',
        })
    })

    it('should render the HelpCenterFilterWithState and reflect the value coming from store', () => {
        const mockedStoreWithHelpCenterFilters = {
            ...mockStore,
            stats: {
                filters: {
                    ...initialState.filters,
                    helpCenters: withDefaultLogicalOperator([
                        getHelpCentersResponseFixture.data[0].id,
                    ]),
                },
            },
        }

        renderWithStore(
            <HelpCenterFilterWithState />,
            mockedStoreWithHelpCenterFilters
        )

        expect(
            screen.getByText(getHelpCentersResponseFixture.data[0].name)
        ).toBeInTheDocument()
    })

    it('should call segment analytics log event on filter dropdown close', () => {
        renderWithStore(
            <HelpCenterFilter
                value={withDefaultLogicalOperator([mockedHelpCenterData[0].id])}
            />,
            mockStore
        )

        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))
        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))

        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.StatFilterSelected, {
            name: FilterKey.HelpCenters,
            logical_operator: null,
        })
    })
})
