import { renderHook } from '@testing-library/react-hooks'

import { OrderDirection } from 'models/api/types'

import CAMPAIGN_PERFORMANCE_ROWS from '../../fixtures/campaignPerformanceRows'
import { CampaignTableContentCell } from '../../types/CampaignTableContentCell'
import { CampaignTableKeys } from '../../types/enums/CampaignTableKeys.enum'
import { useSortedAndPaginatedTableRows } from '../useSortedAndPaginatedTableRows'

const MOCK_ITEMS_PER_PAGE = 5

describe('useSortedAndPaginatedTableRows', () => {
    describe('when there is an order key', () => {
        it('sorts the rows', () => {
            const { result } = renderHook(() =>
                useSortedAndPaginatedTableRows(
                    CAMPAIGN_PERFORMANCE_ROWS as unknown as CampaignTableContentCell[],
                    {
                        orderKey: CampaignTableKeys.CampaignName,
                        orderDirection: OrderDirection.Asc,
                        offset: 0,
                        page: MOCK_ITEMS_PER_PAGE,
                    },
                ),
            )

            expect(result.current).toEqual([
                CAMPAIGN_PERFORMANCE_ROWS[2],
                CAMPAIGN_PERFORMANCE_ROWS[1],
                CAMPAIGN_PERFORMANCE_ROWS[3],
                CAMPAIGN_PERFORMANCE_ROWS[5],
                CAMPAIGN_PERFORMANCE_ROWS[6],
            ])
        })
    })

    describe('when there is no order key', () => {
        it('does not sort the rows', () => {
            const { result } = renderHook(() =>
                useSortedAndPaginatedTableRows(
                    CAMPAIGN_PERFORMANCE_ROWS as unknown as CampaignTableContentCell[],
                    {
                        orderDirection: OrderDirection.Asc,
                        offset: 0,
                        page: 10,
                    },
                ),
            )

            expect(result.current).toEqual(CAMPAIGN_PERFORMANCE_ROWS)
        })
    })

    describe('when the offset + per page is greater than the total rows', () => {
        it('returns the remaining rows starting from offset', () => {
            const { result } = renderHook(() =>
                useSortedAndPaginatedTableRows(
                    CAMPAIGN_PERFORMANCE_ROWS as unknown as CampaignTableContentCell[],
                    {
                        orderDirection: OrderDirection.Asc,
                        offset: 4,
                        page: MOCK_ITEMS_PER_PAGE,
                    },
                ),
            )

            expect(result.current).toEqual(CAMPAIGN_PERFORMANCE_ROWS.slice(4))
        })
    })

    describe('when the offset + per page is less than the total rows', () => {
        it('returns the rows from offset to offset + per page', () => {
            const { result } = renderHook(() =>
                useSortedAndPaginatedTableRows(
                    CAMPAIGN_PERFORMANCE_ROWS as unknown as CampaignTableContentCell[],
                    {
                        orderDirection: OrderDirection.Asc,
                        offset: 2,
                        page: MOCK_ITEMS_PER_PAGE,
                    },
                ),
            )

            expect(result.current).toEqual(
                CAMPAIGN_PERFORMANCE_ROWS.slice(2, 2 + MOCK_ITEMS_PER_PAGE),
            )
        })
    })
})
