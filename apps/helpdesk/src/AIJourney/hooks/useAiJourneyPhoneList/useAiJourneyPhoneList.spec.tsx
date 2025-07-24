import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { useSmsIntegrations } from 'AIJourney/queries'
import { mockPhoneNumbers } from 'AIJourney/utils/test-fixtures/mockPhoneNumbers'
import useAppSelector from 'hooks/useAppSelector'

import { useAiJourneyPhoneList } from './useAiJourneyPhoneList'

jest.mock('AIJourney/queries', () => ({
    useSmsIntegrations: jest.fn(),
}))

jest.mock('hooks/useAppSelector', () => jest.fn())

const mockUseSmsIntegrations = useSmsIntegrations as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock

describe('useAiJourneyPhoneList', () => {
    let queryClient: QueryClient
    const mockStore = configureMockStore()

    const createWrapper = () => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        })

        const store = mockStore({})

        return ({ children }: { children: React.ReactNode }) => (
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </Provider>
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAppSelector.mockReturnValue(mockPhoneNumbers)
        mockUseSmsIntegrations.mockReturnValue({
            data: [],
            isLoading: false,
            error: null,
        })
    })

    describe('marketingCapabilityPhoneNumbers filtering', () => {
        it('should filter phone numbers with marketing capabilities', () => {
            const { result } = renderHook(() => useAiJourneyPhoneList([1, 2]), {
                wrapper: createWrapper(),
            })

            // Should include phones 1 and 2 (MKT prefix, SMS capability, SMS integration)
            // Should exclude phone 3 (no MKT prefix)
            // Should exclude phone 4 (no SMS capability)
            // Should exclude phone 5 (no SMS integration)
            expect(result.current.marketingCapabilityPhoneNumbers).toHaveLength(
                2,
            )
            expect(result.current.marketingCapabilityPhoneNumbers[0].id).toBe(
                '1',
            )
            expect(result.current.marketingCapabilityPhoneNumbers[1].id).toBe(
                '2',
            )
        })

        it('should filter out phones without SMS capability', () => {
            mockUseAppSelector.mockReturnValue({
                '1': {
                    ...mockPhoneNumbers['1'],
                    capabilities: { sms: false, voice: true },
                },
                '2': mockPhoneNumbers['2'],
            })

            const { result } = renderHook(() => useAiJourneyPhoneList([1, 2]), {
                wrapper: createWrapper(),
            })

            expect(result.current.marketingCapabilityPhoneNumbers).toHaveLength(
                1,
            )
            expect(result.current.marketingCapabilityPhoneNumbers[0].id).toBe(
                '2',
            )
        })

        it('should filter out phones without SMS integration', () => {
            mockUseAppSelector.mockReturnValue({
                '1': mockPhoneNumbers['1'],
                '2': {
                    ...mockPhoneNumbers['2'],
                    integrations: [{ id: 7, type: 'voice' }],
                },
            })

            const { result } = renderHook(() => useAiJourneyPhoneList([1, 2]), {
                wrapper: createWrapper(),
            })

            expect(result.current.marketingCapabilityPhoneNumbers).toHaveLength(
                1,
            )
            expect(result.current.marketingCapabilityPhoneNumbers[0].id).toBe(
                '1',
            )
        })

        it('should filter out phones without MKT prefix', () => {
            mockUseAppSelector.mockReturnValue({
                '1': mockPhoneNumbers['1'],
                '2': {
                    ...mockPhoneNumbers['2'],
                    name: 'Regular Phone 2',
                },
            })

            const { result } = renderHook(() => useAiJourneyPhoneList([1, 2]), {
                wrapper: createWrapper(),
            })

            expect(result.current.marketingCapabilityPhoneNumbers).toHaveLength(
                1,
            )
            expect(result.current.marketingCapabilityPhoneNumbers[0].id).toBe(
                '1',
            )
        })
    })

    describe('empty data scenarios', () => {
        it('should handle empty phone numbers', () => {
            mockUseAppSelector.mockReturnValue({})

            const { result } = renderHook(() => useAiJourneyPhoneList([1, 2]), {
                wrapper: createWrapper(),
            })

            expect(result.current.marketingCapabilityPhoneNumbers).toHaveLength(
                0,
            )
        })

        it('should handle undefined SMS integrations data', () => {
            mockUseSmsIntegrations.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: null,
            })

            const { result } = renderHook(() => useAiJourneyPhoneList([1, 2]), {
                wrapper: createWrapper(),
            })

            // Should still return marketing phones when SMS integrations data is undefined
            expect(result.current.marketingCapabilityPhoneNumbers).toHaveLength(
                2,
            )
        })
    })

    it('should handle phone numbers with multiple integrations', () => {
        mockUseAppSelector.mockReturnValue({
            '1': {
                ...mockPhoneNumbers['1'],
                integrations: [
                    { id: 1, type: 'sms' },
                    { id: 6, type: 'voice' },
                ],
            },
        })

        const { result } = renderHook(() => useAiJourneyPhoneList([1, 2]), {
            wrapper: createWrapper(),
        })

        expect(result.current.marketingCapabilityPhoneNumbers).toHaveLength(1)
        expect(result.current.marketingCapabilityPhoneNumbers[0].id).toBe('1')
    })

    it('should handle phone numbers with no integrations', () => {
        mockUseAppSelector.mockReturnValue({
            '1': {
                ...mockPhoneNumbers['1'],
                integrations: [],
            },
        })

        const { result } = renderHook(() => useAiJourneyPhoneList([1, 2]), {
            wrapper: createWrapper(),
        })

        expect(result.current.marketingCapabilityPhoneNumbers).toHaveLength(0)
    })

    it('should handle phone numbers with undefined SMS integration id', () => {
        mockUseAppSelector.mockReturnValue({
            '1': {
                ...mockPhoneNumbers['1'],
                integrations: [{ type: 'sms' }], // No id property
            },
        })

        mockUseSmsIntegrations.mockReturnValue({
            data: [{ sms_integration_id: undefined }],
            isLoading: false,
            error: null,
        })

        const { result } = renderHook(() => useAiJourneyPhoneList([1, 2]), {
            wrapper: createWrapper(),
        })

        expect(result.current.marketingCapabilityPhoneNumbers).toHaveLength(0)
    })
})
