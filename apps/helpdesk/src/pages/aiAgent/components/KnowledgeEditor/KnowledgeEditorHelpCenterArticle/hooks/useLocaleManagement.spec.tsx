import { act, renderHook, waitFor } from '@testing-library/react'

import { useNotify } from 'hooks/useNotify'
import { useDeleteArticleTranslation } from 'models/helpCenter/mutations'
import { useGetHelpCenterArticle } from 'models/helpCenter/queries'
import type { ArticleWithLocalTranslation } from 'models/helpCenter/types'

import { useArticleContext } from '../context/ArticleContext'
import type { ArticleContextValue, SettingsChanges } from '../context/types'
import { createEmptyTranslation } from '../context/utils'
import { useLocaleManagement } from './useLocaleManagement'

jest.mock('hooks/useNotify')
jest.mock('models/helpCenter/mutations')
jest.mock('models/helpCenter/queries')
jest.mock('../context/ArticleContext')
jest.mock('../context/utils')

const mockUseNotify = useNotify as jest.Mock
const mockUseDeleteArticleTranslation = useDeleteArticleTranslation as jest.Mock
const mockUseGetHelpCenterArticle = useGetHelpCenterArticle as jest.Mock
const mockUseArticleContext = useArticleContext as jest.Mock
const mockCreateEmptyTranslation = createEmptyTranslation as jest.Mock

