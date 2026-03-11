import React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import _keyBy from 'lodash/keyBy'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TicketChannel } from 'business/types/ticket'
import type { TableDataSources } from 'domains/reporting/hooks/common/useTableReportData'
import {
    fetchTableReportData,
    useTableReportData,
    useTables,
} from 'domains/reporting/hooks/common/useTableReportData'
import { useSortedChannels } from 'domains/reporting/hooks/support-performance/useSortedChannels'
import type { MetricWithDecile } from 'domains/reporting/hooks/types'
import { useAgentsTableConfigSetting } from 'domains/reporting/hooks/useAgentsTableConfigSetting'
import { useChannelsTableSetting } from 'domains/reporting/hooks/useChannelsTableConfigSetting'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import type { StatsFiltersWithLogicalOperator } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getSortedAgents } from 'domains/reporting/state/ui/stats/agentPerformanceSlice'
import { getSortedAutoQAAgents } from 'domains/reporting/state/ui/stats/autoQAAgentPerformanceSlice'
import {
    busiestTimesSlice,
    initialState as busiestTimesSliceInitialState,
} from 'domains/reporting/state/ui/stats/busiestTimesSlice'
import {
    tagsReportSlice,
    initialState as tagsReportSliceinitialState,
} from 'domains/reporting/state/ui/stats/tagsReportSlice'
import {
    initialState,
    ticketInsightsSlice,
} from 'domains/reporting/state/ui/stats/ticketInsightsSlice'
import { agents } from 'fixtures/agents'
import { integrationsState } from 'fixtures/integrations'
import { tags } from 'fixtures/tag'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'
import type { RootState, StoreDispatch } from 'state/types'

