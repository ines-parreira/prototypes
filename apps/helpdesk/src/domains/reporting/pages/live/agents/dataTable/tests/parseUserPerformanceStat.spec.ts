import type {
    AnyStatAxisValue,
    AnyStatLine,
    Stat,
    TwoDimensionalChart,
} from 'domains/reporting/models/stat/types'
import { StatType } from 'domains/reporting/models/stat/types'
import { parseUserPerformanceStat } from 'domains/reporting/pages/live/agents/dataTable/utils/parseUserPerformanceStat'
import { totalMessagesSent, userPerformanceOverview } from 'fixtures/stats'

const AGENT_AXIS = { name: 'Agent', type: StatType.User } as const

const buildStat = (
    x: AnyStatAxisValue[],
    lines: AnyStatLine[],
): Stat<TwoDimensionalChart> => ({
    data: {
        label: 'users-performance-overview',
        data: { axes: { x }, lines },
    },
    meta: {},
})

describe('parseUserPerformanceStat', () => {
    it('returns empty result for missing data', () => {
        expect(parseUserPerformanceStat(null)).toEqual({
            metricAxes: [],
            byUserId: new Map(),
        })
    })

    it('returns empty result for a stat that is not a two-dimensional chart', () => {
        expect(parseUserPerformanceStat(totalMessagesSent)).toEqual({
            metricAxes: [],
            byUserId: new Map(),
        })
    })

    it('ignores axis entries that are not name/type objects', () => {
        const { metricAxes } = parseUserPerformanceStat(
            buildStat(
                [
                    AGENT_AXIS,
                    1637190000,
                    { name: 'Tickets closed', type: StatType.Number },
                ],
                [],
            ),
        )

        expect(metricAxes).toEqual([
            { name: 'Tickets closed', type: StatType.Number },
        ])
    })

    it('skips lines that are not cell arrays', () => {
        const { byUserId } = parseUserPerformanceStat(
            buildStat(
                [AGENT_AXIS, { name: 'Tickets closed', type: StatType.Number }],
                [
                    { name: 'series', data: [1, 2] },
                    [
                        { type: StatType.User, value: { name: 'A', id: 7 } },
                        { type: StatType.Number, value: 5 },
                    ],
                ],
            ),
        )

        expect([...byUserId.keys()]).toEqual([7])
        expect(byUserId.get(7)?.['Tickets closed']).toEqual({
            type: StatType.Number,
            value: 5,
        })
    })

    it('skips lines without a valid user id', () => {
        const { byUserId } = parseUserPerformanceStat(
            buildStat(
                [AGENT_AXIS, { name: 'Tickets closed', type: StatType.Number }],
                [
                    [
                        {
                            type: StatType.User,
                            value: { name: 'Ghost', id: 0 },
                        },
                        { type: StatType.Number, value: 3 },
                    ],
                ],
            ),
        )

        expect(byUserId.size).toBe(0)
    })

    it('stores null for non-scalar metric values', () => {
        const { byUserId } = parseUserPerformanceStat(
            buildStat(
                [AGENT_AXIS, { name: 'Tickets closed', type: StatType.Number }],
                [
                    [
                        { type: StatType.User, value: { name: 'A', id: 7 } },
                        { type: StatType.Date, value: null },
                    ],
                ],
            ),
        )

        expect(byUserId.get(7)?.['Tickets closed']).toEqual({
            type: StatType.Number,
            value: null,
        })
    })

    it('builds the open-tickets breakdown and drops non-numeric channel counts', () => {
        const { byUserId } = parseUserPerformanceStat(
            buildStat(
                [
                    AGENT_AXIS,
                    { name: 'Open tickets', type: StatType.Number },
                    { name: 'Open tickets per channel', type: StatType.Object },
                ],
                [
                    [
                        { type: StatType.User, value: { name: 'A', id: 7 } },
                        { type: StatType.Number, value: 8 },
                        {
                            type: StatType.Object,
                            value: { chat: 5, email: 'nope', phone: 3 },
                        },
                    ],
                ],
            ),
        )

        expect(byUserId.get(7)?.['Open tickets']).toEqual({
            type: StatType.TicketDetails,
            value: 8,
            details: { chat: 5, phone: 3 },
        })
    })

    it('defaults the open-tickets breakdown to empty without a per-channel column', () => {
        const { byUserId } = parseUserPerformanceStat(
            buildStat(
                [AGENT_AXIS, { name: 'Open tickets', type: StatType.Number }],
                [
                    [
                        { type: StatType.User, value: { name: 'A', id: 7 } },
                        { type: StatType.Number, value: 4 },
                    ],
                ],
            ),
        )

        expect(byUserId.get(7)?.['Open tickets']).toEqual({
            type: StatType.TicketDetails,
            value: 4,
            details: {},
        })
    })

    it('reshapes the stat into metric axes without the user, online, and folded columns', () => {
        const { metricAxes } = parseUserPerformanceStat(userPerformanceOverview)

        expect(metricAxes).toEqual([
            { name: 'Tickets closed', type: StatType.Number },
            { name: 'Messages sent', type: StatType.Number },
            { name: 'Open tickets', type: StatType.TicketDetails },
        ])
    })

    it('keys normalized metrics by user id', () => {
        const { byUserId } = parseUserPerformanceStat(userPerformanceOverview)
        const metrics = byUserId.get(1)

        expect(metrics?.['Tickets closed']).toEqual({
            type: StatType.Number,
            value: 0,
        })
        expect(metrics?.['Open tickets']).toEqual({
            type: StatType.TicketDetails,
            value: 134,
            details: expect.objectContaining({ chat: 102, email: 26 }),
        })
    })
})
