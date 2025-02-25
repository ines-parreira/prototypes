import { renderHook } from '@testing-library/react-hooks'

import useWorkflowAnalyticsDisplayBanner from '../useWorkflowAnalyticsDisplayBanner'

describe('useWorkflowAnalyticsDisplayBanner', () => {
    it('should display no data available banner when no data is available', () => {
        const { result } = renderHook(() =>
            useWorkflowAnalyticsDisplayBanner({
                flowUpdateDatetime: '2024-02-01T00:00:00Z',
                startDatetime: '2024-01-01T00:00:00Z',
                hasDataAvailable: false,
                previousRoute:
                    '/app/automation/shopify/myshop/flows/edit/flow1',
            }),
        )

        expect(result.current.displayNoDataAvailableBanner).toBe(true)
        expect(result.current.displayMultipleVersionsBanner).toBe(false)
        expect(result.current.displayLegacyDataBanner).toBe(false)
    })

    it('should display multiple version banner when previous route was performance by feature and flow update date is after start date', () => {
        const { result } = renderHook(() =>
            useWorkflowAnalyticsDisplayBanner({
                flowUpdateDatetime: '2024-02-01T00:00:00Z',
                startDatetime: '2024-01-01T00:00:00Z',
                hasDataAvailable: true,
                previousRoute: 'stats-automate-performance-by-features',
            }),
        )

        expect(result.current.displayNoDataAvailableBanner).toBe(false)
        expect(result.current.displayMultipleVersionsBanner).toBe(true)
        expect(result.current.displayLegacyDataBanner).toBe(false)
    })

    it('should display legacy data banner when flow update date is before start date', () => {
        const { result } = renderHook(() =>
            useWorkflowAnalyticsDisplayBanner({
                flowUpdateDatetime: '2024-01-01T00:00:00Z',
                startDatetime: '2024-02-01T00:00:00Z',
                hasDataAvailable: true,
                previousRoute: 'stats-automate-performance-by-features',
            }),
        )

        expect(result.current.displayNoDataAvailableBanner).toBe(false)
        expect(result.current.displayMultipleVersionsBanner).toBe(false)
        expect(result.current.displayLegacyDataBanner).toBe(true)
    })

    it('should not display any banners when previous route was flow and flow update date is after start date', () => {
        const { result } = renderHook(() =>
            useWorkflowAnalyticsDisplayBanner({
                flowUpdateDatetime: '2024-02-01T00:00:00Z',
                startDatetime: '2024-01-01T00:00:00Z',
                hasDataAvailable: true,
                previousRoute:
                    '/app/automation/shopify/myshop/flows/edit/flow1',
            }),
        )

        expect(result.current.displayNoDataAvailableBanner).toBe(false)
        expect(result.current.displayMultipleVersionsBanner).toBe(false)
        expect(result.current.displayLegacyDataBanner).toBe(false)
    })
})
