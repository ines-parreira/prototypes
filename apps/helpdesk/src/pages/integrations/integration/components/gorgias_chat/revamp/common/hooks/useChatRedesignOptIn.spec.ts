import { renderHook } from '@repo/testing'

import { useAppSelector } from 'hooks/useAppSelector'

import { useChatRedesignOptIn } from './useChatRedesignOptIn'

jest.mock('hooks/useAppSelector')

const mockUseAppSelector = useAppSelector as jest.MockedFunction<
    typeof useAppSelector
>

beforeEach(() => {
    jest.clearAllMocks()
})

describe('useChatRedesignOptIn', () => {
    it('returns isOptedIn=true when meta.chat_redesign_opt_in_datetime is set', () => {
        mockUseAppSelector.mockReturnValue({
            meta: { chat_redesign_opt_in_datetime: '2026-05-26T00:00:00Z' },
        })

        const { result } = renderHook(() => useChatRedesignOptIn(1))

        expect(result.current.isOptedIn).toBe(true)
        expect(result.current.optInDatetime).toBe('2026-05-26T00:00:00Z')
    })

    it('returns isOptedIn=false when meta.chat_redesign_opt_in_datetime is null', () => {
        mockUseAppSelector.mockReturnValue({
            meta: { chat_redesign_opt_in_datetime: null },
        })

        const { result } = renderHook(() => useChatRedesignOptIn(1))

        expect(result.current.isOptedIn).toBe(false)
        expect(result.current.optInDatetime).toBeNull()
    })

    it('returns isOptedIn=false when the integration is not found', () => {
        mockUseAppSelector.mockReturnValue(undefined)

        const { result } = renderHook(() => useChatRedesignOptIn(1))

        expect(result.current.isOptedIn).toBe(false)
        expect(result.current.optInDatetime).toBeUndefined()
    })

    it('returns isOptedIn=false when chatIntegrationId is undefined', () => {
        mockUseAppSelector.mockReturnValue(undefined)

        const { result } = renderHook(() => useChatRedesignOptIn(undefined))

        expect(result.current.isOptedIn).toBe(false)
    })
})
