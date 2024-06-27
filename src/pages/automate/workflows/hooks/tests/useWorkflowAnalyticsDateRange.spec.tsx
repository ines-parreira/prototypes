import {renderHook} from '@testing-library/react-hooks'
import useWorkflowAnalyticsDateRange from '../useWorkflowAnalyticsDateRange'

describe('useWorkflowAnalyticsDateRange', () => {
    const start_datetime = '2024-01-01'
    const end_datetime = '2024-01-31'

    it('should return the initial date range when no flow_update_datetime is provided', () => {
        const {result} = renderHook(() =>
            useWorkflowAnalyticsDateRange({start_datetime, end_datetime})
        )

        expect(result.current.start_datetime).toBe(start_datetime)
        expect(result.current.end_datetime).toBe(end_datetime)
    })

    it('should return the initial date range when flow_update_datetime is before start_datetime', () => {
        const flow_update_datetime = '2023-12-25'
        const {result} = renderHook(() =>
            useWorkflowAnalyticsDateRange({
                start_datetime,
                end_datetime,
                flow_update_datetime,
            })
        )

        expect(result.current.start_datetime).toBe(start_datetime)
        expect(result.current.end_datetime).toBe(end_datetime)
    })

    it('should set start_datetime to flow_update_datetime when it is between start_datetime and end_datetime', () => {
        const flow_update_datetime = '2024-01-15'
        const {result} = renderHook(() =>
            useWorkflowAnalyticsDateRange({
                start_datetime,
                end_datetime,
                flow_update_datetime,
            })
        )

        expect(result.current.start_datetime).toBe(flow_update_datetime)
        expect(result.current.end_datetime).toBe(end_datetime)
    })

    it('should set end_datetime to today when flow_update_datetime is after end_datetime', () => {
        const flow_update_datetime = '2024-02-10'
        const {result} = renderHook(() =>
            useWorkflowAnalyticsDateRange({
                start_datetime,
                end_datetime,
                flow_update_datetime,
            })
        )

        const today = new Date().toISOString().split('T')[0]
        expect(result.current.start_datetime).toBe(flow_update_datetime)
        expect(result.current.end_datetime).toBe(today)
    })
})
