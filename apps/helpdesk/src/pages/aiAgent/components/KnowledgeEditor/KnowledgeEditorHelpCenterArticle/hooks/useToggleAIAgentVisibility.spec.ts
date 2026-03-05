import { act, renderHook } from '@testing-library/react'

import { useNotify } from 'hooks/useNotify'
import { useUpdateArticleTranslation } from 'models/helpCenter/mutations'
import type { ArticleWithLocalTranslation } from 'models/helpCenter/types'

import { useArticleContext } from '../context/ArticleContext'
import type { ArticleContextValue, SettingsChanges } from '../context/types'
import { useToggleAIAgentVisibility } from './useToggleAIAgentVisibility'

jest.mock('hooks/useNotify')
jest.mock('models/helpCenter/mutations')
jest.mock('../context/ArticleContext')

const mockUseNotify = useNotify as jest.Mock
const mockUseUpdateArticleTranslation = useUpdateArticleTranslation as jest.Mock
const mockUseArticleContext = useArticleContext as jest.Mock

const createMockArticle = (
    overrides: Partial<ArticleWithLocalTranslation> = {},
): ArticleWithLocalTranslation =>
    ({
        id: 1,
        unlisted_id: 'test-unlisted-id',
        help_center_id: 1,
        available_locales: ['en-US'],
        created_datetime: '2024-01-01T00:00:00Z',
        updated_datetime: '2024-01-02T00:00:00Z',
        deleted_datetime: null,
        rating: { up: 0, down: 0 },
        translation: {
            locale: 'en-US',
            title: 'Test Article',
            content: '<p>Test content</p>',
            slug: 'test-article',
            excerpt: 'Test excerpt',
            category_id: 1,
            visibility_status: 'PUBLIC',
            customer_visibility: 'PUBLIC',
            article_id: 1,
            article_unlisted_id: 'test-unlisted-id',
            seo_meta: { title: 'SEO Title', description: 'SEO Description' },
            created_datetime: '2024-01-01T00:00:00Z',
            updated_datetime: '2024-01-02T00:00:00Z',
            deleted_datetime: null,
            is_current: true,
            rating: { up: 0, down: 0 },
            draft_version_id: null,
            published_version_id: null,
            published_datetime: null,
            publisher_user_id: null,
            commit_message: null,
            version: null,
        },
        ...overrides,
    }) as ArticleWithLocalTranslation

const createMockContextValue = (
    overrides: Partial<ArticleContextValue> = {},
): ArticleContextValue => {
    const defaultState = {
        articleMode: 'edit' as const,
        isFullscreen: false,
        isDetailsView: true,
        title: 'Test Article',
        content: '<p>Test content</p>',
        savedSnapshot: {
            title: 'Test Article',
            content: '<p>Test content</p>',
        },
        isAutoSaving: false,
        hasAutoSavedInSession: false,
        article: createMockArticle(),
        translationMode: 'existing' as const,
        currentLocale: 'en-US' as const,
        pendingSettingsChanges: {} as SettingsChanges,
        versionStatus: 'latest_draft' as const,
        historicalVersion: null,
        comparisonVersion: null,
        activeModal: null,
        isUpdating: false,
        templateKey: undefined,
    }

    return {
        state: { ...defaultState, ...overrides.state },
        dispatch: jest.fn(),
        config: {
            helpCenter: {
                id: 1,
                uid: '1',
                name: 'Test Help Center',
                subdomain: 'test',
                default_locale: 'en-US',
                supported_locales: ['en-US'],
                source: 'manual',
                type: 'faq',
                layout: 'default',
                created_datetime: '2024-01-01T00:00:00Z',
                updated_datetime: '2024-01-01T00:00:00Z',
                deleted_datetime: null,
                deactivated_datetime: null,
                code_snippet_template: '',
                integration_id: null,
                search_deactivated_datetime: null,
                powered_by_deactivated_datetime: null,
                self_service_deactivated_datetime: null,
                gaid: null,
                algolia_api_key: null,
                algolia_app_id: null,
                algolia_index_name: null,
                primary_color: '#000000',
                primary_font_family: 'Inter',
                theme: 'light',
                hotswap_session_token: null,
                shop_name: null,
                shop_integration_id: null,
                email_integration: null,
                automation_settings_id: null,
                main_embedment_base_url: null,
            },
            supportedLocales: [{ code: 'en-US', name: 'English - USA' }],
            categories: [],
            initialMode: 'edit',
            onClose: jest.fn(),
            onUpdatedFn: jest.fn(),
        },
        hasPendingContentChanges: false,
        isFormValid: true,
        hasDraft: false,
        canEdit: true,
        playground: {
            isOpen: false,
            onTest: jest.fn(),
            onClose: jest.fn(),
            sidePanelWidth: '60vw',
            shouldHideFullscreenButton: false,
        },
        ...overrides,
    } as ArticleContextValue
}

