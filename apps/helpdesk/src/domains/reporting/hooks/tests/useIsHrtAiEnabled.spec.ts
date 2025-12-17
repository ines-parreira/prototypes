import { useFlag } from '@repo/feature-flags'
import { assumeMock, renderHook } from '@repo/testing'

import { useIsHrtAiEnabled } from 'domains/reporting/hooks/useIsHrtAiEnabled'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'

jest.mock('@repo/feature-flags')
const useFlagMock = assumeMock(useFlag)
jest.mock('hooks/aiAgent/useAiAgentAccess')
const useAiAgentAccessMock = assumeMock(useAiAgentAccess)

describe('useIsHrtAiEnabled', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('when feature flag is enabled', () => {
        beforeEach(() => {
            useFlagMock.mockReturnValue(true)
        })

        it('should return true when AI agent access is true', () => {
            useAiAgentAccessMock.mockReturnValue({
                hasAccess: true,
                isLoading: false,
            })

            const { result } = renderHook(() => useIsHrtAiEnabled())

            expect(result.current).toBe(true)
        })

        it('should return false when AI agent access is false', () => {
            useAiAgentAccessMock.mockReturnValue({
                hasAccess: false,
                isLoading: false,
            })

            const { result } = renderHook(() => useIsHrtAiEnabled())

            expect(result.current).toBe(false)
        })
    })

    describe('when feature flag is disabled', () => {
        beforeEach(() => {
            useFlagMock.mockReturnValue(false)
        })

        it('should return false when AI agent access is true', () => {
            useAiAgentAccessMock.mockReturnValue({
                hasAccess: true,
                isLoading: false,
            })

            const { result } = renderHook(() => useIsHrtAiEnabled())

            expect(result.current).toBe(false)
        })

        it('should return false when AI agent access is false', () => {
            useAiAgentAccessMock.mockReturnValue({
                hasAccess: false,
                isLoading: false,
            })

            const { result } = renderHook(() => useIsHrtAiEnabled())

            expect(result.current).toBe(false)
        })
    })
})
