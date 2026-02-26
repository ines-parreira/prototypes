import { mockCustomUserAvailabilityStatus } from '@gorgias/helpdesk-mocks'

import { getCustomUnavailabilityStatusColumnKey } from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityTableConfig'
import { AGENT_AVAILABILITY_COLUMNS } from 'domains/reporting/pages/support-performance/agents/constants'
import { transformAvailabilityData } from 'domains/reporting/pages/support-performance/agents/utils/transformAvailabilityData'
import { agents } from 'fixtures/agents'

const {
    ONLINE_TIME_COLUMN,
    AVAILABLE_STATUS_COLUMN,
    UNAVAILABLE_STATUS_COLUMN,
    ON_CALL_STATUS_COLUMN,
    WRAPPING_UP_STATUS_COLUMN,
} = AGENT_AVAILABILITY_COLUMNS

describe('transformAvailabilityData', () => {
    // Use existing fixture agents (only 2 available in fixture)
    const [mockAgent1, mockAgent2] = agents.slice(0, 2)

    const mockCustomStatus1 = mockCustomUserAvailabilityStatus({
        id: 'custom_1',
        name: 'Lunch Break',
        description: 'Taking a lunch break',
    })

    const mockCustomStatus2 = mockCustomUserAvailabilityStatus({
        id: 'custom_2',
        name: 'Training',
        description: 'In training session',
    })

    describe('agent initialization', () => {
        it('should initialize all agents without any column data', () => {
            const result = transformAvailabilityData(
                [],
                [],
                [mockAgent1, mockAgent2],
                [],
            )

            expect(result).toHaveLength(2)
            expect(result[0]).toEqual({
                id: mockAgent1.id,
                name: mockAgent1.name,
                email: mockAgent1.email,
                avatarUrl: undefined,
            })
            expect(result[1]).toEqual({
                id: mockAgent2.id,
                name: mockAgent2.name,
                email: mockAgent2.email,
                avatarUrl: undefined,
            })
            expect(result[0][ONLINE_TIME_COLUMN]).toBeUndefined()
            expect(result[1][ONLINE_TIME_COLUMN]).toBeUndefined()
            expect(result[0][AVAILABLE_STATUS_COLUMN]).toBeUndefined()
            expect(result[1][AVAILABLE_STATUS_COLUMN]).toBeUndefined()
        })

        it('should handle empty agents array', () => {
            const result = transformAvailabilityData([], [], [], [])

            expect(result).toEqual([])
        })
    })

    describe('online time data mapping', () => {
        it('should map online time data by agent ID', () => {
            const onlineTimeData = [
                { dimension: 1, value: 3600 },
                { dimension: 2, value: 7200 },
            ]

            const result = transformAvailabilityData(
                onlineTimeData,
                [],
                [mockAgent1, mockAgent2],
                [],
            )

            expect(result[0][ONLINE_TIME_COLUMN]).toBe(3600)
            expect(result[1][ONLINE_TIME_COLUMN]).toBe(7200)

            const resultWithStringDimensions = transformAvailabilityData(
                [{ dimension: '1', value: 3600 }],
                [],
                [mockAgent1],
                [],
            )
            expect(resultWithStringDimensions[0][ONLINE_TIME_COLUMN]).toBe(3600)
        })

        it('should ignore online time data with null values', () => {
            const onlineTimeData = [
                { dimension: 1, value: 3600 },
                { dimension: 2, value: null },
            ]

            const result = transformAvailabilityData(
                onlineTimeData,
                [],
                [mockAgent1, mockAgent2],
                [],
            )

            expect(result[0][ONLINE_TIME_COLUMN]).toBe(3600)
            expect(result[1][ONLINE_TIME_COLUMN]).toBeUndefined()
        })

        it('should ignore data for agents not in the list', () => {
            const result = transformAvailabilityData(
                [
                    { dimension: 1, value: 3600 },
                    { dimension: 999, value: 7200 },
                ],
                [
                    {
                        agentId: 1,
                        statusName: 'available',
                        totalDurationSeconds: 1800,
                        onlineDurationSeconds: 1000,
                        offlineDurationSeconds: 800,
                    },
                    {
                        agentId: 999,
                        statusName: 'available',
                        totalDurationSeconds: 900,
                        onlineDurationSeconds: 500,
                        offlineDurationSeconds: 400,
                    },
                ],
                [mockAgent1],
                [],
            )

            expect(result).toHaveLength(1)
            expect(result[0][ONLINE_TIME_COLUMN]).toBe(3600)
            expect(result[0][AVAILABLE_STATUS_COLUMN]).toEqual({
                total: 1800,
                online: 1000,
                offline: 800,
            })
        })
    })

    describe('system statuses mapping', () => {
        it('should map multiple system statuses for the same agent with breakdown', () => {
            const perStatusData = [
                {
                    agentId: 1,
                    statusName: 'available',
                    totalDurationSeconds: 1800,
                    onlineDurationSeconds: 1800,
                    offlineDurationSeconds: 0,
                },
                {
                    agentId: 1,
                    statusName: 'unavailable',
                    totalDurationSeconds: 900,
                    onlineDurationSeconds: 500,
                    offlineDurationSeconds: 400,
                },
                {
                    agentId: 1,
                    statusName: 'on-call',
                    totalDurationSeconds: 1200,
                    onlineDurationSeconds: 1200,
                    offlineDurationSeconds: 0,
                },
                {
                    agentId: 1,
                    statusName: 'wrapping-up',
                    totalDurationSeconds: 600,
                    onlineDurationSeconds: 600,
                    offlineDurationSeconds: 0,
                },
            ]

            const result = transformAvailabilityData(
                [],
                perStatusData,
                [mockAgent1],
                [],
            )

            expect(result[0][AVAILABLE_STATUS_COLUMN]).toEqual({
                total: 1800,
                online: 1800,
                offline: 0,
            })
            expect(result[0][UNAVAILABLE_STATUS_COLUMN]).toEqual({
                total: 900,
                online: 500,
                offline: 400,
            })
            expect(result[0][ON_CALL_STATUS_COLUMN]).toEqual({
                total: 1200,
                online: 1200,
                offline: 0,
            })
            expect(result[0][WRAPPING_UP_STATUS_COLUMN]).toEqual({
                total: 600,
                online: 600,
                offline: 0,
            })
        })
    })

    describe('custom statuses mapping', () => {
        it('should match custom status names case-insensitively', () => {
            const perStatusData = [
                {
                    agentId: 1,
                    statusName: 'lunch break',
                    totalDurationSeconds: 3600,
                    onlineDurationSeconds: 200,
                    offlineDurationSeconds: 3400,
                },
                {
                    agentId: 2,
                    statusName: 'TRAINING',
                    totalDurationSeconds: 1800,
                    onlineDurationSeconds: 100,
                    offlineDurationSeconds: 1700,
                },
            ]

            const result = transformAvailabilityData(
                [],
                perStatusData,
                [mockAgent1, mockAgent2],
                [mockCustomStatus1, mockCustomStatus2],
            )

            const lunchColumnKey =
                getCustomUnavailabilityStatusColumnKey('custom_1')
            const trainingColumnKey =
                getCustomUnavailabilityStatusColumnKey('custom_2')

            expect(result[0][lunchColumnKey]).toEqual({
                total: 3600,
                online: 200,
                offline: 3400,
            })
            expect(result[1][trainingColumnKey]).toEqual({
                total: 1800,
                online: 100,
                offline: 1700,
            })
        })

        it('should map multiple custom statuses for the same agent', () => {
            const perStatusData = [
                {
                    agentId: 1,
                    statusName: 'Lunch Break',
                    totalDurationSeconds: 3600,
                    onlineDurationSeconds: 200,
                    offlineDurationSeconds: 3400,
                },
                {
                    agentId: 1,
                    statusName: 'Training',
                    totalDurationSeconds: 1800,
                    onlineDurationSeconds: 100,
                    offlineDurationSeconds: 1700,
                },
            ]

            const result = transformAvailabilityData(
                [],
                perStatusData,
                [mockAgent1],
                [mockCustomStatus1, mockCustomStatus2],
            )

            const lunchColumnKey =
                getCustomUnavailabilityStatusColumnKey('custom_1')
            const trainingColumnKey =
                getCustomUnavailabilityStatusColumnKey('custom_2')

            expect(result[0][lunchColumnKey]).toEqual({
                total: 3600,
                online: 200,
                offline: 3400,
            })
            expect(result[0][trainingColumnKey]).toEqual({
                total: 1800,
                online: 100,
                offline: 1700,
            })
        })

        it('should handle custom statuses for multiple agents', () => {
            const perStatusData = [
                {
                    agentId: 1,
                    statusName: 'Lunch Break',
                    totalDurationSeconds: 3600,
                    onlineDurationSeconds: 200,
                    offlineDurationSeconds: 3400,
                },
                {
                    agentId: 2,
                    statusName: 'Training',
                    totalDurationSeconds: 1800,
                    onlineDurationSeconds: 100,
                    offlineDurationSeconds: 1700,
                },
                {
                    agentId: 1,
                    statusName: 'Training',
                    totalDurationSeconds: 900,
                    onlineDurationSeconds: 50,
                    offlineDurationSeconds: 850,
                },
            ]

            const result = transformAvailabilityData(
                [],
                perStatusData,
                [mockAgent1, mockAgent2],
                [mockCustomStatus1, mockCustomStatus2],
            )

            const lunchColumnKey =
                getCustomUnavailabilityStatusColumnKey('custom_1')
            const trainingColumnKey =
                getCustomUnavailabilityStatusColumnKey('custom_2')

            expect(result[0][lunchColumnKey]).toEqual({
                total: 3600,
                online: 200,
                offline: 3400,
            })
            expect(result[0][trainingColumnKey]).toEqual({
                total: 900,
                online: 50,
                offline: 850,
            })
            expect(result[1][trainingColumnKey]).toEqual({
                total: 1800,
                online: 100,
                offline: 1700,
            })
        })

        it('should not create columns for custom statuses when status name does not match', () => {
            const perStatusData = [
                { dimension: '1,Unknown Status', value: 3600 },
            ]

            const result = transformAvailabilityData(
                [],
                // @ts-expect-error - perStatusData is not a valid type for StatusDimensionData
                perStatusData,
                [mockAgent1],
                [mockCustomStatus1],
            )

            const unknownColumnKey =
                getCustomUnavailabilityStatusColumnKey('Unknown Status')
            expect(result[0][unknownColumnKey]).toBeUndefined()
        })
    })

    describe('edge cases', () => {
        it('should handle null values in per-status data', () => {
            const perStatusData = [
                {
                    agentId: 1,
                    statusName: 'available',
                    totalDurationSeconds: null,
                    onlineDurationSeconds: null,
                    offlineDurationSeconds: null,
                },
                {
                    agentId: 1,
                    statusName: 'unavailable',
                    totalDurationSeconds: 900,
                    onlineDurationSeconds: 500,
                    offlineDurationSeconds: 400,
                },
            ]

            const result = transformAvailabilityData(
                [],
                perStatusData,
                [mockAgent1],
                [],
            )

            expect(result[0][AVAILABLE_STATUS_COLUMN]).toEqual({
                total: 0,
                online: 0,
                offline: 0,
            })
            expect(result[0][UNAVAILABLE_STATUS_COLUMN]).toEqual({
                total: 900,
                online: 500,
                offline: 400,
            })
        })

        it('should handle missing agentId or statusName', () => {
            const perStatusData = [
                {
                    agentId: null,
                    statusName: 'available',
                    totalDurationSeconds: 1800,
                    onlineDurationSeconds: 1000,
                    offlineDurationSeconds: 800,
                },
                {
                    agentId: 1,
                    statusName: 'unavailable',
                    totalDurationSeconds: 900,
                    onlineDurationSeconds: 500,
                    offlineDurationSeconds: 400,
                },
            ]

            const result = transformAvailabilityData(
                [],
                // @ts-expect-error - perStatusData is not a valid type for StatusDimensionData
                perStatusData,
                [mockAgent1],
                [],
            )

            expect(result[0][AVAILABLE_STATUS_COLUMN]).toBeUndefined()
            expect(result[0][UNAVAILABLE_STATUS_COLUMN]).toEqual({
                total: 900,
                online: 500,
                offline: 400,
            })
        })

        it('should handle agents with no availability data (should still appear)', () => {
            const onlineTimeData = [{ dimension: 1, value: 3600 }]
            const perStatusData = [
                {
                    agentId: 1,
                    statusName: 'available',
                    totalDurationSeconds: 1800,
                    onlineDurationSeconds: 1000,
                    offlineDurationSeconds: 800,
                },
            ]

            const result = transformAvailabilityData(
                onlineTimeData,
                perStatusData,
                [mockAgent1, mockAgent2],
                [],
            )

            expect(result).toHaveLength(2)
            expect(result[0][ONLINE_TIME_COLUMN]).toBe(3600)
            expect(result[1][ONLINE_TIME_COLUMN]).toBeUndefined()
            expect(result[1][AVAILABLE_STATUS_COLUMN]).toBeUndefined()
        })

        it('should handle status names with different casing variations', () => {
            const perStatusData = [
                {
                    agentId: 1,
                    statusName: 'AVAILABLE',
                    totalDurationSeconds: 1000,
                    onlineDurationSeconds: 1000,
                    offlineDurationSeconds: 0,
                },
                {
                    agentId: 2,
                    statusName: 'Available',
                    totalDurationSeconds: 2000,
                    onlineDurationSeconds: 2000,
                    offlineDurationSeconds: 0,
                },
            ]

            const result = transformAvailabilityData(
                [],
                perStatusData,
                [mockAgent1, mockAgent2],
                [],
            )

            expect(result[0][AVAILABLE_STATUS_COLUMN]).toEqual({
                total: 1000,
                online: 1000,
                offline: 0,
            })
            expect(result[1][AVAILABLE_STATUS_COLUMN]).toEqual({
                total: 2000,
                online: 2000,
                offline: 0,
            })
        })

        it('should handle missing custom status IDs (unknown status names)', () => {
            const perStatusData = [
                {
                    agentId: 1,
                    statusName: 'Lunch Break',
                    totalDurationSeconds: 3600,
                    onlineDurationSeconds: 200,
                    offlineDurationSeconds: 3400,
                },
                {
                    agentId: 1,
                    statusName: 'Unknown Status',
                    totalDurationSeconds: 900,
                    onlineDurationSeconds: 100,
                    offlineDurationSeconds: 800,
                },
            ]

            const result = transformAvailabilityData(
                [],
                perStatusData,
                [mockAgent1],
                [mockCustomStatus1],
            )

            const lunchColumnKey =
                getCustomUnavailabilityStatusColumnKey('custom_1')
            const unknownColumnKey = 'agent_status_unknown status'

            expect(result[0][lunchColumnKey]).toEqual({
                total: 3600,
                online: 200,
                offline: 3400,
            })
            expect(result[0][unknownColumnKey]).toEqual({
                total: 900,
                online: 100,
                offline: 800,
            })
        })
    })

    describe('complete integration scenarios', () => {
        it('should transform complete availability data correctly', () => {
            const onlineTimeData = [
                { dimension: 1, value: 7200 },
                { dimension: 2, value: 6400 },
            ]

            const perStatusData = [
                {
                    agentId: 1,
                    statusName: 'available',
                    totalDurationSeconds: 3600,
                    onlineDurationSeconds: 3600,
                    offlineDurationSeconds: 0,
                },
                {
                    agentId: 1,
                    statusName: 'unavailable',
                    totalDurationSeconds: 1800,
                    onlineDurationSeconds: 1000,
                    offlineDurationSeconds: 800,
                },
                {
                    agentId: 1,
                    statusName: 'Lunch Break',
                    totalDurationSeconds: 1200,
                    onlineDurationSeconds: 100,
                    offlineDurationSeconds: 1100,
                },
                {
                    agentId: 2,
                    statusName: 'available',
                    totalDurationSeconds: 4000,
                    onlineDurationSeconds: 4000,
                    offlineDurationSeconds: 0,
                },
                {
                    agentId: 2,
                    statusName: 'on-call',
                    totalDurationSeconds: 1200,
                    onlineDurationSeconds: 1200,
                    offlineDurationSeconds: 0,
                },
                {
                    agentId: 2,
                    statusName: 'Training',
                    totalDurationSeconds: 800,
                    onlineDurationSeconds: 50,
                    offlineDurationSeconds: 750,
                },
            ]

            const result = transformAvailabilityData(
                onlineTimeData,
                perStatusData,
                [mockAgent1, mockAgent2],
                [mockCustomStatus1, mockCustomStatus2],
            )

            const lunchColumnKey =
                getCustomUnavailabilityStatusColumnKey('custom_1')
            const trainingColumnKey =
                getCustomUnavailabilityStatusColumnKey('custom_2')

            expect(result).toHaveLength(2)
            expect(result[0]).toEqual({
                id: mockAgent1.id,
                name: mockAgent1.name,
                email: mockAgent1.email,
                avatarUrl: undefined,
                [ONLINE_TIME_COLUMN]: 7200,
                [AVAILABLE_STATUS_COLUMN]: {
                    total: 3600,
                    online: 3600,
                    offline: 0,
                },
                [UNAVAILABLE_STATUS_COLUMN]: {
                    total: 1800,
                    online: 1000,
                    offline: 800,
                },
                [lunchColumnKey]: {
                    total: 1200,
                    online: 100,
                    offline: 1100,
                },
            })

            expect(result[1]).toEqual({
                id: mockAgent2.id,
                name: mockAgent2.name,
                email: mockAgent2.email,
                avatarUrl: undefined,
                [ONLINE_TIME_COLUMN]: 6400,
                [AVAILABLE_STATUS_COLUMN]: {
                    total: 4000,
                    online: 4000,
                    offline: 0,
                },
                [ON_CALL_STATUS_COLUMN]: {
                    total: 1200,
                    online: 1200,
                    offline: 0,
                },
                [trainingColumnKey]: {
                    total: 800,
                    online: 50,
                    offline: 750,
                },
            })
        })
    })
})
