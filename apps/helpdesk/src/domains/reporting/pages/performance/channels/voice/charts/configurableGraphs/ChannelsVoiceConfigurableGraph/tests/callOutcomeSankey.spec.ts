import {
    buildCallOutcomeSankeyData,
    CALL_OUTCOME_NODE,
} from 'domains/reporting/pages/performance/channels/voice/charts/configurableGraphs/ChannelsVoiceConfigurableGraph/callOutcomeSankey'
import type { CallOutcomeMeasure } from 'domains/reporting/pages/performance/channels/voice/charts/configurableGraphs/ChannelsVoiceConfigurableGraph/callOutcomeSankey'

const makeValues = (
    overrides: Partial<Record<CallOutcomeMeasure, number>> = {},
): Record<CallOutcomeMeasure, number> => ({
    inboundCallsCount: 892,
    outboundCallsCount: 382,
    inboundAnsweredCallsCount: 248,
    inboundUnansweredCallsCount: 644,
    inboundMissedCallsCount: 310,
    inboundAbandonedCallsCount: 175,
    inboundCancelledCallsCount: 86,
    inboundCallbackRequestedCallsCount: 73,
    ...overrides,
})

const valueFor = (
    links: ReturnType<typeof buildCallOutcomeSankeyData>['links'],
    source: string,
    target: string,
) =>
    links.find((link) => link.source === source && link.target === target)
        ?.value

describe('buildCallOutcomeSankeyData', () => {
    it('splits total calls into inbound/outbound, then inbound into answered/unanswered, then unanswered into its reasons', () => {
        const { links } = buildCallOutcomeSankeyData(makeValues())

        expect(
            valueFor(
                links,
                CALL_OUTCOME_NODE.TotalCalls,
                CALL_OUTCOME_NODE.Inbound,
            ),
        ).toBe(892)
        expect(
            valueFor(
                links,
                CALL_OUTCOME_NODE.TotalCalls,
                CALL_OUTCOME_NODE.Outbound,
            ),
        ).toBe(382)
        expect(
            valueFor(
                links,
                CALL_OUTCOME_NODE.Inbound,
                CALL_OUTCOME_NODE.Answered,
            ),
        ).toBe(248)
        expect(
            valueFor(
                links,
                CALL_OUTCOME_NODE.Inbound,
                CALL_OUTCOME_NODE.Unanswered,
            ),
        ).toBe(644)
        expect(
            valueFor(
                links,
                CALL_OUTCOME_NODE.Unanswered,
                CALL_OUTCOME_NODE.Missed,
            ),
        ).toBe(310)
        expect(
            valueFor(
                links,
                CALL_OUTCOME_NODE.Unanswered,
                CALL_OUTCOME_NODE.Abandoned,
            ),
        ).toBe(175)
        expect(
            valueFor(
                links,
                CALL_OUTCOME_NODE.Unanswered,
                CALL_OUTCOME_NODE.Canceled,
            ),
        ).toBe(86)
        expect(
            valueFor(
                links,
                CALL_OUTCOME_NODE.Unanswered,
                CALL_OUTCOME_NODE.CallbackRequested,
            ),
        ).toBe(73)
    })

    it('colors each link by its target node so the flow reads as its destination', () => {
        const { nodes, links } = buildCallOutcomeSankeyData(makeValues())
        const colorByNode = new Map(
            nodes.map((node) => [node.name, node.color]),
        )

        for (const link of links) {
            expect(link.color).toBe(colorByNode.get(link.target))
        }
    })

    it('orders nodes for display, keeping inbound above outbound', () => {
        const { nodes } = buildCallOutcomeSankeyData(makeValues())
        const names = nodes.map((node) => node.name)

        expect(names[0]).toBe(CALL_OUTCOME_NODE.TotalCalls)
        expect(names.indexOf(CALL_OUTCOME_NODE.Inbound)).toBeLessThan(
            names.indexOf(CALL_OUTCOME_NODE.Outbound),
        )
        expect(nodes.every((node) => Boolean(node.color))).toBe(true)
    })

    it('drops links and nodes for branches with no calls', () => {
        const { nodes, links } = buildCallOutcomeSankeyData(
            makeValues({
                outboundCallsCount: 0,
                inboundAbandonedCallsCount: 0,
                inboundCancelledCallsCount: 0,
                inboundCallbackRequestedCallsCount: 0,
            }),
        )

        expect(links.some((link) => link.value === 0)).toBe(false)
        expect(nodes.map((node) => node.name)).not.toContain(
            CALL_OUTCOME_NODE.Outbound,
        )
        expect(nodes.map((node) => node.name)).not.toContain(
            CALL_OUTCOME_NODE.Abandoned,
        )
    })
})
