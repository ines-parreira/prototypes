import React from 'react'

import { UseQueryResult } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { logEvent, SegmentEvent } from 'common/segment'
import { useArticleViewTimeSeries } from 'hooks/reporting/help-center/useArticleViewTimeSeries'
import { TimeSeriesDataItem } from 'hooks/reporting/useTimeSeries'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { useHasAccessToAILibrary } from 'pages/settings/helpCenter/components/AIArticlesLibraryView/hooks/useHasAccessToAILibrary'
import { useHelpCenterAIArticlesLibrary } from 'pages/settings/helpCenter/components/AIArticlesLibraryView/hooks/useHelpCenterAIArticlesLibrary'
import { getHelpCentersResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { useHelpCenterList } from 'pages/settings/helpCenter/hooks/useHelpCenterList'
import { FiltersPanelWrapper } from 'pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import { ChartsActionMenu } from 'pages/stats/dashboards/ChartsActionMenu/ChartsActionMenu'
import AIBanner from 'pages/stats/help-center/components/AIBanner'
import HelpCenterStats from 'pages/stats/help-center/pages/HelpCenterStats'
import { HELP_CENTER_STATS_TEST_IDS } from 'pages/stats/help-center/pages/tests/constants'
import { useReportChartRestrictions } from 'pages/stats/report-chart-restrictions/useReportChartRestrictions'
import {
    initialState,
    mergeStatsFiltersWithLogicalOperator,
} from 'state/stats/statsSlice'
import { RootState } from 'state/types'
import configureStore from 'store/configureStore.prod'
import { InitialRootState } from 'types'
import { getSortByName } from 'utils/getSortByName'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock('pages/stats/report-chart-restrictions/useReportChartRestrictions')
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

jest.mock(
    'pages/stats/common/components/charts/LineChart/LineChart',
    () => () => <div>line-chart</div>,
)
jest.mock('pages/stats/help-center/hooks/useArticleViewsTrend', () => ({
    useArticleViewsTrend: () => ({ data: { value: 1 }, isFetching: false }),
}))
jest.mock('pages/stats/help-center/hooks/useSearchRequestedTrend', () => ({
    useSearchRequestedTrend: () => ({ data: { value: 1 }, isFetching: false }),
}))
jest.mock('hooks/reporting/help-center/useArticleViewTimeSeries')
const mockUseArticleViewTimeSeries = assumeMock(useArticleViewTimeSeries)
jest.mock('pages/stats/help-center/hooks/useSearchTermsMetrics', () => ({
    useSearchTermsMetrics: () => ({ data: [], isFetching: false }),
}))
jest.mock(
    'pages/stats/help-center/hooks/usePerformanceByArticleMetrics',
    () => ({
        usePerformanceByArticleMetrics: () => ({ data: [], isFetching: false }),
    }),
)
jest.mock('pages/stats/help-center/hooks/useNoSearchResultsMetrics', () => ({
    useNoSearchResultsMetrics: () => ({ data: [], isFetching: false }),
}))
jest.mock('pages/settings/helpCenter/hooks/useHelpCenterList')
const mockUseHelpCenterList = assumeMock(useHelpCenterList)
jest.mock('pages/stats/help-center/hooks/useSearchResultRange', () => ({
    useSearchResultRange: () => ({ data: [], isLoading: true }),
}))
jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))
jest.mock('pages/settings/helpCenter/providers/SupportedLocales', () => ({
    useSupportedLocales: jest.fn(() => [
        { code: 'en-US', name: 'English' },
        { code: 'fr-FR', name: 'French' },
    ]),
}))
jest.mock(
    'pages/settings/helpCenter/components/AIArticlesLibraryView/hooks/useHelpCenterAIArticlesLibrary',
)
const useHelpCenterAIArticlesLibraryMock = assumeMock(
    useHelpCenterAIArticlesLibrary,
)
jest.mock('pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper')
const FiltersPanelMock = assumeMock(FiltersPanelWrapper)
jest.mock('pages/stats/help-center/components/AIBanner')
const AIBannerMock = assumeMock(AIBanner)
jest.mock(
    'pages/settings/helpCenter/components/AIArticlesLibraryView/hooks/useHasAccessToAILibrary',
)
const useHasAccessToAILibraryMock = assumeMock(useHasAccessToAILibrary)
jest.mock('pages/stats/dashboards/ChartsActionMenu/ChartsActionMenu')
const ChartsActionMenuMock = assumeMock(ChartsActionMenu)
jest.mock('common/segment')
const mockedLogEvent = assumeMock(logEvent)

