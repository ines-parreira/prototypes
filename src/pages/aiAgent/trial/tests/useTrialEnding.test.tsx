import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { act, renderHook } from 'utils/testing/renderHook'

import { useTrialEnding } from '../hooks/useTrialEnding'

// Mock dependencies
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')

const mockUseStoreActivations = jest.mocked(useStoreActivations)

// Mock localStorage
const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
})

describe('useTrialEnding', () => {
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const mockStoreActivationsEnded = {
        'store-1': {
            name: 'store-1',
            configuration: {
                sales: {
                    trial: {
                        startDatetime: yesterday.toISOString(),
                        endDatetime: yesterday.toISOString(), // ended yesterday
                    },
                },
            },
        },
    } as any

    const mockStoreActivationsEndingTomorrow = {
        'store-1': {
            name: 'store-1',
            configuration: {
                sales: {
                    trial: {
                        startDatetime: yesterday.toISOString(),
                        endDatetime: tomorrow.toISOString(), // ends tomorrow
                    },
                },
            },
        },
    } as any

    const mockStoreActivationsActive = {
        'store-1': {
            name: 'store-1',
            configuration: {
                sales: {
                    trial: {
                        startDatetime: now.toISOString(),
                        endDatetime: nextWeek.toISOString(), // ends next week
                    },
                },
            },
        },
    } as any

    beforeEach(() => {
        jest.clearAllMocks()
        mockLocalStorage.getItem.mockReturnValue(null)

        mockUseStoreActivations.mockReturnValue({
            storeActivations: {},
            isFetchLoading: false,
        } as any)
    })

    describe('isTrialEnded', () => {
        it('should return true when trial has ended', () => {
            mockUseStoreActivations.mockReturnValueOnce({
                storeActivations: mockStoreActivationsEnded,
                isFetchLoading: false,
            } as any)

            const { result } = renderHook(() => useTrialEnding())

            expect(result.current.isTrialEnded).toBe(true)
        })

        it('should return false when trial has not ended', () => {
            mockUseStoreActivations.mockReturnValueOnce({
                storeActivations: mockStoreActivationsActive,
                isFetchLoading: false,
            } as any)

            const { result } = renderHook(() => useTrialEnding())

            expect(result.current.isTrialEnded).toBe(false)
        })

        it('should return false when trial ended but banner was dismissed', () => {
            mockLocalStorage.getItem.mockReturnValue('true')
            mockUseStoreActivations.mockReturnValueOnce({
                storeActivations: mockStoreActivationsEnded,
                isFetchLoading: false,
            } as any)

            const { result } = renderHook(() => useTrialEnding())

            expect(result.current.isTrialEnded).toBe(false)
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
                'ai-agent-trial-ended-dismissed',
            )
        })

        it('should return false when no trial exists', () => {
            mockUseStoreActivations.mockReturnValueOnce({
                storeActivations: {
                    'store-1': {
                        name: 'store-1',
                        configuration: {},
                    },
                },
                isFetchLoading: false,
            } as any)

            const { result } = renderHook(() => useTrialEnding())

            expect(result.current.isTrialEnded).toBe(false)
        })
    })

    describe('isTrialEndingTomorrow', () => {
        it('should return true when trial ends tomorrow', () => {
            mockUseStoreActivations.mockReturnValueOnce({
                storeActivations: mockStoreActivationsEndingTomorrow,
                isFetchLoading: false,
            } as any)

            const { result } = renderHook(() => useTrialEnding())

            expect(result.current.isTrialEndingTomorrow).toBe(true)
        })

        it('should return false when trial does not end tomorrow', () => {
            mockUseStoreActivations.mockReturnValueOnce({
                storeActivations: mockStoreActivationsActive,
                isFetchLoading: false,
            } as any)

            const { result } = renderHook(() => useTrialEnding())

            expect(result.current.isTrialEndingTomorrow).toBe(false)
        })

        it('should return false when trial ending tomorrow but banner was dismissed', () => {
            mockLocalStorage.getItem.mockImplementation((key) => {
                if (key === 'ai-agent-trial-ending-tomorrow-dismissed')
                    return 'true'
                return null
            })

            mockUseStoreActivations.mockReturnValueOnce({
                storeActivations: mockStoreActivationsEndingTomorrow,
                isFetchLoading: false,
            } as any)

            const { result } = renderHook(() => useTrialEnding())

            expect(result.current.isTrialEndingTomorrow).toBe(false)
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
                'ai-agent-trial-ending-tomorrow-dismissed',
            )
        })

        it('should return false when trial already ended', () => {
            mockUseStoreActivations.mockReturnValueOnce({
                storeActivations: mockStoreActivationsEnded,
                isFetchLoading: false,
            } as any)

            const { result } = renderHook(() => useTrialEnding())

            expect(result.current.isTrialEndingTomorrow).toBe(false)
        })
    })

    describe('dismiss functions', () => {
        it('should set localStorage when dismissTrialEnded is called', () => {
            mockUseStoreActivations.mockReturnValueOnce({
                storeActivations: mockStoreActivationsActive,
                isFetchLoading: false,
            } as any)

            const { result } = renderHook(() => useTrialEnding())

            act(() => {
                result.current.dismissTrialEnded()
            })

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                'ai-agent-trial-ended-dismissed',
                'true',
            )
        })

        it('should set localStorage when dismissTrialEndingTomorrow is called', () => {
            mockUseStoreActivations.mockReturnValueOnce({
                storeActivations: mockStoreActivationsActive,
                isFetchLoading: false,
            } as any)

            const { result } = renderHook(() => useTrialEnding())

            act(() => {
                result.current.dismissTrialEndingTomorrow()
            })

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                'ai-agent-trial-ending-tomorrow-dismissed',
                'true',
            )
        })
    })

    describe('multiple stores', () => {
        it('should return true if any store has trial ended', () => {
            const mixedStoreActivations = {
                'store-1': {
                    name: 'store-1',
                    configuration: {
                        sales: {
                            trial: {
                                startDatetime: yesterday.toISOString(),
                                endDatetime: yesterday.toISOString(), // ended
                            },
                        },
                    },
                },
                'store-2': {
                    name: 'store-2',
                    configuration: {
                        sales: {
                            trial: {
                                startDatetime: now.toISOString(),
                                endDatetime: nextWeek.toISOString(), // still active
                            },
                        },
                    },
                },
            }

            mockUseStoreActivations.mockReturnValueOnce({
                storeActivations: mixedStoreActivations,
                isFetchLoading: false,
            } as any)

            const { result } = renderHook(() => useTrialEnding())

            expect(result.current.isTrialEnded).toBe(true)
        })

        it('should return true if any store has trial ending tomorrow', () => {
            const mixedStoreActivations = {
                'store-1': {
                    name: 'store-1',
                    configuration: {
                        sales: {
                            trial: {
                                startDatetime: yesterday.toISOString(),
                                endDatetime: tomorrow.toISOString(), // ends tomorrow
                            },
                        },
                    },
                },
                'store-2': {
                    name: 'store-2',
                    configuration: {
                        sales: {
                            trial: {
                                startDatetime: now.toISOString(),
                                endDatetime: nextWeek.toISOString(), // ends later
                            },
                        },
                    },
                },
            }

            mockUseStoreActivations.mockReturnValueOnce({
                storeActivations: mixedStoreActivations,
                isFetchLoading: false,
            } as any)

            const { result } = renderHook(() => useTrialEnding())

            expect(result.current.isTrialEndingTomorrow).toBe(true)
        })
    })
})
