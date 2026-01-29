import { act, renderHook } from '@repo/testing'

import { useNotify } from 'hooks/useNotify'
import { getHelpCenterArticle } from 'models/helpCenter/resources'
import type { GuidanceArticle } from 'pages/aiAgent/types'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

import { fromArticleTranslation, useGuidanceContext } from '../../context'
import type { GuidanceState } from '../../context/types'
import { useVersionBanner } from '../useVersionBanner'

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

describe('useVersionBanner', () => {
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
    }

    const defaultConfig = {
        shopName: 'test-shop',
        shopType: 'shopify',
        guidanceTemplate: undefined,
        initialMode: 'edit' as const,
        guidanceHelpCenter: { id: 1, default_locale: 'en-US' },
        onClose: jest.fn(),
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
            hasDraft: true,
        })
    })

    describe('isViewingDraft', () => {
        it('should return true when isCurrent is false', () => {
            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.isViewingDraft).toBe(true)
        })

        it('should return false when isCurrent is true', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    guidance: { ...mockGuidance, isCurrent: true },
                },
                dispatch: mockDispatch,
                config: defaultConfig,
                hasDraft: true,
            })

            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.isViewingDraft).toBe(false)
        })

        it('should return false when isCurrent is undefined', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    guidance: { ...mockGuidance, isCurrent: undefined },
                },
                dispatch: mockDispatch,
                config: defaultConfig,
                hasDraft: true,
            })

            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.isViewingDraft).toBe(false)
        })

        it('should return false when guidance is undefined', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    guidance: undefined,
                },
                dispatch: mockDispatch,
                config: defaultConfig,
                hasDraft: false,
            })

            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.isViewingDraft).toBe(false)
        })
    })

    describe('hasDraftVersion', () => {
        it('should return true when hasDraft is true', () => {
            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.hasDraftVersion).toBe(true)
        })

        it('should return false when hasDraft is false', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: defaultState,
                dispatch: mockDispatch,
                config: defaultConfig,
                hasDraft: false,
            })

            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.hasDraftVersion).toBe(false)
        })
    })

    describe('hasPublishedVersion', () => {
        it('should return true when publishedVersionId exists', () => {
            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.hasPublishedVersion).toBe(true)
        })

        it('should return false when publishedVersionId is null', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    guidance: { ...mockGuidance, publishedVersionId: null },
                },
                dispatch: mockDispatch,
                config: defaultConfig,
                hasDraft: true,
            })

            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.hasPublishedVersion).toBe(false)
        })

        it('should return false when guidance is undefined', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    guidance: undefined,
                },
                dispatch: mockDispatch,
                config: defaultConfig,
                hasDraft: false,
            })

            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.hasPublishedVersion).toBe(false)
        })
    })

    describe('isDisabled', () => {
        it('should return false when not updating and not auto-saving', () => {
            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.isDisabled).toBe(false)
        })

        it('should return true when isUpdating is true', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, isUpdating: true },
                dispatch: mockDispatch,
                config: defaultConfig,
                hasDraft: true,
            })

            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.isDisabled).toBe(true)
        })

        it('should return true when isAutoSaving is true', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, isAutoSaving: true },
                dispatch: mockDispatch,
                config: defaultConfig,
                hasDraft: true,
            })

            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.isDisabled).toBe(true)
        })

        it('should return true when both isUpdating and isAutoSaving are true', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    isUpdating: true,
                    isAutoSaving: true,
                },
                dispatch: mockDispatch,
                config: defaultConfig,
                hasDraft: true,
            })

            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.isDisabled).toBe(true)
        })
    })

    describe('switchVersion', () => {
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

        it('should dispatch SET_UPDATING true at start', async () => {
            ;(getHelpCenterArticle as jest.Mock).mockResolvedValue(
                mockArticleResponse,
            )
            ;(fromArticleTranslation as jest.Mock).mockReturnValue(
                mockTransformedGuidance,
            )

            const { result } = renderHook(() => useVersionBanner())

            await act(async () => {
                await result.current.switchVersion()
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

            const { result } = renderHook(() => useVersionBanner())

            await act(async () => {
                await result.current.switchVersion()
            })

            const lastCall =
                mockDispatch.mock.calls[mockDispatch.mock.calls.length - 1]
            expect(lastCall).toEqual([{ type: 'SET_UPDATING', payload: false }])
        })

        it('should call getHelpCenterArticle with correct params when viewing draft', async () => {
            ;(getHelpCenterArticle as jest.Mock).mockResolvedValue(
                mockArticleResponse,
            )
            ;(fromArticleTranslation as jest.Mock).mockReturnValue(
                mockTransformedGuidance,
            )

            const { result } = renderHook(() => useVersionBanner())

            await act(async () => {
                await result.current.switchVersion()
            })

            expect(getHelpCenterArticle).toHaveBeenCalledWith(
                mockClient,
                { help_center_id: 1, id: 123 },
                { locale: 'en-US', version_status: 'current' },
            )
        })

        it('should call getHelpCenterArticle with latest_draft when viewing current', async () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    guidance: { ...mockGuidance, isCurrent: true },
                },
                dispatch: mockDispatch,
                config: defaultConfig,
                hasDraft: true,
            })
            ;(getHelpCenterArticle as jest.Mock).mockResolvedValue(
                mockArticleResponse,
            )
            ;(fromArticleTranslation as jest.Mock).mockReturnValue(
                mockTransformedGuidance,
            )

            const { result } = renderHook(() => useVersionBanner())

            await act(async () => {
                await result.current.switchVersion()
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

            const { result } = renderHook(() => useVersionBanner())

            await act(async () => {
                await result.current.switchVersion()
            })

            expect(fromArticleTranslation).toHaveBeenCalledWith(
                mockArticleResponse,
            )
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SWITCH_VERSION',
                payload: mockTransformedGuidance,
            })
        })

        it('should not dispatch SWITCH_VERSION when response is null', async () => {
            ;(getHelpCenterArticle as jest.Mock).mockResolvedValue(null)

            const { result } = renderHook(() => useVersionBanner())

            await act(async () => {
                await result.current.switchVersion()
            })

            expect(mockDispatch).not.toHaveBeenCalledWith(
                expect.objectContaining({ type: 'SWITCH_VERSION' }),
            )
        })

        it('should show error notification on failure', async () => {
            ;(getHelpCenterArticle as jest.Mock).mockRejectedValue(
                new Error('API Error'),
            )

            const { result } = renderHook(() => useVersionBanner())

            await act(async () => {
                await result.current.switchVersion()
            })

            expect(mockNotifyError).toHaveBeenCalledWith(
                'An error occurred while switching version.',
            )
        })

        it('should dispatch SET_UPDATING false even on error', async () => {
            ;(getHelpCenterArticle as jest.Mock).mockRejectedValue(
                new Error('API Error'),
            )

            const { result } = renderHook(() => useVersionBanner())

            await act(async () => {
                await result.current.switchVersion()
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
                hasDraft: true,
            })
            ;(getHelpCenterArticle as jest.Mock).mockResolvedValue(
                mockArticleResponse,
            )
            ;(fromArticleTranslation as jest.Mock).mockReturnValue(
                mockTransformedGuidance,
            )

            const { result } = renderHook(() => useVersionBanner())

            await act(async () => {
                await result.current.switchVersion()
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
                hasDraft: false,
            })
            ;(getHelpCenterArticle as jest.Mock).mockResolvedValue(
                mockArticleResponse,
            )
            ;(fromArticleTranslation as jest.Mock).mockReturnValue(
                mockTransformedGuidance,
            )

            const { result } = renderHook(() => useVersionBanner())

            await act(async () => {
                await result.current.switchVersion()
            })

            expect(getHelpCenterArticle).toHaveBeenCalledWith(
                mockClient,
                { help_center_id: 1, id: 0 },
                { locale: 'en-US', version_status: 'current' },
            )
        })
    })

    describe('return value shape', () => {
        it('should return all expected properties', () => {
            const { result } = renderHook(() => useVersionBanner())

            expect(result.current).toHaveProperty('isViewingDraft')
            expect(result.current).toHaveProperty('hasDraftVersion')
            expect(result.current).toHaveProperty('hasPublishedVersion')
            expect(result.current).toHaveProperty('isDisabled')
            expect(result.current).toHaveProperty('switchVersion')
            expect(typeof result.current.switchVersion).toBe('function')
        })
    })
})
