import { act, renderHook } from '@testing-library/react'

import {
    Language,
    useRequestTicketTranslation,
} from '@gorgias/helpdesk-queries'

import { useFlag } from 'core/flags'
import { TicketMessage } from 'models/ticket/types'

import { useCurrentUserPreferredLanguage } from '../useCurrentUserPreferredLanguage'
import { useGenerateTicketTranslations } from '../useGenerateTicketTranslations'
// Additional mock imports
import { useTicketTranslations } from '../useTicketTranslations'

// Mock the dependencies
jest.mock('@gorgias/helpdesk-queries')
jest.mock('../useCurrentUserPreferredLanguage')
jest.mock('../useTicketTranslations')
jest.mock('core/flags')

const mockUseRequestTicketTranslation =
    useRequestTicketTranslation as jest.MockedFunction<
        typeof useRequestTicketTranslation
    >
const mockUseCurrentUserPreferredLanguage =
    useCurrentUserPreferredLanguage as jest.MockedFunction<
        typeof useCurrentUserPreferredLanguage
    >

const mockUseTicketTranslations = useTicketTranslations as jest.MockedFunction<
    typeof useTicketTranslations
>
const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

describe('useGenerateTicketTranslations', () => {
    const mockRequestTicketTranslation = jest.fn()
    const mockIsLoading = false

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseRequestTicketTranslation.mockReturnValue({
            mutate: mockRequestTicketTranslation,
            isLoading: mockIsLoading,
            data: undefined,
            error: null,
            isError: false,
            isIdle: true,
            isSuccess: false,
            isPending: false,
            reset: jest.fn(),
            mutateAsync: jest.fn(),
        } as any)

        // Mock useTicketTranslations to return empty translations by default
        mockUseTicketTranslations.mockReturnValue({
            data: {
                data: {
                    data: [],
                },
            },
        } as any)

        // Mock useFlag to return true for MessagesTranslations feature flag
        mockUseFlag.mockReturnValue(true)
    })

    it('should return the correct structure', () => {
        mockUseCurrentUserPreferredLanguage.mockReturnValue({
            primary: Language.En,
            proficient: [],
            languagesNotToTranslateFor: [],
        })

        const { result } = renderHook(() =>
            useGenerateTicketTranslations({
                ticketId: 123,
                ticketLanguage: Language.En,
            }),
        )

        expect(result.current).toEqual({
            generateTicketTranslations: expect.any(Function),
            shouldGenerateTicketTranslations: expect.any(Boolean),
        })
    })

    it('should call requestTicketTranslation with correct parameters when preferred language exists', () => {
        const ticketId = 123

        mockUseCurrentUserPreferredLanguage.mockReturnValue({
            primary: Language.Fr,
            proficient: [],
            languagesNotToTranslateFor: [],
        })

        const { result } = renderHook(() =>
            useGenerateTicketTranslations({
                ticketId,
                ticketLanguage: Language.En,
            }),
        )

        act(() => {
            result.current.generateTicketTranslations()
        })

        expect(mockRequestTicketTranslation).toHaveBeenCalledWith({
            data: {
                ticket_id: ticketId,
                language: Language.Fr,
            },
        })
    })

    it('should not call requestTicketTranslation when preferred language is undefined', () => {
        mockUseCurrentUserPreferredLanguage.mockReturnValue({
            primary: undefined,
            proficient: [],
            languagesNotToTranslateFor: [],
        })

        const { result } = renderHook(() =>
            useGenerateTicketTranslations({
                ticketId: 456,
                ticketLanguage: Language.Fr,
            }),
        )

        act(() => {
            result.current.generateTicketTranslations()
        })

        expect(mockRequestTicketTranslation).not.toHaveBeenCalled()
    })

    it('should update function when dependencies change', () => {
        mockUseCurrentUserPreferredLanguage.mockReturnValue({
            primary: Language.It,
            proficient: [],
            languagesNotToTranslateFor: [],
        })

        const { result, rerender } = renderHook(() =>
            useGenerateTicketTranslations({
                ticketId: 123,
                ticketLanguage: Language.En,
            }),
        )

        const firstFunction = result.current.generateTicketTranslations

        // Change the preferred language
        mockUseCurrentUserPreferredLanguage.mockReturnValue({
            primary: Language.Pt,
            proficient: [],
            languagesNotToTranslateFor: [],
        })
        rerender()

        expect(result.current.generateTicketTranslations).not.toBe(
            firstFunction,
        )
    })

    it('should correctly determine shouldGenerateTicketTranslations', () => {
        mockUseCurrentUserPreferredLanguage.mockReturnValue({
            primary: Language.Fr,
            proficient: [],
            languagesNotToTranslateFor: [],
        })

        mockUseTicketTranslations.mockReturnValue({
            data: {
                data: {
                    data: [],
                },
            },
        } as any)

        const { result } = renderHook(() =>
            useGenerateTicketTranslations({
                ticketId: 123,
                ticketLanguage: Language.En,
                ticketMessages: [{ id: 1 } as TicketMessage],
            }),
        )

        expect(result.current.shouldGenerateTicketTranslations).toBe(true)
    })

    it('should not generate translations when they already exist', () => {
        mockUseCurrentUserPreferredLanguage.mockReturnValue({
            primary: Language.Fr,
            proficient: [],
            languagesNotToTranslateFor: [],
        })

        mockUseTicketTranslations.mockReturnValue({
            data: {
                data: {
                    data: [{ id: 1, language: Language.Fr }],
                },
            },
        } as any)

        const { result } = renderHook(() =>
            useGenerateTicketTranslations({
                ticketId: 123,
                ticketLanguage: Language.En,
            }),
        )

        expect(result.current.shouldGenerateTicketTranslations).toBe(false)
    })

    it('should not generate translations when language is in languagesNotToTranslateFor', () => {
        mockUseCurrentUserPreferredLanguage.mockReturnValue({
            primary: Language.Fr,
            proficient: [],
            languagesNotToTranslateFor: [Language.En],
        })

        mockUseTicketTranslations.mockReturnValue({
            data: {
                data: {
                    data: [],
                },
            },
        } as any)

        const { result } = renderHook(() =>
            useGenerateTicketTranslations({
                ticketId: 123,
                ticketLanguage: Language.En,
            }),
        )

        expect(result.current.shouldGenerateTicketTranslations).toBe(false)
    })
})