describe('<HelpCenterStats />', () => {
    const helpCenters = getHelpCentersResponseFixture.data

    const renderComponent = () => {
        const store = configureStore({} as InitialRootState)
        render(
            <Provider store={store}>
                <HelpCenterStats />
            </Provider>,
        )
    }
    const componentMock = () => <div />

    beforeEach(() => {
        useReportChartRestrictionsMock.mockReturnValue({
            isChartRestrictedToCurrentUser: () => false,
        } as any)

        const mockedDate = new Date(1999, 10, 1)

        jest.useFakeTimers()
        jest.setSystemTime(mockedDate)

        mockUseHelpCenterList.mockReturnValue({
            isLoading: false,
            helpCenters,
            hasMore: false,
            fetchMore: jest.fn(),
        })
        mockUseArticleViewTimeSeries.mockReturnValue({
            data: [],
            isLoading: false,
        } as unknown as UseQueryResult<TimeSeriesDataItem[][]>)
        useHelpCenterAIArticlesLibraryMock.mockReturnValue({
            hasNewArticles: false,
        } as any)
        FiltersPanelMock.mockImplementation(componentMock)
        AIBannerMock.mockImplementation(componentMock)
        ChartsActionMenuMock.mockImplementation(componentMock)
    })

    it('should render page with title and sections', () => {
        renderComponent()

        expect(mockedLogEvent.mock.calls[0][0]).toEqual(
            SegmentEvent.HelpCenterStatisticsPageViewed,
        )
        expect(mockedLogEvent).toHaveBeenCalledTimes(1)
        expect(screen.getByText('Help Center')).toBeInTheDocument()
        expect(screen.getByText('Overview')).toBeInTheDocument()
        expect(screen.getByText('Performance')).toBeInTheDocument()
        expect(screen.getByText('Help Center searches')).toBeInTheDocument()
        expect(
            screen.getByText('Analytics are using UTC timezone'),
        ).toBeInTheDocument()
    })

    it('should show loading state', () => {
        mockUseHelpCenterList.mockReturnValue({
            isLoading: true,
            helpCenters: getHelpCentersResponseFixture.data,
            hasMore: false,
            fetchMore: jest.fn(),
        })

        renderComponent()

        expect(
            screen.getByTestId(HELP_CENTER_STATS_TEST_IDS.LOADER),
        ).toBeInTheDocument()
    })

    it('should show empty state when help center deactivated', () => {
        mockUseHelpCenterList.mockReturnValue({
            isLoading: false,
            helpCenters: [
                {
                    ...getHelpCentersResponseFixture.data[0],
                    deactivated_datetime: '2021-01-01T00:00:00Z',
                },
            ],
            hasMore: false,
            fetchMore: jest.fn(),
        })

        renderComponent()

        expect(
            screen.getByTestId(HELP_CENTER_STATS_TEST_IDS.EMPTY_STATE),
        ).toBeInTheDocument()
    })

    it('should show empty state when help center list is empty', () => {
        mockUseHelpCenterList.mockReturnValue({
            isLoading: false,
            helpCenters: [],
            hasMore: false,
            fetchMore: jest.fn(),
        })

        renderComponent()

        expect(
            screen.getByTestId(HELP_CENTER_STATS_TEST_IDS.EMPTY_STATE),
        ).toBeInTheDocument()
    })

    it('should show alert when selected help center unpublished', () => {
        const unpublishedHelpCenter = {
            ...getHelpCentersResponseFixture.data[0],
            deactivated_datetime: '2021-01-01T00:00:00.000Z',
        }
        mockUseHelpCenterList.mockReturnValue({
            isLoading: false,
            helpCenters: [
                unpublishedHelpCenter,
                getHelpCentersResponseFixture.data[0],
            ],
            hasMore: false,
            fetchMore: jest.fn(),
        })

        renderComponent()

        expect(
            screen.getByText(
                'Set your Help Center back to live in order to view performance insights.',
            ),
        ).toBeInTheDocument()
    })

    it('should set initial help center filter with first help center from the list', async () => {
        const helpCenterFixture = getHelpCentersResponseFixture.data[0]
        const helpCenters = [
            { ...helpCenterFixture, name: 'B', id: 3 },
            { ...helpCenterFixture, name: 'A', id: 1 },
            { ...helpCenterFixture, name: 'C', id: 2 },
            { ...helpCenterFixture, name: 'D', id: 4 },
        ]
        const state = {
            stats: {
                filters: {
                    ...initialState.filters,
                    helpCenters: withDefaultLogicalOperator<number>([]),
                    localeCodes: withDefaultLogicalOperator<string>([]),
                },
            },
            ui: {
                stats: {
                    filters: {
                        cleanStatsFilters: {
                            ...initialState.filters,
                            helpCenters: withDefaultLogicalOperator<number>([]),
                            localeCodes: withDefaultLogicalOperator<string>([]),
                        },
                    },
                },
            },
            integrations: fromJS({
                integrations: [],
            }),
        } as RootState
        mockUseHelpCenterList.mockReturnValue({
            isLoading: false,
            helpCenters: helpCenters,
            hasMore: false,
            fetchMore: jest.fn(),
        })

        const { store } = renderWithStore(<HelpCenterStats />, state)

        await waitFor(() => {
            expect(store.getActions()).toContainEqual(
                mergeStatsFiltersWithLogicalOperator({
                    helpCenters: withDefaultLogicalOperator<number>([
                        helpCenters.sort(getSortByName)[0].id,
                    ]),
                    localeCodes: withDefaultLogicalOperator(['en-US']),
                }),
            )
        })
    })

    it('should set initial help center filter with selected help center', async () => {
        const helpCenterFixture = getHelpCentersResponseFixture.data[0]
        const selectedHelpCenter = { ...helpCenterFixture, name: 'D', id: 4 }
        const state = {
            stats: {
                filters: {
                    ...initialState.filters,
                    helpCenters: withDefaultLogicalOperator([
                        selectedHelpCenter.id,
                    ]),
                    localeCodes: withDefaultLogicalOperator<string>([]),
                },
            },
            ui: {
                stats: {
                    filters: {
                        cleanStatsFilters: {
                            ...initialState.filters,
                            helpCenters: withDefaultLogicalOperator([
                                selectedHelpCenter.id,
                            ]),
                            localeCodes: withDefaultLogicalOperator<string>([]),
                        },
                    },
                },
            },
            integrations: fromJS({
                integrations: [],
            }),
        } as RootState
        const hc = [
            { ...helpCenterFixture, name: 'B', id: 3 },
            { ...helpCenterFixture, name: 'A', id: 1 },
            { ...helpCenterFixture, name: 'C', id: 2 },
            selectedHelpCenter,
        ]

        mockUseHelpCenterList.mockReturnValue({
            isLoading: false,
            helpCenters: hc,
            hasMore: false,
            fetchMore: jest.fn(),
        })

        const { store } = renderWithStore(<HelpCenterStats />, state)

        await waitFor(() => {
            expect(store.getActions()).toContainEqual(
                expect.objectContaining({
                    payload: expect.objectContaining({
                        helpCenters: withDefaultLogicalOperator<number>([
                            selectedHelpCenter.id,
                        ]),
                        localeCodes: withDefaultLogicalOperator([]),
                    }),
                }),
            )
        })
    })

    it('should show AIBanner', () => {
        useHasAccessToAILibraryMock.mockReturnValue(true)
        useHelpCenterAIArticlesLibraryMock.mockReturnValue({
            hasNewArticles: true,
        } as any)
        renderComponent()

        expect(AIBannerMock).toHaveBeenCalled()
    })

    it('should show Filters Panel', () => {
        renderComponent()

        expect(FiltersPanelMock).toHaveBeenCalled()
    })
})
