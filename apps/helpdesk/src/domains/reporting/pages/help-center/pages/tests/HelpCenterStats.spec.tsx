import React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { getSortByName } from '@repo/utils'
import { screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { useArticleViewTimeSeries } from 'domains/reporting/hooks/help-center/useArticleViewTimeSeries'
import type { TimeSeriesResult } from 'domains/reporting/hooks/useTimeSeries'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { FiltersPanelWrapper } from 'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import AIBanner from 'domains/reporting/pages/help-center/components/AIBanner'
import HelpCenterStats from 'domains/reporting/pages/help-center/pages/HelpCenterStats'
import { HELP_CENTER_STATS_TEST_IDS } from 'domains/reporting/pages/help-center/pages/tests/constants'
import { useReportChartRestrictions } from 'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions'
import {
    initialState,
    mergeStatsFiltersWithLogicalOperator,
} from 'domains/reporting/state/stats/statsSlice'
import { useHasAccessToAILibrary } from 'pages/settings/helpCenter/components/AIArticlesLibraryView/hooks/useHasAccessToAILibrary'
import { useHelpCenterAIArticlesLibrary } from 'pages/settings/helpCenter/components/AIArticlesLibraryView/hooks/useHelpCenterAIArticlesLibrary'
import { getHelpCentersResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { useHelpCenterList } from 'pages/settings/helpCenter/hooks/useHelpCenterList'
import type { RootState } from 'state/types'
import configureStore from 'store/configureStore.prod'
import type { InitialRootState } from 'types'
import { renderWithRouter, renderWithStore } from 'utils/testing'

jest.mock(
    'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions',
)
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

jest.mock(
    'domains/reporting/pages/common/components/charts/LineChart/LineChart',
    () => () => <div>line-chart</div>,
)
jest.mock(
    'domains/reporting/pages/help-center/hooks/useArticleViewsTrend',
    () => ({
        useArticleViewsTrend: () => ({ data: { value: 1 }, isFetching: false }),
    }),
)
jest.mock(
    'domains/reporting/pages/help-center/hooks/useSearchRequestedTrend',
    () => ({
        useSearchRequestedTrend: () => ({
            data: { value: 1 },
            isFetching: false,
        }),
    }),
)
jest.mock('domains/reporting/hooks/help-center/useArticleViewTimeSeries')
const mockUseArticleViewTimeSeries = assumeMock(useArticleViewTimeSeries)
jest.mock(
    'domains/reporting/pages/help-center/hooks/useSearchTermsMetrics',
    () => ({
        useSearchTermsMetrics: () => ({ data: [], isFetching: false }),
    }),
)
jest.mock(
    'domains/reporting/pages/help-center/hooks/usePerformanceByArticleMetrics',
    () => ({
        usePerformanceByArticleMetrics: () => ({ data: [], isFetching: false }),
    }),
)
jest.mock(
    'domains/reporting/pages/help-center/hooks/useNoSearchResultsMetrics',
    () => ({
        useNoSearchResultsMetrics: () => ({ data: [], isFetching: false }),
    }),
)
jest.mock('pages/settings/helpCenter/hooks/useHelpCenterList')
const mockUseHelpCenterList = assumeMock(useHelpCenterList)
jest.mock(
    'domains/reporting/pages/help-center/hooks/useSearchResultRange',
    () => ({
        useSearchResultRange: () => ({ data: [], isLoading: true }),
    }),
)
jest.mock(
    'domains/reporting/pages/common/drill-down/DrillDownModal.tsx',
    () => ({
        DrillDownModal: () => null,
    }),
)
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
jest.mock(
    'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper',
)
const FiltersPanelMock = assumeMock(FiltersPanelWrapper)
jest.mock('domains/reporting/pages/help-center/components/AIBanner')
const AIBannerMock = assumeMock(AIBanner)
jest.mock(
    'pages/settings/helpCenter/components/AIArticlesLibraryView/hooks/useHasAccessToAILibrary',
)
const useHasAccessToAILibraryMock = assumeMock(useHasAccessToAILibrary)
jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
)
const ChartsActionMenuMock = assumeMock(ChartsActionMenu)
jest.mock('@repo/logging')
const mockedLogEvent = assumeMock(logEvent)

describe('<HelpCenterStats />', () => {
    const helpCenters = getHelpCentersResponseFixture.data

    const renderComponent = () => {
        const store = configureStore({} as InitialRootState)
        renderWithRouter(
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
        } as unknown as TimeSeriesResult)
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

    it('should set initial help center filter with first help center from redux state', async () => {
        const helpCenterFixture = getHelpCentersResponseFixture.data[0]
        const helpCenters = [
            { ...helpCenterFixture, name: 'B', id: 3 },
            { ...helpCenterFixture, name: 'A', id: 1 },
            { ...helpCenterFixture, name: 'C', id: 2 },
            { ...helpCenterFixture, name: 'D', id: 4 },
        ]
        const helpCenterInitialState = {
            helpCenters: withDefaultLogicalOperator<number>([123]),
            localeCodes: withDefaultLogicalOperator<string>(
                ['en-US', 'fr-FR'],
                LogicalOperatorEnum.NOT_ONE_OF,
            ),
        }
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
                            ...helpCenterInitialState,
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
                        helpCenterInitialState.helpCenters.values[0],
                    ]),
                    localeCodes: withDefaultLogicalOperator(
                        helpCenterInitialState.localeCodes.values,
                        helpCenterInitialState.localeCodes.operator,
                    ),
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
