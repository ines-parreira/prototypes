import { useLocalStorage } from '@repo/hooks'
import { reportError } from '@repo/logging'
import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { SentryTeam } from 'common/const/sentryTeamNames'
import useAppSelector from 'hooks/useAppSelector'
import { useGenerateCustomToneOfVoicePreview } from 'models/aiAgent/queries'

import { customToneOfVoicePreviewFixture } from '../../fixtures/customToneOfVoicePreview.fixture'
import { createCustomToneOfVoicePreviewBody } from '../../utils/custom-tone-of-voice-preview.utils'
import useCustomToneOfVoicePreview from '../useCustomToneOfVoicePreview'

jest.mock('hooks/useAppSelector')
jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useLocalStorage: jest.fn(),
}))
jest.mock('models/aiAgent/queries')
jest.mock('state/currentAccount/selectors')
jest.mock('@repo/logging')
jest.mock('../../utils/custom-tone-of-voice-preview.utils', () => ({
    createCustomToneOfVoicePreviewBody: jest.fn(),
}))

const mockCurrentAccount = {
    get: jest.fn().mockImplementation((key) => {
        if (key === 'domain') return 'example.gorgias.com'
        if (key === 'id') return 123
    }),
}

const mockInput = {
    customToneOfVoice: 'Friendly',
    shopName: 'Example Store',
}

const mockResult = {
    data: {
        ai_answer: 'Generated AI response',
    },
}

describe('useCustomToneOfVoicePreview', () => {
    beforeEach(() => {
        ;(useAppSelector as jest.Mock).mockReturnValue(mockCurrentAccount)
        ;(useLocalStorage as jest.Mock).mockReturnValue(['', jest.fn()])
        ;(useGenerateCustomToneOfVoicePreview as jest.Mock).mockReturnValue({
            mutateAsync: jest.fn().mockResolvedValue(mockResult),
            isLoading: false,
            isError: false,
        })
        ;(createCustomToneOfVoicePreviewBody as jest.Mock).mockReturnValue(
            customToneOfVoicePreviewFixture,
        )
    })

    it('should generate custom tone of voice preview successfully', async () => {
        const { result } = renderHook(() =>
            useCustomToneOfVoicePreview(mockInput),
        )
        const { onGenerateCustomToneOfVoicePreview } = result.current

        await act(async () => {
            await onGenerateCustomToneOfVoicePreview()
        })

        expect(createCustomToneOfVoicePreviewBody).toHaveBeenCalledWith({
            gorgiasDomain: 'example.gorgias.com',
            accountId: 123,
            storeName: 'Example Store',
            customToneOfVoice: 'Friendly',
        })
    })

    it('should handle errors during generation of custom tone of voice preview', async () => {
        const error = new Error('Test error')
        ;(useGenerateCustomToneOfVoicePreview as jest.Mock).mockReturnValue({
            mutateAsync: jest.fn().mockRejectedValue(error),
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() =>
            useCustomToneOfVoicePreview(mockInput),
        )
        const { onGenerateCustomToneOfVoicePreview } = result.current

        await act(async () => {
            await onGenerateCustomToneOfVoicePreview()
        })

        expect(reportError).toHaveBeenCalledWith(error, {
            tags: { team: SentryTeam.AI_AGENT },
            extra: {
                context:
                    'Error during generation of custom tone of voice preview',
                accountId: 123,
                customToneOfVoice: 'Friendly',
            },
        })
    })

    it('should return loading and error states correctly', () => {
        ;(useGenerateCustomToneOfVoicePreview as jest.Mock).mockReturnValue({
            mutateAsync: jest.fn(),
            isLoading: true,
            isError: true,
        })

        const { result } = renderHook(() =>
            useCustomToneOfVoicePreview(mockInput),
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.isError).toBe(true)
    })
})
