import { act, renderHook } from '@repo/testing'

import { useNotify } from 'hooks/useNotify'
import { getHelpCenterArticle } from 'models/helpCenter/resources'
import type { GuidanceArticle } from 'pages/aiAgent/types'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

import { fromArticleTranslation, useGuidanceContext } from '../../context'
import type { GuidanceState } from '../../context/types'
import { useSwitchVersion } from '../useSwitchVersion'

jest.mock('hooks/useNotify', () => ({
    useNotify: jest.fn(),
}))

jest.mock('models/helpCenter/resources', () => ({
    getHelpCenterArticle: jest.fn(),
}))

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useHelpCenterApi: jest.fn(),
}))

jest.mock('../../context', () => ({
    useGuidanceContext: jest.fn(),
    fromArticleTranslation: jest.fn(),
}))

describe('useSwitchVersion (Guidance)', () => {
    const mockDispatch = jest.fn()
    const mockNotifyError = jest.fn()
    const mockClient = { getArticle: jest.fn() }

    const mockGuidance: GuidanceArticle = {
        id: 123,
        title: 'Test Title',
        content: 'Test Content',
        locale: 'en-US',
        visibility: 'PUBLIC',
        createdDatetime: '2024-01-01T00:00:00Z',
        lastUpdated: '2024-01-01T00:00:00Z',
        templateKey: null,
        isCurrent: false,
        draftVersionId: 1,
        publishedVersionId: 2,
    }

    const defaultState: GuidanceState = {
        guidanceMode: 'edit',
        isFullscreen: false,
        isDetailsView: true,
        title: 'Test Title',
        content: 'Test Content',
        visibility: true,
        savedSnapshot: { title: 'Test Title', content: 'Test Content' },
        guidance: mockGuidance,
        isAutoSaving: false,
        hasAutoSavedInSession: false,
        isFromTemplate: false,
        hasTemplateChanges: false,
        versionStatus: 'latest_draft',
        activeModal: null,
        isUpdating: false,
        historicalVersion: null,
        comparisonVersion: null,
    }

    const defaultConfig = {
        shopName: 'test-shop',
        shopType: 'shopify',
        guidanceTemplate: undefined,
        initialMode: 'edit' as const,
        guidanceHelpCenter: { id: 1, default_locale: 'en-US' },
        onClose: jest.fn(),
    }

    const mockArticleResponse = {
        id: 123,
        translation: {
            title: 'Published Title',
            content: 'Published Content',
            locale: 'en-US',
            visibility_status: 'PUBLIC',
            created_datetime: '2024-01-01T00:00:00Z',
            updated_datetime: '2024-01-01T00:00:00Z',
            draft_version_id: 1,
            published_version_id: 2,
            is_current: true,
        },
        template_key: null,
    }

    const mockTransformedGuidance: GuidanceArticle = {
        id: 123,
        title: 'Published Title',
        content: 'Published Content',
        locale: 'en-US',
        visibility: 'PUBLIC',
        createdDatetime: '2024-01-01T00:00:00Z',
        lastUpdated: '2024-01-01T00:00:00Z',
        templateKey: null,
        isCurrent: true,
        draftVersionId: 1,
        publishedVersionId: 2,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useNotify as jest.Mock).mockReturnValue({
            error: mockNotifyError,
        })
        ;(useHelpCenterApi as jest.Mock).mockReturnValue({
            client: mockClient,
            isReady: true,
        })
        ;(useGuidanceContext as jest.Mock).mockReturnValue({
            state: defaultState,
            dispatch: mockDispatch,
            config: defaultConfig,
        })
    })

    it('should dispatch SET_UPDATING true at start', async () => {
        ;(getHelpCenterArticle as jest.Mock).mockResolvedValue(
            mockArticleResponse,
        )
        ;(fromArticleTranslation as jest.Mock).mockReturnValue(
            mockTransformedGuidance,
        )

        const { result } = renderHook(() => useSwitchVersion())

        await act(async () => {
            await result.current.switchToVersion('current')
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_UPDATING',
            payload: true,
        })
    })

    it('should dispatch SET_UPDATING false at end', async () => {
        ;(getHelpCenterArticle as jest.Mock).mockResolvedValue(
            mockArticleResponse,
        )
        ;(fromArticleTranslation as jest.Mock).mockReturnValue(
            mockTransformedGuidance,
        )

        const { result } = renderHook(() => useSwitchVersion())

        await act(async () => {
            await result.current.switchToVersion('current')
        })

        const lastCall =
            mockDispatch.mock.calls[mockDispatch.mock.calls.length - 1]
        expect(lastCall).toEqual([{ type: 'SET_UPDATING', payload: false }])
    })

    it('should call getHelpCenterArticle with correct params for "current" target', async () => {
        ;(getHelpCenterArticle as jest.Mock).mockResolvedValue(
            mockArticleResponse,
        )
        ;(fromArticleTranslation as jest.Mock).mockReturnValue(
            mockTransformedGuidance,
        )

        const { result } = renderHook(() => useSwitchVersion())

        await act(async () => {
            await result.current.switchToVersion('current')
        })

        expect(getHelpCenterArticle).toHaveBeenCalledWith(
            mockClient,
            { help_center_id: 1, id: 123 },
            { locale: 'en-US', version_status: 'current' },
        )
    })

    it('should call getHelpCenterArticle with correct params for "latest_draft" target', async () => {
        ;(getHelpCenterArticle as jest.Mock).mockResolvedValue(
            mockArticleResponse,
        )
        ;(fromArticleTranslation as jest.Mock).mockReturnValue(
            mockTransformedGuidance,
        )

        const { result } = renderHook(() => useSwitchVersion())

        await act(async () => {
            await result.current.switchToVersion('latest_draft')
        })

        expect(getHelpCenterArticle).toHaveBeenCalledWith(
            mockClient,
            { help_center_id: 1, id: 123 },
            { locale: 'en-US', version_status: 'latest_draft' },
        )
    })

    it('should dispatch SWITCH_VERSION with transformed guidance on success', async () => {
        ;(getHelpCenterArticle as jest.Mock).mockResolvedValue(
            mockArticleResponse,
        )
        ;(fromArticleTranslation as jest.Mock).mockReturnValue(
            mockTransformedGuidance,
        )

        const { result } = renderHook(() => useSwitchVersion())

        await act(async () => {
            await result.current.switchToVersion('current')
        })

        expect(fromArticleTranslation).toHaveBeenCalledWith(mockArticleResponse)
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SWITCH_VERSION',
            payload: mockTransformedGuidance,
        })
    })

    it('should not dispatch SWITCH_VERSION when response is null', async () => {
        ;(getHelpCenterArticle as jest.Mock).mockResolvedValue(null)

        const { result } = renderHook(() => useSwitchVersion())

        await act(async () => {
            await result.current.switchToVersion('current')
        })

        expect(mockDispatch).not.toHaveBeenCalledWith(
            expect.objectContaining({ type: 'SWITCH_VERSION' }),
        )
    })

    it('should show error notification on failure', async () => {
        ;(getHelpCenterArticle as jest.Mock).mockRejectedValue(
            new Error('API Error'),
        )

        const { result } = renderHook(() => useSwitchVersion())

        await act(async () => {
            await result.current.switchToVersion('current')
        })

        expect(mockNotifyError).toHaveBeenCalledWith(
            'An error occurred while switching version.',
        )
    })

    it('should dispatch SET_UPDATING false even on error', async () => {
        ;(getHelpCenterArticle as jest.Mock).mockRejectedValue(
            new Error('API Error'),
        )

        const { result } = renderHook(() => useSwitchVersion())

        await act(async () => {
            await result.current.switchToVersion('current')
        })

        const lastCall =
            mockDispatch.mock.calls[mockDispatch.mock.calls.length - 1]
        expect(lastCall).toEqual([{ type: 'SET_UPDATING', payload: false }])
    })

    it('should use default values when guidanceHelpCenter is undefined', async () => {
        ;(useGuidanceContext as jest.Mock).mockReturnValue({
            state: defaultState,
            dispatch: mockDispatch,
            config: { ...defaultConfig, guidanceHelpCenter: undefined },
        })
        ;(getHelpCenterArticle as jest.Mock).mockResolvedValue(
            mockArticleResponse,
        )
        ;(fromArticleTranslation as jest.Mock).mockReturnValue(
            mockTransformedGuidance,
        )

        const { result } = renderHook(() => useSwitchVersion())

        await act(async () => {
            await result.current.switchToVersion('current')
        })

        expect(getHelpCenterArticle).toHaveBeenCalledWith(
            mockClient,
            { help_center_id: 0, id: 123 },
            { locale: 'en-US', version_status: 'current' },
        )
    })

    it('should use default values when guidance is undefined', async () => {
        ;(useGuidanceContext as jest.Mock).mockReturnValue({
            state: { ...defaultState, guidance: undefined },
            dispatch: mockDispatch,
            config: defaultConfig,
        })
        ;(getHelpCenterArticle as jest.Mock).mockResolvedValue(
            mockArticleResponse,
        )
        ;(fromArticleTranslation as jest.Mock).mockReturnValue(
            mockTransformedGuidance,
        )

        const { result } = renderHook(() => useSwitchVersion())

        await act(async () => {
            await result.current.switchToVersion('current')
        })

        expect(getHelpCenterArticle).toHaveBeenCalledWith(
            mockClient,
            { help_center_id: 1, id: 0 },
            { locale: 'en-US', version_status: 'current' },
        )
    })
})
