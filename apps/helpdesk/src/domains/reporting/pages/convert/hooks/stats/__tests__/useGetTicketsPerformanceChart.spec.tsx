import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import moment from 'moment/moment'

import { TicketChannel } from 'business/types/ticket'
import type { Stat } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import * as revenueAttributionClient from 'domains/reporting/pages/convert/clients/RevenueAttributionClient'
import { useTicketsPerformanceChart } from 'domains/reporting/pages/convert/hooks/stats/useGetTicketsPerformanceChart'

describe('useTicketsPerformanceChart', () => {
    const startDate = '2023-02-28T00:00:00.000'
    const endDate = '2023-03-02T00:00:00.000'
    const hookArgs: [
        string[],
        string,
        string,
        number[],
        LogicalOperatorEnum,
        TicketChannel[],
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
        'getTicketsPerformanceData',
    ).mockReturnValue(new Promise((resolve) => resolve(ticketsPerformanceData)))

    it('should return data in correct format', async () => {
        // act
        const { result } = renderHook(() =>
            useTicketsPerformanceChart(...hookArgs),
        )
        await waitFor(() => {
            expect(result.current).toMatchSnapshot()
        })
    })
})
