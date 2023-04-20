import {renderHook} from '@testing-library/react-hooks'
import {act} from 'react-dom/test-utils'
import * as revenueAttributionClient from 'pages/stats/revenue/clients/RevenueAttributionClient'
import {Stat} from 'models/stat/types'
import {useTicketsPerformanceStat} from 'pages/stats/revenue/hooks/stats/useGetTicketsPerformanceStat'

describe('useGetTableStat', () => {
    const hookArgs: [string[], string, string] = [
        ['campaign1', 'campaign2'],
        '2023-02-01T00:00:00-08:00',
        '2023-04-01T00:00:00-08:00',
    ]

    const campaignTicketsPerformanceData = {
        data: {
            data: [
                ['campaign1', 157],
                ['campaign2', 357],
            ],
        },
    } as unknown as Stat
    jest.spyOn(
        revenueAttributionClient,
        'getCampaignTicketsPerformanceData'
    ).mockReturnValue(
        new Promise((resolve) => resolve(campaignTicketsPerformanceData))
    )

    it('should return data in correct format', async () => {
        // act
        const {result, waitForNextUpdate} = renderHook(() =>
            useTicketsPerformanceStat(...hookArgs)
        )
        await act(async () => await waitForNextUpdate())

        // assert
        expect(result.current).toMatchSnapshot()
    })
})
