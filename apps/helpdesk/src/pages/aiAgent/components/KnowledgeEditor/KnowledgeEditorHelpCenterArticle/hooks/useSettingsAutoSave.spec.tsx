import { useDebouncedEffect } from '@repo/hooks'
import { act, renderHook, waitFor } from '@testing-library/react'

import useAppSelector from 'hooks/useAppSelector'
import { useNotify } from 'hooks/useNotify'
import { useUpdateArticleTranslation } from 'models/helpCenter/mutations'
import type {
    ArticleWithLocalTranslation,
    Category,
} from 'models/helpCenter/types'
import { AutoSaveState } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

import { useArticleContext } from '../context/ArticleContext'
import type { ArticleContextValue, SettingsChanges } from '../context/types'
import { useSettingsAutoSave } from './useSettingsAutoSave'

jest.mock('@repo/hooks', () => ({
    useDebouncedEffect: jest.fn(),
}))

jest.mock('hooks/useNotify')
jest.mock('hooks/useAppSelector')
jest.mock('models/helpCenter/mutations')
jest.mock('../context/ArticleContext')

jest.mock(
    'pages/settings/helpCenter/components/articles/ArticleCategorySelect/hooks/useCategoriesOptions',
    () => ({
        getCategoryOptions: jest.fn(() => [
            { label: '- No category -', value: 'null' },
            { label: 'Category 1', value: 1 },
        ]),
    }),
)

jest.mock(
    'pages/settings/helpCenter/components/HelpCenterCategoryEdit/utils',
    () => ({
        isOneOfParentsUnlisted: jest.fn(() => false),
    }),
)

jest.mock('pages/settings/helpCenter/utils/localeSelectOptions', () => ({
    getLocaleSelectOptions: jest.fn(() => [
        {
            id: 'en-US',
            label: 'English',
            text: 'English - USA',
            value: 'en-US',
        },
        {
            id: 'fr-FR',
            label: 'French',
            text: 'French - France',
            value: 'fr-FR',
        },
    ]),
}))

const mockUseDebouncedEffect = useDebouncedEffect as jest.Mock
const mockUseNotify = useNotify as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock
const mockUseUpdateArticleTranslation = useUpdateArticleTranslation as jest.Mock
const mockUseArticleContext = useArticleContext as jest.Mock

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

const createMockCategories = (): Category[] => [
    {
        id: 1,
        unlisted_id: 'cat-1',
        help_center_id: 1,
        available_locales: ['en-US'],
        children: [],
        created_datetime: '2024-01-01T00:00:00Z',
        updated_datetime: '2024-01-01T00:00:00Z',
        deleted_datetime: null,
        translation: {
            title: 'Category 1',
            description: 'Description 1',
            slug: 'category-1',
            category_id: 1,
            category_unlisted_id: 'cat-1',
            locale: 'en-US',
            customer_visibility: 'PUBLIC',
            parent_category_id: 0,
            image_url: null,
            seo_meta: { title: null, description: null },
            created_datetime: '2024-01-01T00:00:00Z',
            updated_datetime: '2024-01-01T00:00:00Z',
            deleted_datetime: null,
        },
        articleCount: 0,
        articles: [],
    },
]

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
            categories: createMockCategories(),
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

