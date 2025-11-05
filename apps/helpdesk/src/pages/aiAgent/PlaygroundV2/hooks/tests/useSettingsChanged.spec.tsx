import { ReactNode } from 'react'

import { act, renderHook } from '@testing-library/react'

import { AIJourneyProvider } from 'pages/aiAgent/PlaygroundV2/contexts/AIJourneyContext'
import { CoreProvider } from 'pages/aiAgent/PlaygroundV2/contexts/CoreContext'
import { SettingsProvider } from 'pages/aiAgent/PlaygroundV2/contexts/SettingsContext'
import { useSettingsChanged } from 'pages/aiAgent/PlaygroundV2/hooks/useSettingsChanged'

jest.mock('hooks/useNotify', () => ({
    __esModule: true,
    useNotify: jest.fn(() => ({
        notify: jest.fn(),
    })),
}))

jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: jest.fn(() => []),
}))

jest.mock('AIJourney/queries', () => ({
    useJourneys: jest.fn(() => ({ data: [], isLoading: false })),
    useJourneyData: jest.fn(() => ({ data: null, isLoading: false })),
    useUpdateJourney: jest.fn(() => ({
        mutateAsync: jest.fn(),
        isLoading: false,
    })),
}))

jest.mock('AIJourney/providers', () => ({
    TokenProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

jest.mock('core/flags/hooks/useFlag', () => ({
    __esModule: true,
    default: jest.fn(() => true),
}))

jest.mock('models/aiAgent/queries', () => ({
    useCreateTestSessionMutation: jest.fn(() => ({
        mutateAsync: jest.fn(),
        isLoading: false,
    })),
    useGetTestSessionLogs: jest.fn(() => ({
        data: undefined,
        isLoading: false,
    })),
    useGetTestSession: jest.fn(() => ({
        data: undefined,
        isLoading: false,
    })),
}))

const wrapper = ({ children }: { children: ReactNode }) => (
    <CoreProvider>
        <SettingsProvider>
            <AIJourneyProvider shopName="test-shop">
                {children}
            </AIJourneyProvider>
        </SettingsProvider>
    </CoreProvider>
)

describe('useSettingsChanged', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return hasChanged as false initially', () => {
        const { result } = renderHook(() => useSettingsChanged(), {
            wrapper,
        })

        expect(result.current.hasChanged).toBe(false)
        expect(result.current.hasInboundChanged).toBe(false)
        expect(result.current.hasOutboundChanged).toBe(false)
    })

    it('should provide resetInitialState function', () => {
        const { result } = renderHook(() => useSettingsChanged(), {
            wrapper,
        })

        expect(result.current.resetInitialState).toBeInstanceOf(Function)
    })

    it('should reset state when resetInitialState is called', () => {
        const { result } = renderHook(() => useSettingsChanged(), {
            wrapper,
        })

        act(() => {
            result.current.resetInitialState()
        })

        expect(result.current.hasChanged).toBe(false)
        expect(result.current.hasInboundChanged).toBe(false)
        expect(result.current.hasOutboundChanged).toBe(false)
    })

    it('should return all expected properties', () => {
        const { result } = renderHook(() => useSettingsChanged(), {
            wrapper,
        })

        expect(result.current).toHaveProperty('hasChanged')
        expect(result.current).toHaveProperty('hasInboundChanged')
        expect(result.current).toHaveProperty('hasOutboundChanged')
        expect(result.current).toHaveProperty('resetInitialState')
    })

    it('should memoize change detection values', () => {
        const { result, rerender } = renderHook(() => useSettingsChanged(), {
            wrapper,
        })

        const firstInboundValue = result.current.hasInboundChanged
        const firstOutboundValue = result.current.hasOutboundChanged

        rerender()

        expect(result.current.hasInboundChanged).toBe(firstInboundValue)
        expect(result.current.hasOutboundChanged).toBe(firstOutboundValue)
    })
})
