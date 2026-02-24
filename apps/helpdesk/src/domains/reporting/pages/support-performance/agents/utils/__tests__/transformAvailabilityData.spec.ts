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
        it('should initialize all agents with default values from fixedAgentAvailabilityColumnsInitialData', () => {
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
                [AVAILABLE_STATUS_COLUMN]: 0,
                [UNAVAILABLE_STATUS_COLUMN]: 0,
                [ON_CALL_STATUS_COLUMN]: 0,
                [WRAPPING_UP_STATUS_COLUMN]: 0,
            })
            expect(result[1]).toEqual({
                id: mockAgent2.id,
                name: mockAgent2.name,
                email: mockAgent2.email,
                avatarUrl: undefined,
                [AVAILABLE_STATUS_COLUMN]: 0,
                [UNAVAILABLE_STATUS_COLUMN]: 0,
                [ON_CALL_STATUS_COLUMN]: 0,
                [WRAPPING_UP_STATUS_COLUMN]: 0,
            })
            expect(result[0][ONLINE_TIME_COLUMN]).toBeUndefined()
            expect(result[1][ONLINE_TIME_COLUMN]).toBeUndefined()
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
                    { dimension: '1,available', value: 1800 },
                    { dimension: '999,available', value: 900 },
                ],
                [mockAgent1],
                [],
            )

            expect(result).toHaveLength(1)
            expect(result[0][ONLINE_TIME_COLUMN]).toBe(3600)
            expect(result[0][AVAILABLE_STATUS_COLUMN]).toBe(1800)
        })
    })

    describe('system statuses mapping', () => {
        it('should map multiple system statuses for the same agent', () => {
            const perStatusData = [
                { dimension: '1,available', value: 1800 },
                { dimension: '1,unavailable', value: 900 },
                { dimension: '1,on-call', value: 1200 },
                { dimension: '1,wrapping-up', value: 600 },
            ]

            const result = transformAvailabilityData(
                [],
                perStatusData,
                [mockAgent1],
                [],
            )

            expect(result[0][AVAILABLE_STATUS_COLUMN]).toBe(1800)
            expect(result[0][UNAVAILABLE_STATUS_COLUMN]).toBe(900)
            expect(result[0][ON_CALL_STATUS_COLUMN]).toBe(1200)
            expect(result[0][WRAPPING_UP_STATUS_COLUMN]).toBe(600)
        })
    })

    describe('custom statuses mapping', () => {
        it('should match custom status names case-insensitively', () => {
            const perStatusData = [
                { dimension: '1,lunch break', value: 3600 },
                { dimension: '2,TRAINING', value: 1800 },
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

            expect(result[0][lunchColumnKey]).toBe(3600)
            expect(result[1][trainingColumnKey]).toBe(1800)
        })

        it('should map multiple custom statuses for the same agent', () => {
            const perStatusData = [
                { dimension: '1,Lunch Break', value: 3600 },
                { dimension: '1,Training', value: 1800 },
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

            expect(result[0][lunchColumnKey]).toBe(3600)
            expect(result[0][trainingColumnKey]).toBe(1800)
        })

        it('should handle custom statuses for multiple agents', () => {
            const perStatusData = [
                { dimension: '1,Lunch Break', value: 3600 },
                { dimension: '2,Training', value: 1800 },
                { dimension: '1,Training', value: 900 },
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

            expect(result[0][lunchColumnKey]).toBe(3600)
            expect(result[0][trainingColumnKey]).toBe(900)
            expect(result[1][trainingColumnKey]).toBe(1800)
        })

        it('should not create columns for custom statuses when status name does not match', () => {
            const perStatusData = [
                { dimension: '1,Unknown Status', value: 3600 },
            ]

            const result = transformAvailabilityData(
                [],
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
                { dimension: '1,available', value: null },
                { dimension: '1,unavailable', value: 900 },
            ]

            const result = transformAvailabilityData(
                [],
                perStatusData,
                [mockAgent1],
                [],
            )

            expect(result[0][AVAILABLE_STATUS_COLUMN]).toBe(0)
            expect(result[0][UNAVAILABLE_STATUS_COLUMN]).toBe(900)
        })

        it('should handle malformed dimension format (no comma)', () => {
            const perStatusData = [
                { dimension: '1available', value: 1800 },
                { dimension: '1,unavailable', value: 900 },
            ]

            const result = transformAvailabilityData(
                [],
                perStatusData,
                [mockAgent1],
                [],
            )

            expect(result[0][UNAVAILABLE_STATUS_COLUMN]).toBe(900)
        })

        it('should handle dimension with only agent ID (empty status name)', () => {
            const perStatusData = [
                { dimension: '1,', value: 1800 },
                { dimension: '1,available', value: 900 },
            ]

            const result = transformAvailabilityData(
                [],
                perStatusData,
                [mockAgent1],
                [],
            )

            expect(result[0][AVAILABLE_STATUS_COLUMN]).toBe(900)
        })

        it('should handle agents with no availability data (should still appear with zeros)', () => {
            const onlineTimeData = [{ dimension: 1, value: 3600 }]
            const perStatusData = [{ dimension: '1,available', value: 1800 }]

            const result = transformAvailabilityData(
                onlineTimeData,
                perStatusData,
                [mockAgent1, mockAgent2],
                [],
            )

            expect(result).toHaveLength(2)
            expect(result[0][ONLINE_TIME_COLUMN]).toBe(3600)
            expect(result[1][ONLINE_TIME_COLUMN]).toBeUndefined()
            expect(result[1][AVAILABLE_STATUS_COLUMN]).toBe(0)
        })

        it('should handle status names with different casing variations', () => {
            const perStatusData = [
                { dimension: '1,AVAILABLE', value: 1000 },
                { dimension: '2,Available', value: 2000 },
            ]

            const result = transformAvailabilityData(
                [],
                perStatusData,
                [mockAgent1, mockAgent2],
                [],
            )

            expect(result[0][AVAILABLE_STATUS_COLUMN]).toBe(1000)
            expect(result[1][AVAILABLE_STATUS_COLUMN]).toBe(2000)
        })

        it('should handle missing custom status IDs (unknown status names)', () => {
            const perStatusData = [
                { dimension: '1,Lunch Break', value: 3600 },
                { dimension: '1,Unknown Status', value: 900 },
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

            expect(result[0][lunchColumnKey]).toBe(3600)
            expect(result[0][unknownColumnKey]).toBe(900)
        })
    })

    describe('complete integration scenarios', () => {
        it('should transform complete availability data correctly', () => {
            const onlineTimeData = [
                { dimension: 1, value: 7200 },
                { dimension: 2, value: 6400 },
            ]

            const perStatusData = [
                { dimension: '1,available', value: 3600 },
                { dimension: '1,unavailable', value: 1800 },
                { dimension: '1,Lunch Break', value: 1200 },
                { dimension: '2,available', value: 4000 },
                { dimension: '2,on-call', value: 1200 },
                { dimension: '2,Training', value: 800 },
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
                [AVAILABLE_STATUS_COLUMN]: 3600,
                [UNAVAILABLE_STATUS_COLUMN]: 1800,
                [ON_CALL_STATUS_COLUMN]: 0,
                [WRAPPING_UP_STATUS_COLUMN]: 0,
                [lunchColumnKey]: 1200,
            })

            expect(result[1]).toEqual({
                id: mockAgent2.id,
                name: mockAgent2.name,
                email: mockAgent2.email,
                avatarUrl: undefined,
                [ONLINE_TIME_COLUMN]: 6400,
                [AVAILABLE_STATUS_COLUMN]: 4000,
                [UNAVAILABLE_STATUS_COLUMN]: 0,
                [ON_CALL_STATUS_COLUMN]: 1200,
                [WRAPPING_UP_STATUS_COLUMN]: 0,
                [trainingColumnKey]: 800,
            })
        })
    })
})
