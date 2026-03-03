import { useDebouncedCallback } from '@repo/hooks'
import { act, renderHook } from '@testing-library/react'

import { useNotify } from 'hooks/useNotify'
import {
    useCreateArticle,
    useCreateArticleTranslation,
    useUpdateArticleTranslation,
} from 'models/helpCenter/mutations'
import type { ArticleWithLocalTranslation } from 'models/helpCenter/types'
import { slugify } from 'pages/settings/helpCenter/utils/helpCenter.utils'

import { useArticleContext } from '../context/ArticleContext'
import type { ArticleContextValue, SettingsChanges } from '../context/types'
import { useArticleAutoSave } from './useArticleAutoSave'

jest.mock('@repo/hooks', () => ({
    useDebouncedCallback: jest.fn(),
}))

jest.mock('hooks/useNotify')
jest.mock('models/helpCenter/mutations')
jest.mock('../context/ArticleContext')
jest.mock('pages/settings/helpCenter/utils/helpCenter.utils')

const mockUseDebouncedCallback = useDebouncedCallback as jest.Mock
const mockUseNotify = useNotify as jest.Mock
const mockUseCreateArticle = useCreateArticle as jest.Mock
const mockUseCreateArticleTranslation = useCreateArticleTranslation as jest.Mock
const mockUseUpdateArticleTranslation = useUpdateArticleTranslation as jest.Mock
const mockUseArticleContext = useArticleContext as jest.Mock
const mockSlugify = slugify as jest.Mock

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
            onCreatedFn: jest.fn(),
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