const createMockArticle = (
    overrides: Partial<ArticleWithLocalTranslation> = {},
): ArticleWithLocalTranslation =>
    ({
        id: 1,
        unlisted_id: 'test-unlisted-id',
        help_center_id: 1,
        available_locales: ['en-US', 'fr-FR'],
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
        article: createMockArticle(),
        translationMode: 'existing' as const,
        currentLocale: 'en-US' as const,
        pendingSettingsChanges: {} as SettingsChanges,
        versionStatus: 'latest_draft' as const,
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
                supported_locales: ['en-US', 'fr-FR'],
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
            supportedLocales: [
                { code: 'en-US', name: 'English - USA' },
                { code: 'fr-FR', name: 'French - France' },
            ],
            categories: [],
            initialMode: 'edit',
            onClose: jest.fn(),
            onDeletedFn: jest.fn(),
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

const createMockLocaleOption = (locale: 'en-US' | 'fr-FR') => ({
    id: locale,
    label: <span>{locale === 'en-US' ? 'English' : 'French'}</span>,
    text: locale === 'en-US' ? 'English - USA' : 'French - France',
    value: locale,
    isComplete: true,
    canBeDeleted: true,
})

describe('useLocaleManagement', () => {
    let mockDispatch: jest.Mock
    let mockNotifyError: jest.Mock
    let mockDeleteMutateAsync: jest.Mock
    let mockRefetch: jest.Mock
    let mockOnClose: jest.Mock
    let mockOnDeletedFn: jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()

        mockDispatch = jest.fn()
        mockNotifyError = jest.fn()
        mockDeleteMutateAsync = jest.fn()
        mockRefetch = jest.fn()
        mockOnClose = jest.fn()
        mockOnDeletedFn = jest.fn()

        mockUseNotify.mockReturnValue({ error: mockNotifyError })
        mockUseDeleteArticleTranslation.mockReturnValue({
            mutateAsync: mockDeleteMutateAsync,
        })
        mockUseGetHelpCenterArticle.mockReturnValue({
            refetch: mockRefetch,
        })
        mockCreateEmptyTranslation.mockReturnValue({
            locale: 'fr-FR',
            title: '',
            content: '',
            slug: '',
            excerpt: '',
            category_id: null,
            visibility_status: 'PUBLIC',
            article_id: 1,
            article_unlisted_id: 'test-unlisted-id',
            seo_meta: { title: null, description: null },
            created_datetime: '2024-01-01T00:00:00Z',
            updated_datetime: '2024-01-01T00:00:00Z',
            deleted_datetime: null,
            is_current: false,
            rating: { up: 0, down: 0 },
            draft_version_id: null,
            published_version_id: null,
        })
    })

    describe('initialization', () => {
        it('returns current locale from state', () => {
            const mockContext = createMockContextValue()
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useLocaleManagement())

            expect(result.current.currentLocale).toBe('en-US')
        })

        it('returns isUpdating from state', () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    isUpdating: true,
                },
            })
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useLocaleManagement())

            expect(result.current.isUpdating).toBe(true)
        })
    })

    describe('onLocaleAction', () => {
        it('dispatches SET_MODAL for delete action', () => {
            const mockContext = createMockContextValue()
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useLocaleManagement())
            const localeOption = createMockLocaleOption('en-US')

            act(() => {
                result.current.onLocaleAction('delete', localeOption)
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_MODAL',
                payload: { type: 'delete-translation', locale: localeOption },
            })
        })

        it('dispatches SET_MODAL for view action when there are pending changes', () => {
            const mockContext = createMockContextValue({
                hasPendingContentChanges: true,
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useLocaleManagement())
            const localeOption = createMockLocaleOption('fr-FR')

            act(() => {
                result.current.onLocaleAction('view', localeOption)
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_MODAL',
                payload: 'unsaved',
            })
        })

        it('dispatches SET_MODAL for create action when there are pending changes', () => {
            const mockContext = createMockContextValue({
                hasPendingContentChanges: true,
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useLocaleManagement())
            const localeOption = createMockLocaleOption('fr-FR')

            act(() => {
                result.current.onLocaleAction('create', localeOption)
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_MODAL',
                payload: 'unsaved',
            })
        })

        it('performs locale switch for view action when no pending changes', async () => {
            const fetchedArticle = createMockArticle({
                translation: {
                    ...createMockArticle().translation,
                    locale: 'fr-FR',
                    title: 'Article Français',
                },
            })
            mockRefetch.mockResolvedValue({ data: fetchedArticle })

            const mockContext = createMockContextValue({
                hasPendingContentChanges: false,
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useLocaleManagement())
            const localeOption = createMockLocaleOption('fr-FR')

            await act(async () => {
                result.current.onLocaleAction('view', localeOption)
            })

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalledWith({
                    type: 'SET_UPDATING',
                    payload: true,
                })
            })

            expect(mockRefetch).toHaveBeenCalled()
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SWITCH_ARTICLE',
                payload: {
                    article: fetchedArticle,
                    locale: 'fr-FR',
                    translationMode: 'existing',
                },
            })
        })

        it('performs locale switch for create action when no pending changes', async () => {
            mockRefetch.mockResolvedValue({
                data: { ...createMockArticle(), translation: null },
            })

            const mockContext = createMockContextValue({
                hasPendingContentChanges: false,
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useLocaleManagement())
            const localeOption = createMockLocaleOption('fr-FR')

            await act(async () => {
                result.current.onLocaleAction('create', localeOption)
            })

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalledWith({
                    type: 'SET_UPDATING',
                    payload: true,
                })
            })

            expect(mockRefetch).toHaveBeenCalled()
            expect(mockCreateEmptyTranslation).toHaveBeenCalled()
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SWITCH_ARTICLE',
                payload: {
                    article: expect.objectContaining({
                        id: 1,
                    }),
                    locale: 'fr-FR',
                    translationMode: 'new',
                },
            })
        })
    })

    describe('performLocaleSwitch', () => {
        it('does nothing when article id is missing', async () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    article: undefined,
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useLocaleManagement())
            const localeOption = createMockLocaleOption('fr-FR')

            await act(async () => {
                result.current.onLocaleAction('view', localeOption)
            })

            expect(mockRefetch).not.toHaveBeenCalled()
            expect(mockDispatch).not.toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: true,
            })
        })

        it('shows error notification when refetch fails', async () => {
            mockRefetch.mockRejectedValue(new Error('Network error'))

            const mockContext = createMockContextValue()
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useLocaleManagement())
            const localeOption = createMockLocaleOption('fr-FR')

            await act(async () => {
                result.current.onLocaleAction('view', localeOption)
            })

            await waitFor(() => {
                expect(mockNotifyError).toHaveBeenCalledWith(
                    'An error occurred while switching locale.',
                )
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: false,
            })
        })

        it('sets isUpdating to false after successful locale switch', async () => {
            const fetchedArticle = createMockArticle({
                translation: {
                    ...createMockArticle().translation,
                    locale: 'fr-FR',
                },
            })
            mockRefetch.mockResolvedValue({ data: fetchedArticle })

            const mockContext = createMockContextValue()
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useLocaleManagement())
            const localeOption = createMockLocaleOption('fr-FR')

            await act(async () => {
                result.current.onLocaleAction('view', localeOption)
            })

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalledWith({
                    type: 'SET_UPDATING',
                    payload: false,
                })
            })
        })
    })

    describe('confirmDeleteTranslation', () => {
        it('calls performDeleteTranslation when modal is delete-translation', async () => {
            mockDeleteMutateAsync.mockResolvedValue({})

            const localeOption = createMockLocaleOption('en-US')
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    activeModal: {
                        type: 'delete-translation',
                        locale: localeOption,
                    },
                },
            })
            mockContext.dispatch = mockDispatch
            mockContext.config.onClose = mockOnClose
            mockContext.config.onDeletedFn = mockOnDeletedFn
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useLocaleManagement())

            await act(async () => {
                result.current.confirmDeleteTranslation()
            })

            await waitFor(() => {
                expect(mockDeleteMutateAsync).toHaveBeenCalledWith([
                    undefined,
                    {
                        help_center_id: 1,
                        article_id: 1,
                        locale: 'en-US',
                    },
                ])
            })

            expect(mockOnDeletedFn).toHaveBeenCalled()
            expect(mockOnClose).toHaveBeenCalled()
        })

        it('does nothing when modal is not delete-translation', async () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    activeModal: 'unsaved',
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useLocaleManagement())

            await act(async () => {
                result.current.confirmDeleteTranslation()
            })

            expect(mockDeleteMutateAsync).not.toHaveBeenCalled()
        })
    })

    describe('performDeleteTranslation', () => {
        it('does nothing when article id is missing', async () => {
            const localeOption = createMockLocaleOption('en-US')
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    article: undefined,
                    activeModal: {
                        type: 'delete-translation',
                        locale: localeOption,
                    },
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useLocaleManagement())

            await act(async () => {
                result.current.confirmDeleteTranslation()
            })

            expect(mockDeleteMutateAsync).not.toHaveBeenCalled()
        })

        it('shows error notification when delete fails', async () => {
            mockDeleteMutateAsync.mockRejectedValue(new Error('Network error'))

            const localeOption = createMockLocaleOption('en-US')
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    activeModal: {
                        type: 'delete-translation',
                        locale: localeOption,
                    },
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useLocaleManagement())

            await act(async () => {
                result.current.confirmDeleteTranslation()
            })

            await waitFor(() => {
                expect(mockNotifyError).toHaveBeenCalledWith(
                    'An error occurred while deleting the article translation.',
                )
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: false,
            })
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'CLOSE_MODAL',
            })
        })

        it('closes modal and sets updating to false after successful delete', async () => {
            mockDeleteMutateAsync.mockResolvedValue({})

            const localeOption = createMockLocaleOption('en-US')
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    activeModal: {
                        type: 'delete-translation',
                        locale: localeOption,
                    },
                },
            })
            mockContext.dispatch = mockDispatch
            mockContext.config.onClose = mockOnClose
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useLocaleManagement())

            await act(async () => {
                result.current.confirmDeleteTranslation()
            })

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalledWith({
                    type: 'SET_UPDATING',
                    payload: false,
                })
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'CLOSE_MODAL',
            })
        })
    })

    describe('handleUnsavedChangesDiscard', () => {
        it('closes modal and performs pending view action', async () => {
            const fetchedArticle = createMockArticle({
                translation: {
                    ...createMockArticle().translation,
                    locale: 'fr-FR',
                },
            })
            mockRefetch.mockResolvedValue({ data: fetchedArticle })

            const mockContext = createMockContextValue({
                hasPendingContentChanges: true,
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useLocaleManagement())
            const localeOption = createMockLocaleOption('fr-FR')

            act(() => {
                result.current.onLocaleAction('view', localeOption)
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_MODAL',
                payload: 'unsaved',
            })

            await act(async () => {
                result.current.handleUnsavedChangesDiscard()
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'CLOSE_MODAL',
            })

            await waitFor(() => {
                expect(mockRefetch).toHaveBeenCalled()
            })
        })

        it('closes modal and performs pending create action', async () => {
            mockRefetch.mockResolvedValue({
                data: { ...createMockArticle(), translation: null },
            })

            const mockContext = createMockContextValue({
                hasPendingContentChanges: true,
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useLocaleManagement())
            const localeOption = createMockLocaleOption('fr-FR')

            act(() => {
                result.current.onLocaleAction('create', localeOption)
            })

            await act(async () => {
                result.current.handleUnsavedChangesDiscard()
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'CLOSE_MODAL',
            })

            await waitFor(() => {
                expect(mockCreateEmptyTranslation).toHaveBeenCalled()
            })
        })
    })

    describe('handleUnsavedChangesSave', () => {
        it('closes modal and clears pending action', async () => {
            const mockContext = createMockContextValue({
                hasPendingContentChanges: true,
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useLocaleManagement())
            const localeOption = createMockLocaleOption('fr-FR')

            act(() => {
                result.current.onLocaleAction('view', localeOption)
            })

            await act(async () => {
                result.current.handleUnsavedChangesSave()
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'CLOSE_MODAL',
            })
        })
    })
})
