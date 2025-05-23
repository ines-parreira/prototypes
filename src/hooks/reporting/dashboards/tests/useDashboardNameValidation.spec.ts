import { useListAnalyticsCustomReports } from '@gorgias/helpdesk-queries'

import { useDashboardNameValidation } from 'hooks/reporting/dashboards/useDashboardNameValidation'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('@gorgias/helpdesk-queries')
const useListAnalyticsCustomReportsMock = assumeMock(
    useListAnalyticsCustomReports,
)

describe('useValidateDashboardName', () => {
    const mockDashboards = [
        { name: 'Existing Dashboard', id: '1' },
        { name: 'Another Dashboard', id: '2' },
    ]

    beforeEach(() => {
        useListAnalyticsCustomReportsMock.mockReturnValue({
            data: { data: { data: mockDashboards } },
        } as any)
    })

    it('should return error for names shorter than 3 characters', () => {
        const { result } = renderHook(() => useDashboardNameValidation('ab'))

        expect(result.current.error).toBe(
            'Name must be at least 3 characters long',
        )
    })

    it('should return error for duplicate dashboard names', () => {
        const { result } = renderHook(() =>
            useDashboardNameValidation('Existing Dashboard'),
        )

        expect(result.current.error).toBe(
            'Existing Dashboard already exists. Please create a unique name to save.',
        )
    })

    it('should return error for duplicate dashboard names with different spacing', () => {
        const { result } = renderHook(() =>
            useDashboardNameValidation('  Existing Dashboard  '),
        )

        expect(result.current.error).toBe(
            'Existing Dashboard already exists. Please create a unique name to save.',
        )
    })

    it('should return null for valid dashboard names', () => {
        const { result } = renderHook(() =>
            useDashboardNameValidation('New Valid Dashboard'),
        )

        expect(result.current.error).toBeUndefined()
        expect(result.current.isValid).toBe(true)
        expect(result.current.isInvalid).toBe(false)
    })

    it('should handle empty dashboards list', () => {
        useListAnalyticsCustomReportsMock.mockReturnValue({
            data: { data: { data: [] } },
        } as any)

        const { result } = renderHook(() =>
            useDashboardNameValidation('New Dashboard'),
        )

        expect(result.current.error).toBeUndefined()
    })

    it('should handle no dashboards data', () => {
        useListAnalyticsCustomReportsMock.mockReturnValue({
            data: null,
        } as any)

        const { result } = renderHook(() =>
            useDashboardNameValidation('New Dashboard'),
        )

        expect(result.current.error).toBeUndefined()
    })

    it('should allow the same name if it matches the initialName', () => {
        const { result } = renderHook(() =>
            useDashboardNameValidation(
                'Existing Dashboard',
                'Existing Dashboard',
            ),
        )

        expect(result.current.error).toBeUndefined()
        expect(result.current.isValid).toBe(true)
        expect(result.current.isInvalid).toBe(false)
    })

    it('should allow the same name with different spacing if it matches the initialName', () => {
        const { result } = renderHook(() =>
            useDashboardNameValidation(
                '  Existing Dashboard  ',
                'Existing Dashboard',
            ),
        )

        expect(result.current.error).toBeUndefined()
        expect(result.current.isValid).toBe(true)
        expect(result.current.isInvalid).toBe(false)
    })
})
