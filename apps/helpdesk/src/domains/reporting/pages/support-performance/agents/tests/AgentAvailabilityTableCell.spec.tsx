import {
    getColumnValue,
    isStatusBreakdown,
} from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityTableCell'
import type { StatusBreakdown } from 'domains/reporting/pages/support-performance/agents/utils/transformAvailabilityData'

describe('AgentAvailabilityTableCell Utilities', () => {
    describe('getColumnValue', () => {
        it('should return undefined for undefined input', () => {
            expect(getColumnValue(undefined)).toBeUndefined()
        })

        it('should return the number for number input', () => {
            expect(getColumnValue(3600)).toBe(3600)
        })

        it('should return zero for zero input', () => {
            expect(getColumnValue(0)).toBe(0)
        })

        it('should return total from StatusBreakdown object', () => {
            const breakdown: StatusBreakdown = {
                total: 1800,
                online: 1000,
                offline: 800,
            }
            expect(getColumnValue(breakdown)).toBe(1800)
        })

        it('should return zero total from StatusBreakdown with zero values', () => {
            const breakdown: StatusBreakdown = {
                total: 0,
                online: 0,
                offline: 0,
            }
            expect(getColumnValue(breakdown)).toBe(0)
        })
    })

    describe('isStatusBreakdown', () => {
        it('should return false for undefined', () => {
            expect(isStatusBreakdown(undefined)).toBe(false)
        })

        it('should return false for number', () => {
            expect(isStatusBreakdown(3600)).toBe(false)
        })

        it('should return false for zero', () => {
            expect(isStatusBreakdown(0)).toBe(false)
        })

        it('should return true for StatusBreakdown object', () => {
            const breakdown: StatusBreakdown = {
                total: 1800,
                online: 1000,
                offline: 800,
            }
            expect(isStatusBreakdown(breakdown)).toBe(true)
        })

        it('should return true for StatusBreakdown with zero values', () => {
            const breakdown: StatusBreakdown = {
                total: 0,
                online: 0,
                offline: 0,
            }
            expect(isStatusBreakdown(breakdown)).toBe(true)
        })

        it('should return false for null', () => {
            // @ts-expect-error - null is not a valid type for isStatusBreakdown
            expect(isStatusBreakdown(null)).toBe(false)
        })

        it('should return false for object without total property', () => {
            const notBreakdown = { online: 100, offline: 200 }
            expect(isStatusBreakdown(notBreakdown as any)).toBe(false)
        })

        it('should handle objects with extra properties', () => {
            const breakdown = {
                total: 1800,
                online: 1000,
                offline: 800,
                extraProp: 'test',
            }
            expect(isStatusBreakdown(breakdown as any)).toBe(true)
        })
    })
})
