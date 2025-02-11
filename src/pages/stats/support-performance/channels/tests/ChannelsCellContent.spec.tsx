import {screen} from '@testing-library/react'
import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {TagFilterInstanceId} from 'models/stat/types'
import {formatMetricValue} from 'pages/stats/common/utils'
import {ChannelsCellContent} from 'pages/stats/support-performance/channels/ChannelsCellContent'
import {ChannelColumnConfig} from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import {
    initialState as statsInitialState,
    statsSlice,
} from 'state/stats/statsSlice'
import {RootState} from 'state/types'
import {channelsSlice, initialState} from 'state/ui/stats/channelsSlice'
import {initialState as uiStatsInitialState} from 'state/ui/stats/filtersSlice'
import {ChannelsTableColumns} from 'state/ui/stats/types'
import {renderWithStore} from 'utils/testing'

jest.mock(
    '@gorgias/merchant-ui-kit',
    () =>
        ({
            ...jest.requireActual('@gorgias/merchant-ui-kit'),
            Tooltip: () => <div />,
        }) as typeof import('@gorgias/merchant-ui-kit')
)

describe('<ChannelsCellContent />', () => {
    const mockedHelpCenters = [1, 2, 3]
    const mockedTags = [4, 5, 6]
    const defaultState = {
        [statsSlice.name]: {
            filters: {
                ...statsInitialState.filters,
                helpCenters: withDefaultLogicalOperator(mockedHelpCenters),
                tags: [
                    {
                        ...withDefaultLogicalOperator(mockedTags),
                        filterInstanceId: TagFilterInstanceId.First,
                    },
                ],
            },
        },
        ui: {
            stats: {
                filters: uiStatsInitialState,
                [channelsSlice.name]: initialState,
            },
        },
    } as RootState

    const channel = {
        id: '',
        name: 'Some channel',
        slug: '',
        logo_url: null,
        live_messaging: false,
        created_datetime: '',
        updated_datetime: null,
    }
    const column = ChannelsTableColumns.TicketHandleTime

    beforeEach(() => {
        mockFlags({[FeatureFlagKey.AnalyticsNewFilters]: false})
    })

    it('should render loading placeholder', () => {
        const metricHook = () => ({
            isFetching: true,
            isError: false,
            data: {
                value: null,
                decile: null,
                allData: [],
            },
        })

        renderWithStore(
            <ChannelsCellContent
                channel={channel}
                column={column}
                width={0}
                useMetric={metricHook}
            />,
            defaultState
        )

        expect(
            document.querySelector('.react-loading-skeleton')
        ).toBeInTheDocument()
    })

    it('should render formatted results', () => {
        const value = 1253
        const metricHook = () => ({
            isFetching: false,
            isError: false,
            data: {
                value,
                decile: null,
                allData: [],
            },
        })

        renderWithStore(
            <ChannelsCellContent
                channel={channel}
                column={column}
                width={0}
                useMetric={metricHook}
            />,
            defaultState
        )

        expect(
            screen.getByText(
                formatMetricValue(value, ChannelColumnConfig[column].format)
            )
        )
    })

    it('should render the Channel name in Channel column', () => {
        const column = ChannelsTableColumns.Channel

        renderWithStore(
            <ChannelsCellContent
                channel={channel}
                column={column}
                width={0}
                useMetric={ChannelColumnConfig[column].useMetric}
            />,
            defaultState
        )

        expect(screen.getByText(channel.name))
    })

    it('should render heatmap mode', () => {
        const value = 1253
        const decile = 5
        const metricHook = () => ({
            isFetching: false,
            isError: false,
            data: {
                value,
                decile,
                allData: [],
            },
        })

        renderWithStore(
            <ChannelsCellContent
                channel={channel}
                column={column}
                width={160}
                useMetric={metricHook}
            />,
            {
                ...defaultState,
                ui: {
                    stats: {
                        ...defaultState.ui.stats,
                        [channelsSlice.name]: {
                            ...initialState,
                            heatmapMode: true,
                        },
                    },
                },
            } as RootState
        )

        expect(document.querySelector(`.p${decile}`)).toBeInTheDocument()
        expect(document.querySelector('.heatmap')).toBeInTheDocument()
    })

    it('should check if use metric hook is called with legacy stats filters', () => {
        const metricHook = jest.fn(() => ({
            isFetching: true,
            isError: false,
            data: {
                value: null,
                decile: null,
                allData: [],
            },
        }))

        renderWithStore(
            <ChannelsCellContent
                channel={channel}
                column={column}
                width={0}
                useMetric={metricHook}
            />,
            defaultState
        )

        expect((metricHook.mock.calls[0] as Record<string, any>[])[0]).toEqual(
            expect.objectContaining({
                tags: mockedTags,
                helpCenters: mockedHelpCenters,
            })
        )
    })

    it('should check if use metric hook is called with stats filters with logical operator', () => {
        mockFlags({[FeatureFlagKey.AnalyticsNewFilters]: true})
        const metricHook = jest.fn(() => ({
            isFetching: true,
            isError: false,
            data: {
                value: null,
                decile: null,
                allData: [],
            },
        }))

        renderWithStore(
            <ChannelsCellContent
                channel={channel}
                column={column}
                width={0}
                useMetric={metricHook}
            />,
            defaultState
        )

        expect((metricHook.mock.calls[0] as Record<string, any>[])[0]).toEqual(
            expect.objectContaining({
                tags: [
                    {
                        ...withDefaultLogicalOperator(mockedTags),
                        filterInstanceId: TagFilterInstanceId.First,
                    },
                ],
                helpCenters: withDefaultLogicalOperator(mockedHelpCenters),
            })
        )
    })
})
