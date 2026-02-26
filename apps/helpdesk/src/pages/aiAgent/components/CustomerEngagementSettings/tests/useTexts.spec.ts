import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { multiLanguageInitialTextsEmptyData } from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationAppearance/GorgiasTranslateText/GorgiasTranslateText'
import type {
    Texts,
    TextsMultiLanguage,
} from 'rest_api/gorgias_chat_protected_api/types'
import * as IntegrationsActions from 'state/integrations/actions'

import { useTexts } from '../hooks/useTexts'

jest.mock('state/integrations/actions')

describe('useTexts', () => {
    const mockMonoLanguageTexts: Texts = {
        texts: {},
        sspTexts: {},
        meta: {},
    }

    const mockMultiLanguageTexts: TextsMultiLanguage = {
        ...multiLanguageInitialTextsEmptyData,
        'en-US': {
            texts: {
                greeting: 'Hello',
                farewell: 'Goodbye',
            },
            sspTexts: {
                needHelp: 'Need help?',
            },
            meta: {},
        },
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return initial empty state when shouldFetch is false', async () => {
        const mockGetApplicationTexts = jest
            .spyOn(IntegrationsActions, 'getApplicationTexts')
            .mockResolvedValue(mockMultiLanguageTexts)

        const { result } = renderHook(() =>
            useTexts({
                appId: '123',
                primaryLanguage: 'en-US',
                shouldFetch: false,
            }),
        )

        expect(result.current.texts).toEqual(multiLanguageInitialTextsEmptyData)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBeNull()
        expect(mockGetApplicationTexts).not.toHaveBeenCalled()
    })

    it('should return initial empty state when appId is empty', async () => {
        const mockGetApplicationTexts = jest
            .spyOn(IntegrationsActions, 'getApplicationTexts')
            .mockResolvedValue(mockMultiLanguageTexts)

        const { result } = renderHook(() =>
            useTexts({
                appId: '',
                primaryLanguage: 'en-US',
                shouldFetch: true,
            }),
        )

        expect(result.current.texts).toEqual(multiLanguageInitialTextsEmptyData)
        expect(mockGetApplicationTexts).not.toHaveBeenCalled()
    })

    it('should fetch and return texts when shouldFetch is true', async () => {
        const mockGetApplicationTexts = jest
            .spyOn(IntegrationsActions, 'getApplicationTexts')
            .mockResolvedValue(mockMultiLanguageTexts)
        const mockGetTranslations = jest
            .spyOn(IntegrationsActions, 'getTranslations')
            .mockResolvedValue(mockMonoLanguageTexts)

        const { result } = renderHook(() =>
            useTexts({
                appId: '123',
                primaryLanguage: 'en-US',
                shouldFetch: true,
            }),
        )

        expect(result.current.isLoading).toBe(true)

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
            expect(result.current.texts).toEqual(mockMultiLanguageTexts)
            expect(result.current.error).toBeNull()
            expect(mockGetApplicationTexts).toHaveBeenCalledWith('123')
            expect(mockGetTranslations).toHaveBeenCalled()
        })
    })

    it('should handle errors properly', async () => {
        const mockError = new Error('Failed to fetch texts')
        const mockGetApplicationTexts = jest
            .spyOn(IntegrationsActions, 'getApplicationTexts')
            .mockRejectedValue(mockError)
        const mockGetTranslations = jest
            .spyOn(IntegrationsActions, 'getTranslations')
            .mockResolvedValue(mockMonoLanguageTexts)

        const { result } = renderHook(() =>
            useTexts({
                appId: '123',
                primaryLanguage: 'en-US',
                shouldFetch: true,
            }),
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBe(mockError)
            expect(result.current.texts).toEqual(
                multiLanguageInitialTextsEmptyData,
            )
            expect(mockGetApplicationTexts).toHaveBeenCalledWith('123')
            expect(mockGetTranslations).toHaveBeenCalled()
        })
    })
})
