import { assumeMock, getLastMockCall, renderHook } from '@repo/testing'

import { usePostStats } from 'domains/reporting/models/queries'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { CALL_OUTCOME_NODE } from 'domains/reporting/pages/performance/channels/voice/charts/configurableGraphs/ChannelsVoiceConfigurableGraph/callOutcomeSankey'
import { useChannelsVoiceCallOutcomeSankeyData } from 'domains/reporting/pages/performance/channels/voice/charts/configurableGraphs/ChannelsVoiceConfigurableGraph/useChannelsVoiceCallOutcomeSankeyData'

jest.mock('domains/reporting/models/queries')
const usePostStatsMock = assumeMock(usePostStats)

describe('useChannelsVoiceCallOutcomeSankeyData', () => {
    const filters: StatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }
    const timezone = 'utc'

    const renderSankeyHook = () =>
        renderHook(() =>
            useChannelsVoiceCallOutcomeSankeyData(filters, timezone),
        )

    beforeEach(() => {
        usePostStatsMock.mockReturnValue({
            data: undefined,
            isFetching: false,
        } as any)
    })

    it('returns the query data and maps isFetching to isLoading', () => {
        const sankeyData = {
            nodes: [{ name: CALL_OUTCOME_NODE.Inbound, color: '#fff' }],
            links: [],
        }
        usePostStatsMock.mockReturnValue({
            data: sankeyData,
            isFetching: true,
        } as any)

        const { result } = renderSankeyHook()

        expect(result.current.data).toBe(sankeyData)
        expect(result.current.isLoading).toBe(true)
    })

    it('returns empty data while the query has no result yet', () => {
        usePostStatsMock.mockReturnValue({
            data: undefined,
            isFetching: false,
        } as any)

        const { result } = renderSankeyHook()

        expect(result.current.data).toEqual({ nodes: [], links: [] })
        expect(result.current.isLoading).toBe(false)
    })

    describe('select', () => {
        const getSelect = () => {
            renderSankeyHook()
            return getLastMockCall(usePostStatsMock)?.[1]?.select
        }

        const responseWith = (row: Record<string, string | null>) =>
            ({ data: { data: [row] } }) as any

        it('parses string measure values into the funnel links', () => {
            const select = getSelect()

            const result = select?.(
                responseWith({
                    inboundCallsCount: '892',
                    outboundCallsCount: '382',
                    inboundAnsweredCallsCount: '248',
                    inboundUnansweredCallsCount: '644',
                    inboundMissedCallsCount: '310',
                    inboundAbandonedCallsCount: '175',
                    inboundCancelledCallsCount: '86',
                    inboundCallbackRequestedCallsCount: '73',
                }),
            )

            const valueFor = (source: string, target: string) =>
                result.links.find(
                    (link: { source: string; target: string }) =>
                        link.source === source && link.target === target,
                )?.value

            expect(
                valueFor(
                    CALL_OUTCOME_NODE.TotalCalls,
                    CALL_OUTCOME_NODE.Inbound,
                ),
            ).toBe(892)
            expect(
                valueFor(
                    CALL_OUTCOME_NODE.TotalCalls,
                    CALL_OUTCOME_NODE.Outbound,
                ),
            ).toBe(382)
            expect(
                valueFor(CALL_OUTCOME_NODE.Inbound, CALL_OUTCOME_NODE.Answered),
            ).toBe(248)
            expect(
                valueFor(
                    CALL_OUTCOME_NODE.Unanswered,
                    CALL_OUTCOME_NODE.Missed,
                ),
            ).toBe(310)
        })

        it('treats missing or null measures as zero and drops their flows', () => {
            const select = getSelect()

            const result = select?.(
                responseWith({
                    inboundCallsCount: '10',
                    inboundAnsweredCallsCount: '10',
                    outboundCallsCount: null,
                }),
            )

            expect(
                result.links.every((link: { value: number }) => link.value > 0),
            ).toBe(true)
            expect(
                result.nodes.map((node: { name: string }) => node.name),
            ).toEqual([
                CALL_OUTCOME_NODE.TotalCalls,
                CALL_OUTCOME_NODE.Inbound,
                CALL_OUTCOME_NODE.Answered,
            ])
        })

        it('returns empty data when the response has no rows', () => {
            const select = getSelect()

            const result = select?.({ data: { data: [] } } as any)

            expect(result).toEqual({ nodes: [], links: [] })
        })
    })
})
