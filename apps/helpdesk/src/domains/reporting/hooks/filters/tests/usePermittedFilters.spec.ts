import { assumeMock } from '@repo/testing'
import { renderHook } from '@testing-library/react'

import { useFlag } from 'core/flags'
import { usePermittedFilters } from 'domains/reporting/hooks/filters/usePermittedFilters'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { OptionalFilter } from 'domains/reporting/pages/common/filters/FiltersPanel'

jest.mock('core/flags')

const useFlagsMock = assumeMock(useFlag)

describe('usePermittedFilters', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('when ReportingMultiStoreFilter feature flag is disabled', () => {
        beforeEach(() => {
            useFlagsMock.mockReturnValue(false)
        })

        it('should filter out FilterKey.Stores from the array', () => {
            const optionalFilters: OptionalFilter[] = [
                FilterKey.Agents,
                FilterKey.Stores,
                FilterKey.Channels,
                FilterKey.Tags,
            ]

            const { result } = renderHook(() =>
                usePermittedFilters(optionalFilters),
            )

            expect(result.current).toEqual([
                FilterKey.Agents,
                FilterKey.Channels,
                FilterKey.Tags,
            ])
            expect(result.current).not.toContain(FilterKey.Stores)
        })

        it('should return∂© the same array when Stores filter is not present', () => {
            const optionalFilters: OptionalFilter[] = [
                FilterKey.Agents,
                FilterKey.Channels,
                FilterKey.Tags,
            ]

            const { result } = renderHook(() =>
                usePermittedFilters(optionalFilters),
            )

            expect(result.current).toEqual(optionalFilters)
        })

        it('should handle empty array', () => {
            const { result } = renderHook(() => usePermittedFilters([]))

            expect(result.current).toEqual([])
        })

        it('should handle array with only Stores filter', () => {
            const optionalFilters: OptionalFilter[] = [FilterKey.Stores]

            const { result } = renderHook(() =>
                usePermittedFilters(optionalFilters),
            )

            expect(result.current).toEqual([])
        })
    })

    describe('when ReportingMultiStoreFilter feature flag is enabled', () => {
        beforeEach(() => {
            useFlagsMock.mockReturnValue(true)
        })

        it('should return all filters including Stores', () => {
            const optionalFilters: OptionalFilter[] = [
                FilterKey.Agents,
                FilterKey.Stores,
                FilterKey.Channels,
                FilterKey.Tags,
            ]

            const { result } = renderHook(() =>
                usePermittedFilters(optionalFilters),
            )

            expect(result.current).toEqual(optionalFilters)
            expect(result.current).toContain(FilterKey.Stores)
        })

        it('should return the same array when Stores filter is not present', () => {
            const optionalFilters: OptionalFilter[] = [
                FilterKey.Agents,
                FilterKey.Channels,
                FilterKey.Tags,
            ]

            const { result } = renderHook(() =>
                usePermittedFilters(optionalFilters),
            )

            expect(result.current).toEqual(optionalFilters)
        })

        it('should treat undefined flag as disabled', () => {
            useFlagsMock.mockReturnValue(undefined)

            const optionalFilters: OptionalFilter[] = [
                FilterKey.Agents,
                FilterKey.Stores,
            ]

            const { result } = renderHook(() =>
                usePermittedFilters(optionalFilters),
            )

            expect(result.current).toEqual([FilterKey.Agents])
        })
    })
})
