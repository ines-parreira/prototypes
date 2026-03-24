import type { CustomUserAvailabilityStatus } from '@gorgias/helpdesk-types'

import {
    getAvailabilityTableColumnsOrder,
    getColumnAlignment,
    getColumnConfig,
    getColumnWidth,
    getCustomUnavailabilityStatusColumnKey,
} from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityTableConfig'
import {
    AGENT_NAME_COLUMN_WIDTH,
    METRIC_COLUMN_WIDTH,
    MOBILE_AGENT_NAME_COLUMN_WIDTH,
    MOBILE_METRIC_COLUMN_WIDTH,
} from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import {
    AGENT_AVAILABILITY_COLUMNS,
    FIXED_AGENT_AVAILABILITY_COLUMN_CONFIG,
    ORDERED_FIXED_AGENT_AVAILABILITY_COLUMNS,
} from 'domains/reporting/pages/support-performance/agents/constants'
import * as mobileUtils from 'pages/common/utils/mobile'

const { AGENT_NAME_COLUMN, ONLINE_TIME_COLUMN, AVAILABLE_STATUS_COLUMN } =
    AGENT_AVAILABILITY_COLUMNS

jest.mock('pages/common/utils/mobile', () => ({
    isMediumOrSmallScreen: jest.fn(),
    isExtraLargeScreen: jest.fn(() => false),
}))

describe('AgentAvailabilityTableConfig', () => {
    describe('getCustomUnavailabilityStatusColumnKey', () => {
        it('should return formatted column key with agent_status_ prefix', () => {
            expect(getCustomUnavailabilityStatusColumnKey('available')).toBe(
                'agent_status_available',
            )
            expect(getCustomUnavailabilityStatusColumnKey('lunch_break')).toBe(
                'agent_status_lunch_break',
            )
        })
    })

    describe('getAvailabilityTableColumnsOrder', () => {
        it('should return fixed columns when no custom statuses provided', () => {
            expect(getAvailabilityTableColumnsOrder(undefined)).toEqual(
                ORDERED_FIXED_AGENT_AVAILABILITY_COLUMNS,
            )
            expect(getAvailabilityTableColumnsOrder([])).toEqual(
                ORDERED_FIXED_AGENT_AVAILABILITY_COLUMNS,
            )
        })

        it('should append custom status columns in order', () => {
            const customStatuses: CustomUserAvailabilityStatus[] = [
                {
                    id: 'lunch_break',
                    name: 'Lunch Break',
                    description: 'Taking lunch',
                } as CustomUserAvailabilityStatus,
                {
                    id: 'meeting',
                    name: 'In Meeting',
                    description: 'Attending meeting',
                } as CustomUserAvailabilityStatus,
            ]

            const result = getAvailabilityTableColumnsOrder(customStatuses)

            expect(result).toEqual([
                ...ORDERED_FIXED_AGENT_AVAILABILITY_COLUMNS,
                'agent_status_lunch_break',
                'agent_status_meeting',
            ])
        })
    })

    describe('getColumnConfig', () => {
        it('should return fixed config when no custom statuses provided', () => {
            expect(getColumnConfig(undefined)).toEqual(
                FIXED_AGENT_AVAILABILITY_COLUMN_CONFIG,
            )
        })

        it('should return the updated fixed tooltip copy for system columns', () => {
            const result = getColumnConfig(undefined)

            expect(result[ONLINE_TIME_COLUMN].hint).toEqual({
                title: 'Total time the agent had at least one Gorgias tab open during the period. This is the sum of Available and Unavailable time. Only affected by the date and agent filter.',
            })
        })

        it('should merge custom statuses with hint when description provided', () => {
            const customStatuses: CustomUserAvailabilityStatus[] = [
                {
                    id: 'lunch',
                    name: 'Lunch Break',
                    description: 'Taking a lunch break',
                } as CustomUserAvailabilityStatus,
            ]

            const result = getColumnConfig(customStatuses)

            expect(result.agent_status_lunch).toEqual({
                format: 'duration',
                label: 'Lunch Break',
                hint: {
                    title: 'Taking a lunch break',
                    link: '',
                },
            })
        })

        it('should set hint to null when no description', () => {
            const customStatuses: CustomUserAvailabilityStatus[] = [
                {
                    id: 'break',
                    name: 'Break',
                    description: '',
                } as CustomUserAvailabilityStatus,
            ]

            const result = getColumnConfig(customStatuses)

            expect(result.agent_status_break.hint).toBeNull()
        })
    })

    describe('getColumnWidth', () => {
        beforeEach(() => {
            jest.clearAllMocks()
        })

        it('should return desktop widths when not mobile', () => {
            jest.spyOn(mobileUtils, 'isMediumOrSmallScreen').mockReturnValue(
                false,
            )

            expect(getColumnWidth(AGENT_NAME_COLUMN)).toBe(
                AGENT_NAME_COLUMN_WIDTH,
            )
            expect(getColumnWidth(ONLINE_TIME_COLUMN)).toBe(METRIC_COLUMN_WIDTH)
        })

        it('should return mobile widths on small screens', () => {
            jest.spyOn(mobileUtils, 'isMediumOrSmallScreen').mockReturnValue(
                true,
            )

            expect(getColumnWidth(AGENT_NAME_COLUMN)).toBe(
                MOBILE_AGENT_NAME_COLUMN_WIDTH,
            )
            expect(getColumnWidth(ONLINE_TIME_COLUMN)).toBe(
                MOBILE_METRIC_COLUMN_WIDTH,
            )
        })
    })

    describe('getColumnAlignment', () => {
        it('should return "left" for agent_name, "right" for metrics', () => {
            expect(getColumnAlignment(AGENT_NAME_COLUMN)).toBe('left')
            expect(getColumnAlignment(ONLINE_TIME_COLUMN)).toBe('right')
            expect(getColumnAlignment(AVAILABLE_STATUS_COLUMN)).toBe('right')
        })
    })
})
