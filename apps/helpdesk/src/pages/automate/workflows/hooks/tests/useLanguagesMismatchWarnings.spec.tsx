import { assumeMock, renderHook } from '@repo/testing'

import { TicketChannel } from 'business/types/ticket'
import { useFlag } from 'core/flags'
import { useGetWorkflowConfigurations } from 'models/workflows/queries'
import type { ChannelLanguage } from 'pages/automate/common/types'

import useLanguagesMismatchWarnings from '../useLanguagesMismatchWarnings'

jest.mock('core/flags')
const useFlagMock = assumeMock(useFlag)

jest.mock('models/workflows/queries', () => ({
    useGetWorkflowConfigurations: jest.fn(),
}))
const useGetWorkflowConfigurationsMock = assumeMock(
    useGetWorkflowConfigurations,
)

describe('useLanguagesMismatchWarnings', () => {
    beforeEach(() => {
        useFlagMock.mockReturnValue(false)
        useGetWorkflowConfigurationsMock.mockReturnValue({
            isLoading: false,
            data: [],
        } as unknown as ReturnType<typeof useGetWorkflowConfigurations>)
    })

    it('initializes correctly', () => {
        const { result } = renderHook(() =>
            useLanguagesMismatchWarnings(TicketChannel.Chat, 123, [
                'en-US',
                'fr-FR',
            ]),
        )
        expect(result.current.getLanguagesMismatchWarning).toBeDefined()
    })

    it('returns error when there is no overlap between channel and workflow languages', () => {
        useGetWorkflowConfigurationsMock.mockReturnValue({
            isLoading: false,
            data: [{ id: 'workflow1', available_languages: ['es-ES'] }],
        } as unknown as ReturnType<typeof useGetWorkflowConfigurations>)

        const { result } = renderHook(() =>
            useLanguagesMismatchWarnings(TicketChannel.Chat, 123, ['en-US']),
        )

        const warning = result.current.getLanguagesMismatchWarning('workflow1')
        expect(warning).toEqual({
            type: 'error',
            message: expect.anything(), // Verify the ReactNode content matches.
        })
    })

    it('returns warning for mono-language channels with multiple workflow languages', () => {
        useFlagMock.mockReturnValue(true)
        useGetWorkflowConfigurationsMock.mockReturnValue({
            isLoading: false,
            data: [
                { id: 'workflow1', available_languages: ['en-US', 'fr-FR'] },
            ],
        } as unknown as ReturnType<typeof useGetWorkflowConfigurations>)

        const { result } = renderHook(() =>
            useLanguagesMismatchWarnings(TicketChannel.ContactForm, 123, [
                'en-US',
            ]),
        )

        const warning = result.current.getLanguagesMismatchWarning('workflow1')
        expect(warning).toEqual({
            type: 'warning',
            message: expect.anything(), // Verify ReactNode content.
        })
    })

    it('returns warning for extra channel languages', () => {
        useGetWorkflowConfigurationsMock.mockReturnValue({
            isLoading: false,
            data: [{ id: 'workflow1', available_languages: ['en-US'] }],
        } as unknown as ReturnType<typeof useGetWorkflowConfigurations>)

        const { result } = renderHook(() =>
            useLanguagesMismatchWarnings(TicketChannel.Chat, 123, [
                'en-US',
                'fr-FR',
            ]),
        )

        const warning = result.current.getLanguagesMismatchWarning('workflow1')
        expect(warning).toEqual({
            type: 'warning',
            message: expect.anything(),
        })
    })

    it('returns warning for extra workflow languages', () => {
        useGetWorkflowConfigurationsMock.mockReturnValue({
            isLoading: false,
            data: [
                { id: 'workflow1', available_languages: ['en-US', 'fr-FR'] },
            ],
        } as unknown as ReturnType<typeof useGetWorkflowConfigurations>)

        const { result } = renderHook(() =>
            useLanguagesMismatchWarnings(TicketChannel.Chat, 123, ['en-US']),
        )

        const warning = result.current.getLanguagesMismatchWarning('workflow1')
        expect(warning).toEqual({
            type: 'warning',
            message: expect.anything(),
        })
    })

    it('returns nothing when channel and workflow languages match', () => {
        useGetWorkflowConfigurationsMock.mockReturnValue({
            isLoading: false,
            data: [{ id: 'workflow1', available_languages: ['en-US'] }],
        } as unknown as ReturnType<typeof useGetWorkflowConfigurations>)

        const { result } = renderHook(() =>
            useLanguagesMismatchWarnings(TicketChannel.Chat, 123, ['en-US']),
        )

        const warning = result.current.getLanguagesMismatchWarning('workflow1')
        expect(warning).toBeUndefined()
    })

    it('handles undefined workflows gracefully', () => {
        useGetWorkflowConfigurationsMock.mockReturnValue({
            isLoading: false,
            data: undefined,
        } as unknown as ReturnType<typeof useGetWorkflowConfigurations>)

        const { result } = renderHook(() =>
            useLanguagesMismatchWarnings(TicketChannel.Chat, 123, ['en-US']),
        )

        const warning = result.current.getLanguagesMismatchWarning('workflow1')
        expect(warning).toBeUndefined()
    })
    it('handles cs-CZ workflow language matching cz channel language correctly', () => {
        useGetWorkflowConfigurationsMock.mockReturnValue({
            isLoading: false,
            data: [{ id: 'workflow1', available_languages: ['cs-CZ'] }],
        } as unknown as ReturnType<typeof useGetWorkflowConfigurations>)

        const { result } = renderHook(() =>
            useLanguagesMismatchWarnings(TicketChannel.Chat, 123, [
                'cz' as ChannelLanguage,
            ]),
        )

        const warning = result.current.getLanguagesMismatchWarning('workflow1')
        expect(warning).toBeUndefined()
    })
})