jest.mock('domains/reporting/hooks/useAgentsTableConfigSetting')
const useAgentsTableConfigSettingMock = assumeMock(useAgentsTableConfigSetting)
jest.mock('domains/reporting/hooks/useChannelsTableConfigSetting')
const useChannelsTableSettingMock = assumeMock(useChannelsTableSetting)
jest.mock('domains/reporting/hooks/support-performance/useSortedChannels')
const useSortedChannelsMock = assumeMock(useSortedChannels)
jest.mock('domains/reporting/state/ui/stats/agentPerformanceSlice')
const getSortedAgentsMock = assumeMock(getSortedAgents)
jest.mock('domains/reporting/state/ui/stats/autoQAAgentPerformanceSlice')
const getSortedAutoQAAgentsMock = assumeMock(getSortedAutoQAAgents)
jest.mock('pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate')
const useMoneySavedPerInteractionWithAutomateMock = assumeMock(
    useMoneySavedPerInteractionWithAutomate,
)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('useTable hooks', () => {
    const defaultStatsFilters: StatsFiltersWithLogicalOperator = {
        period: {
            start_datetime: '2021-02-03T00:00:00.000Z',
            end_datetime: '2021-02-03T23:59:59.999Z',
        },
        channels: withDefaultLogicalOperator([TicketChannel.Chat]),
        integrations: withDefaultLogicalOperator([
            integrationsState.integrations[0].id,
        ]),
        agents: withDefaultLogicalOperator([agents[0].id]),
    }
    const defaultState = {
        agents: fromJS({
            all: agents,
        }),
        entities: {
            tags: _keyBy(tags, 'id'),
        },
        ui: {
            stats: {
                [ticketInsightsSlice.name]: {
                    ...initialState,
                    selectedCustomField: {
                        id: 123,
                        label: 'someLabel',
                        isLoading: false,
                    },
                },
                [busiestTimesSlice.name]: busiestTimesSliceInitialState,
                [tagsReportSlice.name]: tagsReportSliceinitialState,
            },
        },
    } as RootState
    const granularity = ReportingGranularity.Day
    const userTimezone = 'UTC'
    const fileName = 'someFileName'

    describe('useTables', () => {
        const files = {
            ['fileName']: 'fileContent',
        }
        const tableResponse = { isLoading: false, fileName, files }
        const tableSources = [
            {
                title: 'someTitle',
                fetchTable: () => Promise.resolve(tableResponse),
            },
        ]

        beforeEach(() => {
            useAgentsTableConfigSettingMock.mockReturnValue({
                columnsOrder: [],
            } as unknown as ReturnType<typeof useAgentsTableConfigSetting>)
            useChannelsTableSettingMock.mockReturnValue({
                columnsOrder: [],
            } as unknown as ReturnType<typeof useChannelsTableSetting>)
            useSortedChannelsMock.mockReturnValue({
                sortedChannels: [],
            } as unknown as ReturnType<typeof useSortedChannels>)
            getSortedAgentsMock.mockReturnValue(agents)
            getSortedAutoQAAgentsMock.mockReturnValue(agents)
            useMoneySavedPerInteractionWithAutomateMock.mockReturnValue(3.1)
        })

        it('should fetch Table Reports', async () => {
            const { result } = renderHook(
                () =>
                    useTables(
                        defaultStatsFilters,
                        userTimezone,
                        granularity,
                        tableSources,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(defaultState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            await waitFor(() => {
                expect(result.current).toEqual({
                    files,
                    isFetching: false,
                })
            })
        })

        it('should return empty on error', async () => {
            const state = {
                agents: fromJS({
                    all: agents,
                }),
                entities: {
                    tags: _keyBy(tags, 'id'),
                },
                ui: {
                    stats: {
                        [ticketInsightsSlice.name]: initialState,
                        [busiestTimesSlice.name]: busiestTimesSliceInitialState,
                        [tagsReportSlice.name]: tagsReportSliceinitialState,
                    },
                },
            } as RootState
            const errorTableSources = [
                {
                    title: 'someTitle',
                    fetchTable: () => Promise.reject({}),
                },
            ]

            const { result } = renderHook(
                () =>
                    useTables(
                        defaultStatsFilters,
                        userTimezone,
                        granularity,
                        errorTableSources,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(state)}>{children}</Provider>
                    ),
                },
            )

            await waitFor(() => {
                expect(result.current).toEqual({
                    files: {},
                    isFetching: false,
                })
            })
        })
    })

    describe('useTableReportData', () => {
        it('should fetch data for report sources', async () => {
            type reportDataType = {
                abc: MetricWithDecile
                xyz: MetricWithDecile
            }
            const tableDataSources: TableDataSources<reportDataType> = [
                {
                    fetchData: () =>
                        Promise.resolve({
                            data: {
                                value: 123,
                                decile: 5,
                                allData: [],
                            },
                            isFetching: false,
                            isError: false,
                        }),
                    title: 'abc',
                },
                {
                    fetchData: () =>
                        Promise.resolve({
                            data: {
                                value: 456,
                                decile: 3,
                                allData: [],
                            },
                            isFetching: false,
                            isError: false,
                        }),
                    title: 'xyz',
                },
            ]

            const { result } = renderHook(() =>
                useTableReportData(
                    defaultStatsFilters,
                    userTimezone,
                    tableDataSources,
                ),
            )

            await waitFor(() => {
                expect(result.current).toEqual({
                    data: {
                        abc: {
                            data: {
                                value: 123,
                                decile: 5,
                                allData: [],
                            },
                            isFetching: false,
                            isError: false,
                        },
                        xyz: {
                            data: {
                                value: 456,
                                decile: 3,
                                allData: [],
                            },
                            isFetching: false,
                            isError: false,
                        },
                    },
                    isFetching: false,
                })
            })
        })

        it('should return error without data on fetch error', async () => {
            type reportDataType = {
                abc: MetricWithDecile
                xyz: MetricWithDecile
            }
            const tableDataSources: TableDataSources<reportDataType> = [
                {
                    fetchData: () => Promise.reject({}),
                    title: 'abc',
                },
                {
                    fetchData: () =>
                        Promise.resolve({
                            data: {
                                value: 456,
                                decile: 3,
                                allData: [],
                            },
                            isFetching: false,
                            isError: false,
                        }),
                    title: 'xyz',
                },
            ]

            const { result } = renderHook(() =>
                useTableReportData(
                    defaultStatsFilters,
                    userTimezone,
                    tableDataSources,
                ),
            )

            await waitFor(() => {
                expect(result.current).toEqual({
                    data: null,
                    isFetching: false,
                })
            })
        })
    })

    describe('fetchTableReportData', () => {
        it('should fetch data for report source', async () => {
            const tableResponse = { isLoading: false, fileName, files: {} }
            const tableSources = [
                {
                    fetchData: () => Promise.resolve(tableResponse),
                    title: 'abc',
                },
            ]

            const response = await fetchTableReportData(
                defaultStatsFilters,
                userTimezone,
                tableSources,
            )

            expect(response).toEqual({
                data: { ['abc']: tableResponse },
                isError: false,
                isFetching: false,
            })
        })

        it('should return empty on error', async () => {
            const tableResponse = { isLoading: false, fileName, files: {} }
            const tableSources = [
                {
                    fetchData: () => Promise.reject(tableResponse),
                    title: 'abc',
                },
            ]

            const response = await fetchTableReportData(
                defaultStatsFilters,
                userTimezone,
                tableSources,
            )

            expect(response).toEqual({
                data: null,
                isError: true,
                isFetching: false,
            })
        })
    })
})
