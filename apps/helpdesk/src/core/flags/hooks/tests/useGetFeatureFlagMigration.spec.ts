import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import type { MigrationStage } from '@repo/feature-flags'
import { reportError } from '@repo/logging'
import { assumeMock, renderHook } from '@repo/testing'

import { useGetFeatureFlagMigration } from 'core/flags/hooks/useGetFeatureFlagMigration'

jest.mock('@repo/feature-flags')
jest.mock('@repo/logging')

const useFlagWithLoadingMocked = assumeMock(useFlagWithLoading)
const reportErrorMocked = assumeMock(reportError)

describe('useGetFeatureFlagMigration', () => {
    const testFlag = FeatureFlagKey.ReportingP1MetricMigration

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return valid migration stage when useFlagWithLoading returns "off"', () => {
        useFlagWithLoadingMocked.mockReturnValue({
            value: 'off',
            isLoading: false,
        })

        const { result } = renderHook(() =>
            useGetFeatureFlagMigration(testFlag),
        )

        expect(result.current).toEqual({
            migrationStage: 'off',
            isLoading: false,
        })
        expect(useFlagWithLoadingMocked).toHaveBeenCalledWith(testFlag, 'off')
        expect(reportErrorMocked).not.toHaveBeenCalled()
    })

    it('should return valid migration stage when useFlagWithLoading returns "shadow"', () => {
        useFlagWithLoadingMocked.mockReturnValue({
            value: 'shadow',
            isLoading: false,
        })

        const { result } = renderHook(() =>
            useGetFeatureFlagMigration(testFlag),
        )

        expect(result.current).toEqual({
            migrationStage: 'shadow',
            isLoading: false,
        })
        expect(reportErrorMocked).not.toHaveBeenCalled()
    })

    it('should return valid migration stage when useFlagWithLoading returns "live"', () => {
        useFlagWithLoadingMocked.mockReturnValue({
            value: 'live',
            isLoading: false,
        })

        const { result } = renderHook(() =>
            useGetFeatureFlagMigration(testFlag),
        )

        expect(result.current).toEqual({
            migrationStage: 'live',
            isLoading: false,
        })
        expect(reportErrorMocked).not.toHaveBeenCalled()
    })

    it('should return valid migration stage when useFlagWithLoading returns "complete"', () => {
        useFlagWithLoadingMocked.mockReturnValue({
            value: 'complete',
            isLoading: false,
        })

        const { result } = renderHook(() =>
            useGetFeatureFlagMigration(testFlag),
        )

        expect(result.current).toEqual({
            migrationStage: 'complete',
            isLoading: false,
        })
        expect(reportErrorMocked).not.toHaveBeenCalled()
    })

    it('should return default value and report error when useFlagWithLoading returns invalid migration stage', () => {
        const invalidStage = 'invalid' as MigrationStage
        useFlagWithLoadingMocked.mockReturnValue({
            value: invalidStage,
            isLoading: false,
        })

        const { result } = renderHook(() =>
            useGetFeatureFlagMigration(testFlag, 'off'),
        )

        expect(result.current).toEqual({
            migrationStage: 'off',
            isLoading: false,
        })
        expect(reportErrorMocked).toHaveBeenCalledWith(
            'Unknown migration stage: invalid',
        )
    })

    it('should use custom default value when provided', () => {
        useFlagWithLoadingMocked.mockReturnValue({
            value: 'shadow',
            isLoading: false,
        })

        const { result } = renderHook(() =>
            useGetFeatureFlagMigration(testFlag, 'live'),
        )

        expect(useFlagWithLoadingMocked).toHaveBeenCalledWith(testFlag, 'live')
        expect(result.current).toEqual({
            migrationStage: 'shadow',
            isLoading: false,
        })
    })

    it('should use custom default value when invalid migration stage is returned', () => {
        const invalidStage = 'unknown' as MigrationStage
        useFlagWithLoadingMocked.mockReturnValue({
            value: invalidStage,
            isLoading: false,
        })

        const { result } = renderHook(() =>
            useGetFeatureFlagMigration(testFlag, 'complete'),
        )

        expect(result.current).toEqual({
            migrationStage: 'complete',
            isLoading: false,
        })
        expect(reportErrorMocked).toHaveBeenCalledWith(
            'Unknown migration stage: unknown',
        )
    })

    describe('when isLoading is true', () => {
        it('should propagate isLoading=true with a valid stage', () => {
            useFlagWithLoadingMocked.mockReturnValue({
                value: 'off',
                isLoading: true,
            })

            const { result } = renderHook(() =>
                useGetFeatureFlagMigration(testFlag),
            )

            expect(result.current).toEqual({
                migrationStage: 'off',
                isLoading: true,
            })
            expect(reportErrorMocked).not.toHaveBeenCalled()
        })

        it('should propagate isLoading=true even when the stage is invalid', () => {
            const invalidStage = 'invalid' as MigrationStage
            useFlagWithLoadingMocked.mockReturnValue({
                value: invalidStage,
                isLoading: true,
            })

            const { result } = renderHook(() =>
                useGetFeatureFlagMigration(testFlag, 'off'),
            )

            expect(result.current).toEqual({
                migrationStage: 'off',
                isLoading: true,
            })
            expect(reportErrorMocked).toHaveBeenCalledWith(
                'Unknown migration stage: invalid',
            )
        })
    })
})