describe('useToggleAIAgentVisibility', () => {
    let mockDispatch: jest.Mock
    let mockNotifyError: jest.Mock
    let mockNotifySuccess: jest.Mock
    let mockMutateAsync: jest.Mock
    let mockOnUpdatedFn: jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()

        mockDispatch = jest.fn()
        mockNotifyError = jest.fn()
        mockNotifySuccess = jest.fn()
        mockMutateAsync = jest.fn()
        mockOnUpdatedFn = jest.fn()

        mockUseNotify.mockReturnValue({
            error: mockNotifyError,
            success: mockNotifySuccess,
        })
        mockUseUpdateArticleTranslation.mockReturnValue({
            mutateAsync: mockMutateAsync,
        })
    })

    const setupContext = (overrides: Partial<ArticleContextValue> = {}) => {
        const context = createMockContextValue(overrides)
        context.dispatch = mockDispatch
        context.config.onUpdatedFn = mockOnUpdatedFn
        mockUseArticleContext.mockReturnValue(context)
        return context
    }

    it('returns early when article has no id', async () => {
        setupContext({
            state: { article: undefined } as ArticleContextValue['state'],
        })

        const { result } = renderHook(() => useToggleAIAgentVisibility())

        await act(async () => {
            await result.current.toggleAIAgentVisibility()
        })

        expect(mockDispatch).not.toHaveBeenCalled()
        expect(mockMutateAsync).not.toHaveBeenCalled()
    })

    it('toggles from PUBLIC to UNLISTED and shows disabled toast', async () => {
        const mockTranslationData = { visibility_status: 'UNLISTED' }
        mockMutateAsync.mockResolvedValue({ data: mockTranslationData })

        const context = setupContext()

        const { result } = renderHook(() => useToggleAIAgentVisibility())

        await act(async () => {
            await result.current.toggleAIAgentVisibility()
        })

        expect(mockMutateAsync).toHaveBeenCalledWith([
            undefined,
            {
                help_center_id: context.config.helpCenter.id,
                article_id: 1,
                locale: 'en-US',
            },
            {
                visibility_status: 'UNLISTED',
                customer_visibility: 'PUBLIC',
                is_current: false,
            },
        ])
        expect(mockNotifySuccess).toHaveBeenCalledWith(
            'Content disabled for AI Agent.',
        )
    })

    it('toggles from UNLISTED to PUBLIC and shows enabled toast', async () => {
        const article = createMockArticle({
            translation: {
                ...createMockArticle().translation,
                visibility_status: 'UNLISTED',
                customer_visibility: 'UNLISTED',
            },
        })
        mockMutateAsync.mockResolvedValue({
            data: { visibility_status: 'PUBLIC' },
        })

        setupContext({
            state: { article } as ArticleContextValue['state'],
        })

        const { result } = renderHook(() => useToggleAIAgentVisibility())

        await act(async () => {
            await result.current.toggleAIAgentVisibility()
        })

        expect(mockMutateAsync).toHaveBeenCalledWith([
            undefined,
            expect.objectContaining({ article_id: 1 }),
            expect.objectContaining({
                visibility_status: 'PUBLIC',
                customer_visibility: 'UNLISTED',
            }),
        ])
        expect(mockNotifySuccess).toHaveBeenCalledWith(
            'Content enabled for AI Agent.',
        )
    })

    it('dispatches SET_UPDATING true before mutation and false after success', async () => {
        mockMutateAsync.mockResolvedValue({
            data: { visibility_status: 'UNLISTED' },
        })
        setupContext()

        const { result } = renderHook(() => useToggleAIAgentVisibility())

        await act(async () => {
            await result.current.toggleAIAgentVisibility()
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_UPDATING',
            payload: true,
        })
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_UPDATING',
            payload: false,
        })

        const calls = mockDispatch.mock.calls
        const setUpdatingTrueIndex = calls.findIndex(
            (c: [{ type: string; payload: boolean }]) =>
                c[0].type === 'SET_UPDATING' && c[0].payload === true,
        )
        const setUpdatingFalseIndex = calls.findIndex(
            (c: [{ type: string; payload: boolean }]) =>
                c[0].type === 'SET_UPDATING' && c[0].payload === false,
        )
        expect(setUpdatingTrueIndex).toBeLessThan(setUpdatingFalseIndex)
    })

    it('dispatches UPDATE_TRANSLATION and calls onUpdatedFn on success', async () => {
        const translationData = {
            visibility_status: 'UNLISTED',
            title: 'Updated',
        }
        mockMutateAsync.mockResolvedValue({ data: translationData })
        setupContext()

        const { result } = renderHook(() => useToggleAIAgentVisibility())

        await act(async () => {
            await result.current.toggleAIAgentVisibility()
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'UPDATE_TRANSLATION',
            payload: { ...translationData, is_current: true },
        })
        expect(mockOnUpdatedFn).toHaveBeenCalled()
    })

    it('does not dispatch UPDATE_TRANSLATION when response has no data', async () => {
        mockMutateAsync.mockResolvedValue({ data: null })
        setupContext()

        const { result } = renderHook(() => useToggleAIAgentVisibility())

        await act(async () => {
            await result.current.toggleAIAgentVisibility()
        })

        expect(mockDispatch).not.toHaveBeenCalledWith(
            expect.objectContaining({ type: 'UPDATE_TRANSLATION' }),
        )
        expect(mockOnUpdatedFn).not.toHaveBeenCalled()
        expect(mockNotifySuccess).not.toHaveBeenCalled()
    })

    it('calls notifyError and dispatches SET_UPDATING false on mutation failure', async () => {
        mockMutateAsync.mockRejectedValue(new Error('Network error'))
        setupContext()

        const { result } = renderHook(() => useToggleAIAgentVisibility())

        await act(async () => {
            await result.current.toggleAIAgentVisibility()
        })

        expect(mockNotifyError).toHaveBeenCalledWith(
            'An error occurred while updating AI Agent visibility.',
        )
        expect(mockNotifySuccess).not.toHaveBeenCalled()
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_UPDATING',
            payload: false,
        })
    })

    it('preserves customer_visibility when toggling AI Agent back on', async () => {
        const article = createMockArticle({
            translation: {
                ...createMockArticle().translation,
                visibility_status: 'UNLISTED',
                customer_visibility: 'UNLISTED',
            },
        })
        mockMutateAsync.mockResolvedValue({
            data: {
                visibility_status: 'PUBLIC',
                customer_visibility: 'UNLISTED',
            },
        })

        setupContext({
            state: { article } as ArticleContextValue['state'],
        })

        const { result } = renderHook(() => useToggleAIAgentVisibility())

        await act(async () => {
            await result.current.toggleAIAgentVisibility()
        })

        expect(mockMutateAsync).toHaveBeenCalledWith([
            undefined,
            expect.objectContaining({ article_id: 1 }),
            {
                visibility_status: 'PUBLIC',
                customer_visibility: 'UNLISTED',
                is_current: false,
            },
        ])
    })

    it('preserves is_current from state when dispatching UPDATE_TRANSLATION', async () => {
        const article = createMockArticle({
            translation: {
                ...createMockArticle().translation,
                is_current: true,
                visibility_status: 'PUBLIC',
            },
        })
        mockMutateAsync.mockResolvedValue({
            data: {
                visibility_status: 'UNLISTED',
                is_current: false,
            },
        })

        setupContext({
            state: { article } as ArticleContextValue['state'],
        })

        const { result } = renderHook(() => useToggleAIAgentVisibility())

        await act(async () => {
            await result.current.toggleAIAgentVisibility()
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'UPDATE_TRANSLATION',
            payload: {
                visibility_status: 'UNLISTED',
                is_current: true,
            },
        })
    })

    it('does not dispatch UPDATE_TRANSLATION on mutation failure', async () => {
        mockMutateAsync.mockRejectedValue(new Error('Server error'))
        setupContext()

        const { result } = renderHook(() => useToggleAIAgentVisibility())

        await act(async () => {
            await result.current.toggleAIAgentVisibility()
        })

        expect(mockDispatch).not.toHaveBeenCalledWith(
            expect.objectContaining({ type: 'UPDATE_TRANSLATION' }),
        )
    })
})
