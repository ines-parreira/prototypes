import { mockCustomUserAvailabilityStatus } from '@gorgias/helpdesk-mocks'
import type { CustomUserAvailabilityStatus } from '@gorgias/helpdesk-queries'

import { AGENT_AVAILABILITY_COLUMNS } from 'domains/reporting/pages/support-performance/agents/constants'
import type { AgentAvailabilityData } from 'domains/reporting/pages/support-performance/agents/utils'
import {
    createAgentsAvailabilityReport,
    SUMMARY_ROW_AGENT_COLUMN_LABEL,
    TOTAL_ROW_AGENT_COLUMN_LABEL,
} from 'domains/reporting/services/agentsAvailabilityReportingService'

const {
    ONLINE_TIME_COLUMN,
    AVAILABLE_STATUS_COLUMN,
    UNAVAILABLE_STATUS_COLUMN,
    ON_CALL_STATUS_COLUMN,
    WRAPPING_UP_STATUS_COLUMN,
} = AGENT_AVAILABILITY_COLUMNS

describe('agentsAvailabilityReportingService', () => {
    const mockCustomStatuses: CustomUserAvailabilityStatus[] = [
        mockCustomUserAvailabilityStatus({
            id: '1',
            name: 'Coffee Break',
            description: 'On a coffee break',
        }),
        mockCustomUserAvailabilityStatus({
            id: '2',
            name: 'Meeting',
            description: 'In a meeting',
        }),
    ]

    const createMockAgent = (
        id: number,
        name: string,
        onlineTime: number,
        statusOverrides: Partial<AgentAvailabilityData> = {},
    ): AgentAvailabilityData => ({
        id,
        name,
        email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
        [ONLINE_TIME_COLUMN]: onlineTime,
        [AVAILABLE_STATUS_COLUMN]: { total: 0, online: 0, offline: 0 },
        [UNAVAILABLE_STATUS_COLUMN]: { total: 0, online: 0, offline: 0 },
        [ON_CALL_STATUS_COLUMN]: { total: 0, online: 0, offline: 0 },
        [WRAPPING_UP_STATUS_COLUMN]: { total: 0, online: 0, offline: 0 },
        ...statusOverrides,
    })

    describe('createAgentsAvailabilityReport', () => {
        it('should create CSV with no data message when agents array is empty', () => {
            const result = createAgentsAvailabilityReport(
                [],
                mockCustomStatuses,
                'test-file',
            )

            expect(result.files['test-file']).toBeDefined()
            expect(result.files['test-file']).toContain('No data available')
        })

        describe('headers', () => {
            it('should create CSV with correct headers including custom statuses', () => {
                const agents = [
                    createMockAgent(1, 'John Doe', 3600000, {
                        agent_status_1: {
                            total: 200000,
                            online: 0,
                            offline: 0,
                        },
                        agent_status_2: {
                            total: 100000,
                            online: 0,
                            offline: 0,
                        },
                    }),
                ]

                const result = createAgentsAvailabilityReport(
                    agents,
                    mockCustomStatuses,
                    'test-file',
                )

                const csv = result.files['test-file']
                expect(csv).toContain('Agent Name')
                expect(csv).toContain('Online Time')
                expect(csv).toContain('Available')
                expect(csv).toContain('Unavailable')
                expect(csv).toContain('On a call')
                expect(csv).toContain('Call wrap-up')
                expect(csv).toContain('Coffee Break')
                expect(csv).toContain('Meeting')
            })

            it('should only include system status headers when no custom statuses', () => {
                const agents = [createMockAgent(1, 'John Doe', 3600000)]

                const result = createAgentsAvailabilityReport(
                    agents,
                    [],
                    'test-file',
                )

                const csv = result.files['test-file']
                expect(csv).toContain('Agent Name')
                expect(csv).toContain('Online Time')
                expect(csv).toContain('Available')
                expect(csv).toContain('Unavailable')
                expect(csv).not.toContain('Coffee Break')
                expect(csv).not.toContain('Meeting')
            })
        })

        describe('summary rows', () => {
            it('should include Total and Average summary rows', () => {
                const agents = [
                    createMockAgent(1, 'John Doe', 3600000, {
                        [AVAILABLE_STATUS_COLUMN]: {
                            total: 1800000,
                            online: 0,
                            offline: 0,
                        },
                    }),
                    createMockAgent(2, 'Jane Smith', 7200000, {
                        [AVAILABLE_STATUS_COLUMN]: {
                            total: 3600000,
                            online: 0,
                            offline: 0,
                        },
                    }),
                ]

                const result = createAgentsAvailabilityReport(
                    agents,
                    [],
                    'test-file',
                )

                const csv = result.files['test-file']
                expect(csv).toContain(TOTAL_ROW_AGENT_COLUMN_LABEL)
                expect(csv).toContain(SUMMARY_ROW_AGENT_COLUMN_LABEL)
            })
        })

        describe('agent rows', () => {
            it('should include all agent rows after summary rows', () => {
                const agents = [
                    createMockAgent(1, 'John Doe', 3600000),
                    createMockAgent(2, 'Jane Smith', 7200000),
                    createMockAgent(3, 'Bob Johnson', 1800000),
                ]

                const result = createAgentsAvailabilityReport(
                    agents,
                    [],
                    'test-file',
                )

                const csv = result.files['test-file']
                expect(csv).toContain('John Doe')
                expect(csv).toContain('Jane Smith')
                expect(csv).toContain('Bob Johnson')
            })
        })

        describe('data handling', () => {
            it('should handle mixed StatusBreakdown objects and numeric values', () => {
                const agents: AgentAvailabilityData[] = [
                    {
                        id: 1,
                        name: 'John Doe',
                        email: 'john@example.com',
                        [ONLINE_TIME_COLUMN]: 3600000,
                        [AVAILABLE_STATUS_COLUMN]: {
                            total: 1800000,
                            online: 0,
                            offline: 0,
                        },
                        [UNAVAILABLE_STATUS_COLUMN]: 900000,
                        [ON_CALL_STATUS_COLUMN]: {
                            total: 600000,
                            online: 0,
                            offline: 0,
                        },
                        [WRAPPING_UP_STATUS_COLUMN]: 300000,
                    },
                ]

                const result = createAgentsAvailabilityReport(
                    agents,
                    [],
                    'test-file',
                )

                expect(result.files['test-file']).toBeDefined()
                const csv = result.files['test-file']
                expect(csv).toContain('John Doe')
            })

            it('should handle null and undefined values by treating them as 0', () => {
                const agents: AgentAvailabilityData[] = [
                    {
                        id: 1,
                        name: 'John Doe',
                        email: 'john@example.com',
                        [ONLINE_TIME_COLUMN]: undefined as any,
                        [AVAILABLE_STATUS_COLUMN]: undefined as any,
                        [UNAVAILABLE_STATUS_COLUMN]: {
                            total: undefined as any,
                            online: 0,
                            offline: 0,
                        },
                        [ON_CALL_STATUS_COLUMN]: {
                            total: 0,
                            online: 0,
                            offline: 0,
                        },
                        [WRAPPING_UP_STATUS_COLUMN]: {
                            total: 0,
                            online: 0,
                            offline: 0,
                        },
                    },
                    {
                        id: 2,
                        name: 'Jane Smith',
                        email: 'jane@example.com',
                        [ONLINE_TIME_COLUMN]: NaN as any,
                        [AVAILABLE_STATUS_COLUMN]: {
                            total: NaN as any,
                            online: 0,
                            offline: 0,
                        },
                        [UNAVAILABLE_STATUS_COLUMN]: {
                            total: 0,
                            online: 0,
                            offline: 0,
                        },
                        [ON_CALL_STATUS_COLUMN]: {
                            total: 0,
                            online: 0,
                            offline: 0,
                        },
                        [WRAPPING_UP_STATUS_COLUMN]: {
                            total: 0,
                            online: 0,
                            offline: 0,
                        },
                    },
                ]

                const result = createAgentsAvailabilityReport(
                    agents,
                    [],
                    'test-file',
                )

                expect(result.files['test-file']).toBeDefined()
                const csv = result.files['test-file']
                expect(csv).toContain('John Doe')
                expect(csv).toContain('Jane Smith')
                expect(csv).toContain('0s') // NaN/undefined values formatted as 0
            })
        })
    })
})