describe('useArticleAutoSave', () => {
    let mockDispatch: jest.Mock
    let mockNotifyError: jest.Mock
    let mockCreateArticleMutateAsync: jest.Mock
    let mockCreateTranslationMutateAsync: jest.Mock
    let mockUpdateTranslationMutateAsync: jest.Mock
    let debouncedCallback: ((...args: unknown[]) => Promise<void>) | null = null

    beforeEach(() => {
        jest.clearAllMocks()
        debouncedCallback = null

        mockDispatch = jest.fn()
        mockNotifyError = jest.fn()
        mockCreateArticleMutateAsync = jest.fn()
        mockCreateTranslationMutateAsync = jest.fn()
        mockUpdateTranslationMutateAsync = jest.fn()

        mockUseNotify.mockReturnValue({ error: mockNotifyError })
        mockUseCreateArticle.mockReturnValue({
            mutateAsync: mockCreateArticleMutateAsync,
        })
        mockUseCreateArticleTranslation.mockReturnValue({
            mutateAsync: mockCreateTranslationMutateAsync,
        })
        mockUseUpdateArticleTranslation.mockReturnValue({
            mutateAsync: mockUpdateTranslationMutateAsync,
        })

        mockUseDebouncedCallback.mockImplementation(
            (callback: (...args: unknown[]) => Promise<void>) => {
                debouncedCallback = callback
                return callback
            },
        )

        mockSlugify.mockImplementation((str: string) =>
            str.toLowerCase().replace(/\s+/g, '-'),
        )
    })

    describe('onChangeField', () => {
        it('dispatches SET_TITLE when field is title', () => {
            const mockContext = createMockContextValue()
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useArticleAutoSave())

            act(() => {
                result.current.onChangeField('title', 'New Title')
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_TITLE',
                payload: 'New Title',
            })
        })

        it('dispatches SET_CONTENT when field is content', () => {
            const mockContext = createMockContextValue()
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useArticleAutoSave())

            act(() => {
                result.current.onChangeField('content', '<p>New content</p>')
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_CONTENT',
                payload: '<p>New content</p>',
            })
        })

        it('does not trigger auto-save when mode is read', () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    articleMode: 'read',
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useArticleAutoSave())

            act(() => {
                result.current.onChangeField('title', 'New Title')
            })

            // Should not dispatch anything when in read mode (early return)
            expect(mockDispatch).not.toHaveBeenCalled()
        })

        it('does not trigger auto-save when title is whitespace only and content is empty', () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    content: '',
                    savedSnapshot: {
                        title: 'Old Title',
                        content: '',
                    },
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useArticleAutoSave())

            act(() => {
                result.current.onChangeField('title', '   ')
            })

            expect(mockDispatch).not.toHaveBeenCalledWith({
                type: 'SET_AUTO_SAVING',
                payload: true,
            })
        })

        it('does not trigger auto-save when content is empty', () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    savedSnapshot: {
                        title: 'Old Title',
                        content: 'Old content',
                    },
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useArticleAutoSave())

            act(() => {
                result.current.onChangeField('content', '   ')
            })

            expect(mockDispatch).not.toHaveBeenCalledWith({
                type: 'SET_AUTO_SAVING',
                payload: true,
            })
        })

        it('uses "Untitled" as title when title is empty but content is present', () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    title: '',
                    content: '',
                    savedSnapshot: {
                        title: '',
                        content: '',
                    },
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useArticleAutoSave())

            act(() => {
                result.current.onChangeField('content', 'New Content')
            })

            // Should set title to "Untitled"
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_TITLE',
                payload: 'Untitled',
            })

            // Should trigger autosave with "Untitled" as title
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_AUTO_SAVING',
                payload: true,
            })
        })

        it('does not trigger auto-save when content is same as snapshot', () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    title: 'Test Article',
                    content: '<p>Test content</p>',
                    savedSnapshot: {
                        title: 'Test Article',
                        content: '<p>Test content</p>',
                    },
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useArticleAutoSave())

            act(() => {
                result.current.onChangeField('title', 'Test Article')
            })

            expect(mockDispatch).not.toHaveBeenCalledWith({
                type: 'SET_AUTO_SAVING',
                payload: true,
            })
        })

        it('triggers auto-save when content changes from snapshot', () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    articleMode: 'edit',
                    title: 'Original Title',
                    content: '<p>Original content</p>',
                    savedSnapshot: {
                        title: 'Original Title',
                        content: '<p>Original content</p>',
                    },
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useArticleAutoSave())

            act(() => {
                result.current.onChangeField('title', 'New Title')
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_AUTO_SAVING',
                payload: true,
            })
        })

        it('does not trigger auto-save when title only differs by leading whitespace', () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    title: 'Test Article',
                    content: '<p>Test content</p>',
                    savedSnapshot: {
                        title: 'Test Article',
                        content: '<p>Test content</p>',
                    },
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useArticleAutoSave())

            act(() => {
                result.current.onChangeField('title', '   Test Article')
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_TITLE',
                payload: '   Test Article',
            })

            expect(mockDispatch).not.toHaveBeenCalledWith({
                type: 'SET_AUTO_SAVING',
                payload: true,
            })
        })

        it('does not trigger auto-save when title only differs by trailing whitespace', () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    title: 'Test Article',
                    content: '<p>Test content</p>',
                    savedSnapshot: {
                        title: 'Test Article',
                        content: '<p>Test content</p>',
                    },
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useArticleAutoSave())

            act(() => {
                result.current.onChangeField('title', 'Test Article   ')
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_TITLE',
                payload: 'Test Article   ',
            })

            expect(mockDispatch).not.toHaveBeenCalledWith({
                type: 'SET_AUTO_SAVING',
                payload: true,
            })
        })

        it('does not trigger auto-save when title only differs by both leading and trailing whitespace', () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    title: 'Test Article',
                    content: '<p>Test content</p>',
                    savedSnapshot: {
                        title: 'Test Article',
                        content: '<p>Test content</p>',
                    },
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useArticleAutoSave())

            act(() => {
                result.current.onChangeField('title', '   Test Article   ')
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_TITLE',
                payload: '   Test Article   ',
            })

            expect(mockDispatch).not.toHaveBeenCalledWith({
                type: 'SET_AUTO_SAVING',
                payload: true,
            })
        })

        it('triggers auto-save when title actually changes (not just whitespace)', () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    title: 'Test Article',
                    content: '<p>Test content</p>',
                    savedSnapshot: {
                        title: 'Test Article',
                        content: '<p>Test content</p>',
                    },
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useArticleAutoSave())

            act(() => {
                result.current.onChangeField('title', 'New Test Article')
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_TITLE',
                payload: 'New Test Article',
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_AUTO_SAVING',
                payload: true,
            })
        })
    })

    describe('performAutoSave - create mode with new translation', () => {
        it('creates new article and dispatches MARK_CONTENT_AS_SAVED', async () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    articleMode: 'create',
                    translationMode: 'new',
                    article: undefined,
                    title: 'New Article',
                    content: '<p>New content</p>',
                    savedSnapshot: { title: '', content: '' },
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const createdArticle = createMockArticle({
                id: 123,
                translation: {
                    ...createMockArticle().translation,
                    title: 'New Article',
                    content: '<p>New content</p>',
                },
            })
            mockCreateArticleMutateAsync.mockResolvedValue({
                data: createdArticle,
            })

            renderHook(() => useArticleAutoSave())

            expect(debouncedCallback).not.toBeNull()

            await act(async () => {
                await debouncedCallback?.({
                    title: 'New Article',
                    content: '<p>New content</p>',
                    mode: 'create',
                    translationMode: 'new',
                    articleId: undefined,
                    savedSnapshot: { title: '', content: '' },
                })
            })

            expect(mockCreateArticleMutateAsync).toHaveBeenCalledWith([
                undefined,
                { help_center_id: 1 },
                {
                    template_key: undefined,
                    translation: {
                        locale: 'en-US',
                        title: 'New Article',
                        content: '<p>New content</p>',
                        excerpt: '',
                        slug: 'new-article',
                        seo_meta: { title: null, description: null },
                        category_id: null,
                        is_current: false,
                        visibility_status: 'PUBLIC',
                        customer_visibility: 'PUBLIC',
                    },
                },
            ])

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'MARK_CONTENT_AS_SAVED',
                payload: {
                    title: 'New Article',
                    content: '<p>New content</p>',
                    article: createdArticle,
                },
            })
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_MODE',
                payload: 'edit',
            })
        })

        it('calls onCreatedFn callback on successful creation', async () => {
            const onCreatedFn = jest.fn()
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    articleMode: 'create',
                    translationMode: 'new',
                    article: undefined,
                    title: 'New Article',
                    content: '<p>New content</p>',
                    savedSnapshot: { title: '', content: '' },
                },
            })
            mockContext.config.onCreatedFn = onCreatedFn
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const createdArticle = createMockArticle({ id: 123 })
            mockCreateArticleMutateAsync.mockResolvedValue({
                data: createdArticle,
            })

            renderHook(() => useArticleAutoSave())

            await act(async () => {
                await debouncedCallback?.({
                    title: 'New Article',
                    content: '<p>New content</p>',
                    mode: 'create',
                    translationMode: 'new',
                    articleId: undefined,
                    savedSnapshot: { title: '', content: '' },
                })
            })

            expect(onCreatedFn).toHaveBeenCalledWith(createdArticle, true)
        })

        it('does not save when help center id is missing', async () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    articleMode: 'create',
                    translationMode: 'new',
                },
            })
            mockContext.config.helpCenter.id = undefined as unknown as number
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            renderHook(() => useArticleAutoSave())

            await act(async () => {
                await debouncedCallback?.({
                    title: 'New Article',
                    content: '<p>New content</p>',
                    mode: 'create',
                    translationMode: 'new',
                    articleId: undefined,
                    savedSnapshot: { title: '', content: '' },
                })
            })

            expect(mockCreateArticleMutateAsync).not.toHaveBeenCalled()
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_AUTO_SAVING',
                payload: false,
            })
        })

        it('does not save when content is same as snapshot', async () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    articleMode: 'create',
                    translationMode: 'new',
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            renderHook(() => useArticleAutoSave())

            await act(async () => {
                await debouncedCallback?.({
                    title: 'Same Title',
                    content: '<p>Same content</p>',
                    mode: 'create',
                    translationMode: 'new',
                    articleId: undefined,
                    savedSnapshot: {
                        title: 'Same Title',
                        content: '<p>Same content</p>',
                    },
                })
            })

            expect(mockCreateArticleMutateAsync).not.toHaveBeenCalled()
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_AUTO_SAVING',
                payload: false,
            })
        })

        it('does not save when title only differs by leading whitespace', async () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    articleMode: 'create',
                    translationMode: 'new',
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            renderHook(() => useArticleAutoSave())

            await act(async () => {
                await debouncedCallback?.({
                    title: '   Test Title',
                    content: '<p>Test content</p>',
                    mode: 'create',
                    translationMode: 'new',
                    articleId: undefined,
                    savedSnapshot: {
                        title: 'Test Title',
                        content: '<p>Test content</p>',
                    },
                })
            })

            expect(mockCreateArticleMutateAsync).not.toHaveBeenCalled()
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_AUTO_SAVING',
                payload: false,
            })
        })

        it('does not save when title only differs by trailing whitespace', async () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    articleMode: 'create',
                    translationMode: 'new',
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            renderHook(() => useArticleAutoSave())

            await act(async () => {
                await debouncedCallback?.({
                    title: 'Test Title   ',
                    content: '<p>Test content</p>',
                    mode: 'create',
                    translationMode: 'new',
                    articleId: undefined,
                    savedSnapshot: {
                        title: 'Test Title',
                        content: '<p>Test content</p>',
                    },
                })
            })

            expect(mockCreateArticleMutateAsync).not.toHaveBeenCalled()
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_AUTO_SAVING',
                payload: false,
            })
        })

        it('does not save when title only differs by both leading and trailing whitespace', async () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    articleMode: 'create',
                    translationMode: 'new',
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            renderHook(() => useArticleAutoSave())

            await act(async () => {
                await debouncedCallback?.({
                    title: '   Test Title   ',
                    content: '<p>Test content</p>',
                    mode: 'create',
                    translationMode: 'new',
                    articleId: undefined,
                    savedSnapshot: {
                        title: 'Test Title',
                        content: '<p>Test content</p>',
                    },
                })
            })

            expect(mockCreateArticleMutateAsync).not.toHaveBeenCalled()
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_AUTO_SAVING',
                payload: false,
            })
        })

        it('includes template_key when template is provided', async () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    articleMode: 'create',
                    translationMode: 'new',
                    article: undefined,
                    savedSnapshot: { title: '', content: '' },
                },
            })
            mockContext.config.template = {
                key: 'shipping-policy',
                title: 'Shipping Policy',
                content: '<p>Template content</p>',
            }
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const createdArticle = createMockArticle({ id: 123 })
            mockCreateArticleMutateAsync.mockResolvedValue({
                data: createdArticle,
            })

            renderHook(() => useArticleAutoSave())

            await act(async () => {
                await debouncedCallback?.({
                    title: 'Shipping Policy',
                    content: '<p>Template content</p>',
                    mode: 'create',
                    translationMode: 'new',
                    articleId: undefined,
                    savedSnapshot: { title: '', content: '' },
                })
            })

            expect(mockCreateArticleMutateAsync).toHaveBeenCalledWith([
                undefined,
                { help_center_id: 1 },
                expect.objectContaining({
                    template_key: 'shipping-policy',
                }),
            ])
        })
    })

    describe('performAutoSave - edit mode with new translation', () => {
        it('creates new translation for existing article', async () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    articleMode: 'edit',
                    translationMode: 'new',
                    currentLocale: 'fr-FR',
                    savedSnapshot: { title: '', content: '' },
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const newTranslation = {
                ...createMockArticle().translation,
                locale: 'fr-FR',
                title: 'Nouvel Article',
                content: '<p>Nouveau contenu</p>',
            }
            mockCreateTranslationMutateAsync.mockResolvedValue({
                data: newTranslation,
            })

            renderHook(() => useArticleAutoSave())

            await act(async () => {
                await debouncedCallback?.({
                    title: 'Nouvel Article',
                    content: '<p>Nouveau contenu</p>',
                    mode: 'edit',
                    translationMode: 'new',
                    articleId: 1,
                    savedSnapshot: { title: '', content: '' },
                })
            })

            expect(mockCreateTranslationMutateAsync).toHaveBeenCalledWith([
                undefined,
                { help_center_id: 1, article_id: 1 },
                {
                    locale: 'fr-FR',
                    title: 'Nouvel Article',
                    content: '<p>Nouveau contenu</p>',
                    excerpt: '',
                    slug: 'nouvel-article',
                    seo_meta: { title: null, description: null },
                    category_id: null,
                    is_current: false,
                    visibility_status: 'PUBLIC',
                },
            ])

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'MARK_CONTENT_AS_SAVED',
                payload: {
                    title: 'Nouvel Article',
                    content: '<p>Nouveau contenu</p>',
                    article: expect.objectContaining({
                        translation: newTranslation,
                    }),
                },
            })
        })

        it('does not create translation when article id is missing', async () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    articleMode: 'edit',
                    translationMode: 'new',
                    article: undefined,
                    savedSnapshot: { title: '', content: '' },
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            renderHook(() => useArticleAutoSave())

            await act(async () => {
                await debouncedCallback?.({
                    title: 'New Translation',
                    content: '<p>New content</p>',
                    mode: 'edit',
                    translationMode: 'new',
                    articleId: undefined,
                    savedSnapshot: { title: '', content: '' },
                })
            })

            expect(mockCreateTranslationMutateAsync).not.toHaveBeenCalled()
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_AUTO_SAVING',
                payload: false,
            })
        })

        it('calls onUpdatedFn callback on successful translation creation', async () => {
            const onUpdatedFn = jest.fn()
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    articleMode: 'edit',
                    translationMode: 'new',
                    savedSnapshot: { title: '', content: '' },
                },
            })
            mockContext.config.onUpdatedFn = onUpdatedFn
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            mockCreateTranslationMutateAsync.mockResolvedValue({
                data: createMockArticle().translation,
            })

            renderHook(() => useArticleAutoSave())

            await act(async () => {
                await debouncedCallback?.({
                    title: 'New Translation',
                    content: '<p>New content</p>',
                    mode: 'edit',
                    translationMode: 'new',
                    articleId: 1,
                    savedSnapshot: { title: '', content: '' },
                })
            })

            expect(onUpdatedFn).toHaveBeenCalled()
        })
    })

    describe('performAutoSave - edit mode with existing translation', () => {
        it('updates existing translation', async () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    articleMode: 'edit',
                    translationMode: 'existing',
                    savedSnapshot: {
                        title: 'Test Article',
                        content: '<p>Test content</p>',
                    },
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const updatedTranslation = {
                ...createMockArticle().translation,
                title: 'Updated Article',
                content: '<p>Updated content</p>',
            }
            mockUpdateTranslationMutateAsync.mockResolvedValue({
                data: updatedTranslation,
            })

            renderHook(() => useArticleAutoSave())

            await act(async () => {
                await debouncedCallback?.({
                    title: 'Updated Article',
                    content: '<p>Updated content</p>',
                    mode: 'edit',
                    translationMode: 'existing',
                    articleId: 1,
                    savedSnapshot: {
                        title: 'Test Article',
                        content: '<p>Test content</p>',
                    },
                })
            })

            expect(mockUpdateTranslationMutateAsync).toHaveBeenCalledWith([
                undefined,
                { help_center_id: 1, article_id: 1, locale: 'en-US' },
                {
                    title: 'Updated Article',
                    content: '<p>Updated content</p>',
                    is_current: false,
                },
            ])

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'MARK_CONTENT_AS_SAVED',
                payload: {
                    title: 'Updated Article',
                    content: '<p>Updated content</p>',
                    article: expect.objectContaining({
                        translation: expect.objectContaining({
                            title: 'Updated Article',
                            content: '<p>Updated content</p>',
                        }),
                    }),
                },
            })
        })

        it('does not update when article id is missing', async () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    articleMode: 'edit',
                    translationMode: 'existing',
                    article: undefined,
                    savedSnapshot: { title: 'Old', content: 'Old' },
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            renderHook(() => useArticleAutoSave())

            await act(async () => {
                await debouncedCallback?.({
                    title: 'Updated Article',
                    content: '<p>Updated content</p>',
                    mode: 'edit',
                    translationMode: 'existing',
                    articleId: undefined,
                    savedSnapshot: { title: 'Old', content: 'Old' },
                })
            })

            expect(mockUpdateTranslationMutateAsync).not.toHaveBeenCalled()
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_AUTO_SAVING',
                payload: false,
            })
        })

        it('calls onUpdatedFn callback on successful update', async () => {
            const onUpdatedFn = jest.fn()
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    articleMode: 'edit',
                    translationMode: 'existing',
                    savedSnapshot: { title: 'Old', content: 'Old' },
                },
            })
            mockContext.config.onUpdatedFn = onUpdatedFn
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            mockUpdateTranslationMutateAsync.mockResolvedValue({
                data: createMockArticle().translation,
            })

            renderHook(() => useArticleAutoSave())

            await act(async () => {
                await debouncedCallback?.({
                    title: 'Updated Article',
                    content: '<p>Updated content</p>',
                    mode: 'edit',
                    translationMode: 'existing',
                    articleId: 1,
                    savedSnapshot: { title: 'Old', content: 'Old' },
                })
            })

            expect(onUpdatedFn).toHaveBeenCalled()
        })
    })

    describe('error handling', () => {
        it('shows error notification when create article fails', async () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    articleMode: 'create',
                    translationMode: 'new',
                    savedSnapshot: { title: '', content: '' },
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            mockCreateArticleMutateAsync.mockRejectedValue(
                new Error('Network error'),
            )

            renderHook(() => useArticleAutoSave())

            await act(async () => {
                await debouncedCallback?.({
                    title: 'New Article',
                    content: '<p>New content</p>',
                    mode: 'create',
                    translationMode: 'new',
                    articleId: undefined,
                    savedSnapshot: { title: '', content: '' },
                })
            })

            expect(mockNotifyError).toHaveBeenCalledWith(
                'An error occurred while creating the article.',
            )
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_AUTO_SAVING',
                payload: false,
            })
        })

        it('shows error notification when update translation fails', async () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    articleMode: 'edit',
                    translationMode: 'existing',
                    savedSnapshot: { title: 'Old', content: 'Old' },
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            mockUpdateTranslationMutateAsync.mockRejectedValue(
                new Error('Network error'),
            )

            renderHook(() => useArticleAutoSave())

            await act(async () => {
                await debouncedCallback?.({
                    title: 'Updated Article',
                    content: '<p>Updated content</p>',
                    mode: 'edit',
                    translationMode: 'existing',
                    articleId: 1,
                    savedSnapshot: { title: 'Old', content: 'Old' },
                })
            })

            expect(mockNotifyError).toHaveBeenCalledWith(
                'An error occurred while saving the article.',
            )
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_AUTO_SAVING',
                payload: false,
            })
        })

        it('shows error notification when create translation fails', async () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    articleMode: 'edit',
                    translationMode: 'new',
                    savedSnapshot: { title: '', content: '' },
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            mockCreateTranslationMutateAsync.mockRejectedValue(
                new Error('Network error'),
            )

            renderHook(() => useArticleAutoSave())

            await act(async () => {
                await debouncedCallback?.({
                    title: 'New Translation',
                    content: '<p>New content</p>',
                    mode: 'edit',
                    translationMode: 'new',
                    articleId: 1,
                    savedSnapshot: { title: '', content: '' },
                })
            })

            expect(mockNotifyError).toHaveBeenCalledWith(
                'An error occurred while saving the article.',
            )
        })
    })

    describe('debounce behavior', () => {
        it('initializes debounced callback with correct delay', () => {
            const mockContext = createMockContextValue()
            mockUseArticleContext.mockReturnValue(mockContext)

            renderHook(() => useArticleAutoSave())

            expect(mockUseDebouncedCallback).toHaveBeenCalledWith(
                expect.any(Function),
                2000,
            )
        })
    })
})
