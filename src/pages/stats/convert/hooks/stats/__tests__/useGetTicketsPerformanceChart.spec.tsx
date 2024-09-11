import {renderHook} from '@testing-library/react-hooks'
import {act} from 'react-dom/test-utils'
import moment from 'moment/moment'
import * as revenueAttributionClient from 'pages/stats/convert/clients/RevenueAttributionClient'
import {Stat} from 'models/stat/types'
import {useTicketsPerformanceChart} from 'pages/stats/convert/hooks/stats/useGetTicketsPerformanceChart'
import {TicketChannel} from 'business/types/ticket'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'

describe('useTicketsPerformanceChart', () => {
    const startDate = '2023-02-28T00:00:00.000'
    const endDate = '2023-03-02T00:00:00.000'
    const hookArgs: [
        string[],
        string,
        string,
        number[],
        LogicalOperatorEnum,
        TicketChannel[]
    ] = [
        ['campaign1', 'campaign2'],
        startDate,
        endDate,
        [1],
        LogicalOperatorEnum.ONE_OF,
        [TicketChannel.Chat],
    ]

    const ticketsPerformanceData = {
        data: {
            data: {
                axes: {
                    x: [
                        moment.utc(startDate).unix(),
                        moment.utc(endDate).subtract(1, 'day').unix(),
                    ],
                    y: ['Day is 28.2.2023', 'Day is 1.3.2023'],
                },
                lines: [
                    {
                        data: [125, 68], // tickets created
                    },
                    {
                        data: [12, 2], // tickets converted
                    },
                ],
            },
        },
    } as unknown as Stat
    jest.spyOn(
        revenueAttributionClient,
        'getTicketsPerformanceData'
    ).mockReturnValue(new Promise((resolve) => resolve(ticketsPerformanceData)))

    it('should return data in correct format', async () => {
        // act
        const {result, waitForNextUpdate} = renderHook(() =>
            useTicketsPerformanceChart(...hookArgs)
        )
        await act(async () => await waitForNextUpdate())

        // assert
        expect(result.current).toMatchSnapshot()
    })
})
