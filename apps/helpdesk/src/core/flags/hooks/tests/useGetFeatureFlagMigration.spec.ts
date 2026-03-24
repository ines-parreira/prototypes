import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import type { MigrationStage } from '@repo/feature-flags'
import { reportError } from '@repo/logging'
import { assumeMock, renderHook } from '@repo/testing'

import { useGetFeatureFlagMigration } from 'core/flags/hooks/useGetFeatureFlagMigration'

jest.mock('@repo/feature-flags')
jest.mock('@repo/logging')

const useFlagMocked = assumeMock(useFlag)
const reportErrorMocked = assumeMock(reportError)

describe('useGetFeatureFlagMigration', () => {
    const testFlag = FeatureFlagKey.ReportingP1MetricMigration

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return valid migration stage when useFlag returns "off"', () => {
        useFlagMocked.mockReturnValue('off')

        const { result } = renderHook(() =>
            useGetFeatureFlagMigration(testFlag),
        )

        expect(result.current).toBe('off')
        expect(useFlagMocked).toHaveBeenCalledWith(testFlag, 'off')
        expect(reportErrorMocked).not.toHaveBeenCalled()
    })

    it('should return valid migration stage when useFlag returns "shadow"', () => {
        useFlagMocked.mockReturnValue('shadow')

        const { result } = renderHook(() =>
            useGetFeatureFlagMigration(testFlag),
        )

        expect(result.current).toBe('shadow')
        expect(reportErrorMocked).not.toHaveBeenCalled()
    })

    it('should return valid migration stage when useFlag returns "live"', () => {
        useFlagMocked.mockReturnValue('live')

        const { result } = renderHook(() =>
            useGetFeatureFlagMigration(testFlag),
        )

        expect(result.current).toBe('live')
        expect(reportErrorMocked).not.toHaveBeenCalled()
    })

    it('should return valid migration stage when useFlag returns "complete"', () => {
        useFlagMocked.mockReturnValue('complete')

        const { result } = renderHook(() =>
            useGetFeatureFlagMigration(testFlag),
        )

        expect(result.current).toBe('complete')
        expect(reportErrorMocked).not.toHaveBeenCalled()
    })

    it('should return default value and report error when useFlag returns invalid migration stage', () => {
        const invalidStage = 'invalid' as MigrationStage
        useFlagMocked.mockReturnValue(invalidStage)

        const { result } = renderHook(() =>
            useGetFeatureFlagMigration(testFlag, 'off'),
        )

        expect(result.current).toBe('off')
        expect(reportErrorMocked).toHaveBeenCalledWith(
            'Unknown migration stage: invalid',
        )
    })

    it('should use custom default value when provided', () => {
        useFlagMocked.mockReturnValue('shadow')

        const { result } = renderHook(() =>
            useGetFeatureFlagMigration(testFlag, 'live'),
        )

        expect(useFlagMocked).toHaveBeenCalledWith(testFlag, 'live')
        expect(result.current).toBe('shadow')
    })

    it('should use custom default value when invalid migration stage is returned', () => {
        const invalidStage = 'unknown' as MigrationStage
        useFlagMocked.mockReturnValue(invalidStage)

        const { result } = renderHook(() =>
            useGetFeatureFlagMigration(testFlag, 'complete'),
        )

        expect(result.current).toBe('complete')
        expect(reportErrorMocked).toHaveBeenCalledWith(
            'Unknown migration stage: unknown',
        )
    })
})