describe('useSettingsAutoSave', () => {
    let mockDispatch: jest.Mock
    let mockNotifyError: jest.Mock
    let mockMutateAsync: jest.Mock
    let debouncedCallback: (() => void) | null = null

    beforeEach(() => {
        jest.clearAllMocks()
        debouncedCallback = null

        mockDispatch = jest.fn()
        mockNotifyError = jest.fn()
        mockMutateAsync = jest.fn()

        mockUseNotify.mockReturnValue({ error: mockNotifyError })
        mockUseAppSelector.mockReturnValue({})
        mockUseUpdateArticleTranslation.mockReturnValue({
            mutateAsync: mockMutateAsync,
        })

        mockUseDebouncedEffect.mockImplementation((callback: () => void) => {
            debouncedCallback = callback
        })
    })

    describe('initialization', () => {
        it('returns settingsProps with correct initial values', () => {
            const mockContext = createMockContextValue()
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useSettingsAutoSave())

            expect(result.current.settingsProps.category.categoryId).toBe(1)
            expect(
                result.current.settingsProps.visibility.customerVisibility,
            ).toBe('PUBLIC')
            expect(result.current.settingsProps.slug?.slug).toBe('test-article')
            expect(result.current.settingsProps.excerpt.excerpt).toBe(
                'Test excerpt',
            )
            expect(result.current.settingsProps.metaTitle.metaTitle).toBe(
                'SEO Title',
            )
            expect(
                result.current.settingsProps.metaDescription.metaDescription,
            ).toBe('SEO Description')
            expect(result.current.settingsProps.title).toBe('Test Article')
        })

        it('returns autoSave state as INITIAL when no save has occurred', () => {
            const mockContext = createMockContextValue()
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useSettingsAutoSave())

            expect(result.current.autoSave.state).toBe(AutoSaveState.INITIAL)
            expect(result.current.autoSave.updatedAt).toEqual(
                new Date('2024-01-02T00:00:00Z'),
            )
        })

        it('returns autoSave state as SAVING when a setting change is triggered', () => {
            const mockContext = createMockContextValue()
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useSettingsAutoSave())

            expect(result.current.autoSave.state).toBe(AutoSaveState.INITIAL)

            act(() => {
                result.current.settingsProps.category.onChangeCategory(2)
            })

            expect(result.current.autoSave.state).toBe(AutoSaveState.SAVING)
        })

        it('returns undefined slug when article is not available', () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    article: undefined,
                },
            })
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useSettingsAutoSave())

            expect(result.current.settingsProps.slug).toBeUndefined()
        })

        it('uses pending settings changes when available', () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    pendingSettingsChanges: {
                        category_id: 2,
                        customer_visibility: 'UNLISTED',
                        slug: 'new-slug',
                        excerpt: 'New excerpt',
                        seo_meta: {
                            title: 'New SEO Title',
                            description: 'New SEO Description',
                        },
                    },
                },
            })
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useSettingsAutoSave())

            expect(result.current.settingsProps.category.categoryId).toBe(2)
            expect(
                result.current.settingsProps.visibility.customerVisibility,
            ).toBe('UNLISTED')
            expect(result.current.settingsProps.slug?.slug).toBe('new-slug')
            expect(result.current.settingsProps.excerpt.excerpt).toBe(
                'New excerpt',
            )
            expect(result.current.settingsProps.metaTitle.metaTitle).toBe(
                'New SEO Title',
            )
            expect(
                result.current.settingsProps.metaDescription.metaDescription,
            ).toBe('New SEO Description')
        })
    })

    describe('onChangeCategory', () => {
        it('dispatches SET_UPDATING and SET_PENDING_SETTINGS actions', () => {
            const mockContext = createMockContextValue()
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useSettingsAutoSave())

            act(() => {
                result.current.settingsProps.category.onChangeCategory(2)
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: true,
            })
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_PENDING_SETTINGS',
                payload: { category_id: 2 },
            })
        })

        it('can set category to null', () => {
            const mockContext = createMockContextValue()
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useSettingsAutoSave())

            act(() => {
                result.current.settingsProps.category.onChangeCategory(null)
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_PENDING_SETTINGS',
                payload: { category_id: null },
            })
        })
    })

    describe('onChangeVisibility', () => {
        it('dispatches SET_UPDATING and SET_PENDING_SETTINGS actions', () => {
            const mockContext = createMockContextValue()
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useSettingsAutoSave())

            act(() => {
                result.current.settingsProps.visibility.onChangeVisibility(
                    'UNLISTED',
                )
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: true,
            })
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_PENDING_SETTINGS',
                payload: { customer_visibility: 'UNLISTED' },
            })
        })
    })

    describe('onChangeSlug', () => {
        it('dispatches SET_UPDATING and SET_PENDING_SETTINGS actions', () => {
            const mockContext = createMockContextValue()
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useSettingsAutoSave())

            act(() => {
                result.current.settingsProps.slug?.onChangeSlug('new-slug')
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: true,
            })
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_PENDING_SETTINGS',
                payload: { slug: 'new-slug' },
            })
        })
    })

    describe('onChangeExcerpt', () => {
        it('dispatches SET_UPDATING and SET_PENDING_SETTINGS actions', () => {
            const mockContext = createMockContextValue()
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useSettingsAutoSave())

            act(() => {
                result.current.settingsProps.excerpt.onChangeExcerpt(
                    'New excerpt text',
                )
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: true,
            })
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_PENDING_SETTINGS',
                payload: { excerpt: 'New excerpt text' },
            })
        })
    })

    describe('onChangeMetaTitle', () => {
        it('dispatches SET_UPDATING and SET_PENDING_SETTINGS with seo_meta', () => {
            const mockContext = createMockContextValue()
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useSettingsAutoSave())

            act(() => {
                result.current.settingsProps.metaTitle.onChangeMetaTitle(
                    'New Meta Title',
                )
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: true,
            })
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_PENDING_SETTINGS',
                payload: {
                    seo_meta: {
                        title: 'New Meta Title',
                        description: 'SEO Description',
                    },
                },
            })
        })

        it('uses pending seo_meta description when available', () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    pendingSettingsChanges: {
                        seo_meta: {
                            title: 'Old Title',
                            description: 'Pending Description',
                        },
                    },
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useSettingsAutoSave())

            act(() => {
                result.current.settingsProps.metaTitle.onChangeMetaTitle(
                    'New Meta Title',
                )
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_PENDING_SETTINGS',
                payload: {
                    seo_meta: {
                        title: 'New Meta Title',
                        description: 'Pending Description',
                    },
                },
            })
        })
    })

    describe('onChangeMetaDescription', () => {
        it('dispatches SET_UPDATING and SET_PENDING_SETTINGS with seo_meta', () => {
            const mockContext = createMockContextValue()
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useSettingsAutoSave())

            act(() => {
                result.current.settingsProps.metaDescription.onChangeMetaDescription(
                    'New Meta Description',
                )
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: true,
            })
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_PENDING_SETTINGS',
                payload: {
                    seo_meta: {
                        title: 'SEO Title',
                        description: 'New Meta Description',
                    },
                },
            })
        })

        it('uses pending seo_meta title when available', () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    pendingSettingsChanges: {
                        seo_meta: {
                            title: 'Pending Title',
                            description: 'Old Description',
                        },
                    },
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useSettingsAutoSave())

            act(() => {
                result.current.settingsProps.metaDescription.onChangeMetaDescription(
                    'New Meta Description',
                )
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_PENDING_SETTINGS',
                payload: {
                    seo_meta: {
                        title: 'Pending Title',
                        description: 'New Meta Description',
                    },
                },
            })
        })
    })

    describe('onLocaleActionClick', () => {
        it('dispatches SET_MODAL for delete action', () => {
            const mockContext = createMockContextValue()
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useSettingsAutoSave())

            const mockLocaleOption = {
                id: 'en-US',
                label: <span>English</span>,
                text: 'English - USA',
                value: 'en-US' as const,
                isComplete: true,
                canBeDeleted: true,
            }

            act(() => {
                result.current.settingsProps.language.onActionClick(
                    'delete',
                    mockLocaleOption,
                )
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_MODAL',
                payload: {
                    type: 'delete-translation',
                    locale: mockLocaleOption,
                },
            })
        })

        it('dispatches SET_MODAL for view action when there are pending content changes', () => {
            const mockContext = createMockContextValue({
                hasPendingContentChanges: true,
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useSettingsAutoSave())

            const mockLocaleOption = {
                id: 'fr-FR',
                label: <span>French</span>,
                text: 'French - France',
                value: 'fr-FR' as const,
                isComplete: false,
                canBeDeleted: true,
            }

            act(() => {
                result.current.settingsProps.language.onActionClick(
                    'view',
                    mockLocaleOption,
                )
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_MODAL',
                payload: 'unsaved',
            })
        })

        it('dispatches SET_MODAL for create action when there are pending content changes', () => {
            const mockContext = createMockContextValue({
                hasPendingContentChanges: true,
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useSettingsAutoSave())

            const mockLocaleOption = {
                id: 'fr-FR',
                label: <span>French</span>,
                text: 'French - France',
                value: 'fr-FR' as const,
                isComplete: false,
                canBeDeleted: true,
            }

            act(() => {
                result.current.settingsProps.language.onActionClick(
                    'create',
                    mockLocaleOption,
                )
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_MODAL',
                payload: 'unsaved',
            })
        })

        it('does not dispatch SET_MODAL for view action when there are no pending changes', () => {
            const mockContext = createMockContextValue({
                hasPendingContentChanges: false,
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useSettingsAutoSave())

            const mockLocaleOption = {
                id: 'fr-FR',
                label: <span>French</span>,
                text: 'French - France',
                value: 'fr-FR' as const,
                isComplete: false,
                canBeDeleted: true,
            }

            act(() => {
                result.current.settingsProps.language.onActionClick(
                    'view',
                    mockLocaleOption,
                )
            })

            expect(mockDispatch).not.toHaveBeenCalled()
        })
    })

    describe('performSettingsSave (via debounced effect)', () => {
        it('calls mutation and dispatches UPDATE_TRANSLATION on success', async () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    pendingSettingsChanges: {
                        category_id: 2,
                    },
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            const mockResponseData = {
                ...mockContext.state.article?.translation,
                category_id: 2,
            }
            mockMutateAsync.mockResolvedValue({ data: mockResponseData })

            renderHook(() => useSettingsAutoSave())

            expect(debouncedCallback).not.toBeNull()

            await act(async () => {
                await debouncedCallback?.()
            })

            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalledWith([
                    undefined,
                    {
                        help_center_id: 1,
                        article_id: 1,
                        locale: 'en-US',
                    },
                    {
                        category_id: 2,
                        is_current: false,
                    },
                ])
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'UPDATE_TRANSLATION',
                payload: mockResponseData,
            })
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'CLEAR_PENDING_SETTINGS',
            })
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: false,
            })
        })

        it('does not save when translation mode is new', async () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    translationMode: 'new',
                    pendingSettingsChanges: {
                        category_id: 2,
                    },
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            renderHook(() => useSettingsAutoSave())

            await act(async () => {
                await debouncedCallback?.()
            })

            expect(mockMutateAsync).not.toHaveBeenCalled()
        })

        it('does not save when article id is missing', async () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    article: undefined,
                    pendingSettingsChanges: {
                        category_id: 2,
                    },
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            renderHook(() => useSettingsAutoSave())

            await act(async () => {
                await debouncedCallback?.()
            })

            expect(mockMutateAsync).not.toHaveBeenCalled()
        })

        it('does not save when there are no pending changes', async () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    pendingSettingsChanges: {},
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            renderHook(() => useSettingsAutoSave())

            await act(async () => {
                await debouncedCallback?.()
            })

            expect(mockMutateAsync).not.toHaveBeenCalled()
        })

        it('shows error notification on mutation failure', async () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    pendingSettingsChanges: {
                        category_id: 2,
                    },
                },
            })
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            mockMutateAsync.mockRejectedValue(new Error('Network error'))

            renderHook(() => useSettingsAutoSave())

            await act(async () => {
                await debouncedCallback?.()
            })

            await waitFor(() => {
                expect(mockNotifyError).toHaveBeenCalledWith(
                    'An error occurred while saving the settings.',
                )
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'CLEAR_PENDING_SETTINGS',
            })
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: false,
            })
        })

        it('calls onUpdatedFn callback on successful save', async () => {
            const onUpdatedFn = jest.fn()
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    pendingSettingsChanges: {
                        category_id: 2,
                    },
                },
            })
            mockContext.config.onUpdatedFn = onUpdatedFn
            mockContext.dispatch = mockDispatch
            mockUseArticleContext.mockReturnValue(mockContext)

            mockMutateAsync.mockResolvedValue({
                data: mockContext.state.article?.translation,
            })

            renderHook(() => useSettingsAutoSave())

            await act(async () => {
                await debouncedCallback?.()
            })

            await waitFor(() => {
                expect(onUpdatedFn).toHaveBeenCalled()
            })
        })
    })

    describe('locale options', () => {
        it('computes locale options with isComplete and canBeDeleted flags', () => {
            const mockContext = createMockContextValue()
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useSettingsAutoSave())

            expect(result.current.settingsProps.language.locale).toBe('en-US')
            expect(
                result.current.settingsProps.language.localeOptions,
            ).toBeDefined()
        })
    })

    describe('category titles by id', () => {
        it('builds category titles map from categories', () => {
            const mockContext = createMockContextValue()
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useSettingsAutoSave())

            expect(
                result.current.settingsProps.category.categoryTitlesById,
            ).toEqual({
                1: 'Category 1',
            })
        })

        it('handles categories without translations', () => {
            const categoriesWithoutTranslation: Category[] = [
                {
                    id: 2,
                    unlisted_id: 'cat-2',
                    help_center_id: 1,
                    available_locales: ['en-US'],
                    children: [],
                    created_datetime: '2024-01-01T00:00:00Z',
                    updated_datetime: '2024-01-01T00:00:00Z',
                    deleted_datetime: null,
                    translation: null as unknown as Category['translation'],
                    articleCount: 0,
                    articles: [],
                },
            ]

            const mockContext = createMockContextValue()
            mockContext.config.categories = categoriesWithoutTranslation
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useSettingsAutoSave())

            expect(
                result.current.settingsProps.category.categoryTitlesById,
            ).toEqual({})
        })
    })

    describe('fallback values', () => {
        it('uses fallback values when article translation is missing', () => {
            const articleWithoutValues = createMockArticle({
                translation: {
                    locale: 'en-US',
                    title: '',
                    content: '',
                    slug: '',
                    excerpt: '',
                    category_id: null,
                    visibility_status: 'PUBLIC',
                    customer_visibility: 'PUBLIC',
                    article_id: 1,
                    article_unlisted_id: 'test-unlisted-id',
                    seo_meta: { title: null, description: null },
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
            } as Partial<ArticleWithLocalTranslation>)

            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    article: articleWithoutValues,
                },
            })
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useSettingsAutoSave())

            expect(result.current.settingsProps.category.categoryId).toBeNull()
            expect(
                result.current.settingsProps.visibility.customerVisibility,
            ).toBe('PUBLIC')
            expect(result.current.settingsProps.excerpt.excerpt).toBe('')
            expect(result.current.settingsProps.metaTitle.metaTitle).toBe('')
            expect(
                result.current.settingsProps.metaDescription.metaDescription,
            ).toBe('')
        })

        it('returns undefined updatedAt when article has no updated_datetime', () => {
            const articleWithoutDate = createMockArticle({
                translation: {
                    ...createMockArticle().translation,
                    updated_datetime: undefined as unknown as string,
                },
            } as Partial<ArticleWithLocalTranslation>)

            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    article: articleWithoutDate,
                },
            })
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useSettingsAutoSave())

            expect(result.current.autoSave.updatedAt).toBeUndefined()
        })
    })

    describe('creation mode', () => {
        it('returns isCreationMode as true when articleMode is create and no article exists', () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    articleMode: 'create',
                    article: undefined,
                },
            })
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useSettingsAutoSave())

            expect(result.current.isCreationMode).toBe(true)
        })

        it('returns isCreationMode as false when articleMode is create but article exists', () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    articleMode: 'create',
                    article: createMockArticle(),
                },
            })
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useSettingsAutoSave())

            expect(result.current.isCreationMode).toBe(false)
        })

        it('returns isCreationMode as false when articleMode is edit', () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    articleMode: 'edit',
                    article: createMockArticle(),
                },
            })
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useSettingsAutoSave())

            expect(result.current.isCreationMode).toBe(false)
        })

        it('returns autoSave state as INITIAL when in creation mode', () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    articleMode: 'create',
                    article: undefined,
                },
            })
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useSettingsAutoSave())

            expect(result.current.autoSave.state).toBe(AutoSaveState.INITIAL)
        })

        it('returns autoSave state as INITIAL when article is created but no save occurred', () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    articleMode: 'create',
                    article: createMockArticle(),
                },
            })
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useSettingsAutoSave())

            expect(result.current.autoSave.state).toBe(AutoSaveState.INITIAL)
        })

        it('returns autoSave state as INITIAL when in view (read) mode', () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    articleMode: 'read',
                    article: createMockArticle(),
                },
            })
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useSettingsAutoSave())

            expect(result.current.autoSave.state).toBe(AutoSaveState.INITIAL)
        })

        it('returns autoSave state as INITIAL when in edit mode and no save occurred', () => {
            const mockContext = createMockContextValue({
                state: {
                    ...createMockContextValue().state,
                    articleMode: 'edit',
                    article: createMockArticle(),
                },
            })
            mockUseArticleContext.mockReturnValue(mockContext)

            const { result } = renderHook(() => useSettingsAutoSave())

            expect(result.current.autoSave.state).toBe(AutoSaveState.INITIAL)
        })
    })
})
