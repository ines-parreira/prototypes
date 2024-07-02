import React from 'react'
import {screen} from '@testing-library/react'
import {formatMetricValue} from 'pages/stats/common/utils'
import {ChannelsCellContent} from 'pages/stats/support-performance/channels/ChannelsCellContent'
import {
    ChannelColumnConfig,
    ChannelsTableColumns,
} from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import {
    statsSlice,
    initialState as statsInitialState,
} from 'state/stats/statsSlice'
import {RootState} from 'state/types'
import {channelsSlice, initialState} from 'state/ui/stats/channelsSlice'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {renderWithStore} from 'utils/testing'

jest.mock('@gorgias/ui-kit', () => ({
    Tooltip: () => <div />,
}))

describe('<ChannelsCellContent />', () => {
    const defaultState = {
        [statsSlice.name]: statsInitialState,
        ui: {
            stats: uiStatsInitialState,
            [channelsSlice.name]: initialState,
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

        expect(document.querySelector('.skeleton')).toBeInTheDocument()
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
                    ...defaultState.ui,
                    [channelsSlice.name]: {...initialState, heatmapMode: true},
                },
            }
        )

        expect(document.querySelector(`.p${decile}`)).toBeInTheDocument()
        expect(document.querySelector('.heatmap')).toBeInTheDocument()
    })
})
