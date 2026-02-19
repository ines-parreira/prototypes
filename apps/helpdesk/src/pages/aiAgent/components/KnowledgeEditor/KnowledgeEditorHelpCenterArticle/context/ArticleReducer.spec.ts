import type {
    ArticleWithLocalTranslation,
    LocaleCode,
} from 'models/helpCenter/types'

import { articleReducer } from './ArticleReducer'
import type {
    ArticleState,
    ArticleTranslationVersion,
    ImpactDateRange,
    SettingsChanges,
} from './types'

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

type VersionWithImpactDateRange = ArticleTranslationVersion & {
    impactDateRange: ImpactDateRange
}

const createMockVersion = (
    overrides: Partial<VersionWithImpactDateRange> = {},
): VersionWithImpactDateRange => ({
    id: 10,
    version: 3,
    title: 'Version Title',
    content: '<p>Version content</p>',
    excerpt: 'Version excerpt',
    slug: 'version-slug',
    seo_meta: null,
    created_datetime: '2024-03-01T00:00:00Z',
    published_datetime: '2024-03-01T12:00:00Z',
    commit_message: 'Published v3',
    publisher_user_id: 42,
    impactDateRange: { start_datetime: '', end_datetime: '' },
    ...overrides,
})

const createInitialState = (
    overrides: Partial<ArticleState> = {},
): ArticleState => ({
    articleMode: 'edit',
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
    translationMode: 'existing',
    currentLocale: 'en-US',
    pendingSettingsChanges: {} as SettingsChanges,
    versionStatus: 'latest_draft',
    activeModal: null,
    isUpdating: false,
    templateKey: undefined,
    historicalVersion: null,
    comparisonVersion: null,
    ...overrides,
})

describe('articleReducer', () => {
    describe('Mode & UI actions', () => {
        describe('SET_MODE', () => {
            it('should set articleMode to the provided value', () => {
                const state = createInitialState({ articleMode: 'edit' })

                const result = articleReducer(state, {
                    type: 'SET_MODE',
                    payload: 'read',
                })

                expect(result.articleMode).toBe('read')
            })

            it('should not modify other state properties', () => {
                const state = createInitialState()

                const result = articleReducer(state, {
                    type: 'SET_MODE',
                    payload: 'create',
                })

                expect(result.title).toBe(state.title)
                expect(result.content).toBe(state.content)
                expect(result.isFullscreen).toBe(state.isFullscreen)
            })

            it('should reset hasAutoSavedInSession to false when switching to read mode', () => {
                const state = createInitialState({
                    articleMode: 'edit',
                    hasAutoSavedInSession: true,
                })

                const result = articleReducer(state, {
                    type: 'SET_MODE',
                    payload: 'read',
                })

                expect(result.hasAutoSavedInSession).toBe(false)
            })

            it('should preserve hasAutoSavedInSession when switching to edit mode', () => {
                const state = createInitialState({
                    articleMode: 'read',
                    hasAutoSavedInSession: true,
                })

                const result = articleReducer(state, {
                    type: 'SET_MODE',
                    payload: 'edit',
                })

                expect(result.hasAutoSavedInSession).toBe(true)
            })

            it('should update articleMode to diff', () => {
                const state = createInitialState({ articleMode: 'read' })

                const result = articleReducer(state, {
                    type: 'SET_MODE',
                    payload: 'diff',
                })

                expect(result.articleMode).toBe('diff')
            })

            it('should reset hasAutoSavedInSession to false when switching to diff mode', () => {
                const state = createInitialState({
                    articleMode: 'edit',
                    hasAutoSavedInSession: true,
                })

                const result = articleReducer(state, {
                    type: 'SET_MODE',
                    payload: 'diff',
                })

                expect(result.hasAutoSavedInSession).toBe(false)
            })

            it('should preserve hasAutoSavedInSession when switching to create mode', () => {
                const state = createInitialState({
                    articleMode: 'edit',
                    hasAutoSavedInSession: true,
                })

                const result = articleReducer(state, {
                    type: 'SET_MODE',
                    payload: 'create',
                })

                expect(result.hasAutoSavedInSession).toBe(true)
            })
        })

        describe('SET_FULLSCREEN', () => {
            it('should set isFullscreen to true', () => {
                const state = createInitialState({ isFullscreen: false })

                const result = articleReducer(state, {
                    type: 'SET_FULLSCREEN',
                    payload: true,
                })

                expect(result.isFullscreen).toBe(true)
            })

            it('should set isFullscreen to false', () => {
                const state = createInitialState({ isFullscreen: true })

                const result = articleReducer(state, {
                    type: 'SET_FULLSCREEN',
                    payload: false,
                })

                expect(result.isFullscreen).toBe(false)
            })
        })

        describe('TOGGLE_FULLSCREEN', () => {
            it('should toggle isFullscreen from false to true', () => {
                const state = createInitialState({ isFullscreen: false })

                const result = articleReducer(state, {
                    type: 'TOGGLE_FULLSCREEN',
                })

                expect(result.isFullscreen).toBe(true)
            })

            it('should toggle isFullscreen from true to false', () => {
                const state = createInitialState({ isFullscreen: true })

                const result = articleReducer(state, {
                    type: 'TOGGLE_FULLSCREEN',
                })

                expect(result.isFullscreen).toBe(false)
            })
        })

        describe('SET_DETAILS_VIEW', () => {
            it('should set isDetailsView to the provided value', () => {
                const state = createInitialState({ isDetailsView: true })

                const result = articleReducer(state, {
                    type: 'SET_DETAILS_VIEW',
                    payload: false,
                })

                expect(result.isDetailsView).toBe(false)
            })
        })

        describe('TOGGLE_DETAILS_VIEW', () => {
            it('should toggle isDetailsView from true to false', () => {
                const state = createInitialState({ isDetailsView: true })

                const result = articleReducer(state, {
                    type: 'TOGGLE_DETAILS_VIEW',
                })

                expect(result.isDetailsView).toBe(false)
            })

            it('should toggle isDetailsView from false to true', () => {
                const state = createInitialState({ isDetailsView: false })

                const result = articleReducer(state, {
                    type: 'TOGGLE_DETAILS_VIEW',
                })

                expect(result.isDetailsView).toBe(true)
            })
        })
    })

    describe('Form data actions', () => {
        describe('SET_TITLE', () => {
            it('should set title to the provided value', () => {
                const state = createInitialState({ title: 'Old Title' })

                const result = articleReducer(state, {
                    type: 'SET_TITLE',
                    payload: 'New Title',
                })

                expect(result.title).toBe('New Title')
            })

            it('should allow empty title', () => {
                const state = createInitialState({ title: 'Some Title' })

                const result = articleReducer(state, {
                    type: 'SET_TITLE',
                    payload: '',
                })

                expect(result.title).toBe('')
            })
        })

        describe('SET_CONTENT', () => {
            it('should set content to the provided value', () => {
                const state = createInitialState({
                    content: '<p>Old content</p>',
                })

                const result = articleReducer(state, {
                    type: 'SET_CONTENT',
                    payload: '<p>New content</p>',
                })

                expect(result.content).toBe('<p>New content</p>')
            })

            it('should allow empty content', () => {
                const state = createInitialState({
                    content: '<p>Some content</p>',
                })

                const result = articleReducer(state, {
                    type: 'SET_CONTENT',
                    payload: '',
                })

                expect(result.content).toBe('')
            })
        })

        describe('MARK_CONTENT_AS_SAVED', () => {
            it('should update savedSnapshot with payload values', () => {
                const article = createMockArticle()
                const state = createInitialState({
                    title: 'Current Title',
                    content: '<p>Current content</p>',
                    isAutoSaving: true,
                })

                const result = articleReducer(state, {
                    type: 'MARK_CONTENT_AS_SAVED',
                    payload: {
                        title: 'Saved Title',
                        content: '<p>Saved content</p>',
                        article,
                    },
                })

                expect(result.savedSnapshot).toEqual({
                    title: 'Saved Title',
                    content: '<p>Saved content</p>',
                })
                expect(result.article).toBe(article)
                expect(result.isAutoSaving).toBe(false)
                expect(result.translationMode).toBe('existing')
            })

            it('should use current state values when payload is undefined', () => {
                const state = createInitialState({
                    title: 'Current Title',
                    content: '<p>Current content</p>',
                    isAutoSaving: true,
                })

                const result = articleReducer(state, {
                    type: 'MARK_CONTENT_AS_SAVED',
                })

                expect(result.savedSnapshot).toEqual({
                    title: 'Current Title',
                    content: '<p>Current content</p>',
                })
                expect(result.isAutoSaving).toBe(false)
                expect(result.translationMode).toBe('existing')
            })

            it('should set translationMode to existing', () => {
                const state = createInitialState({ translationMode: 'new' })

                const result = articleReducer(state, {
                    type: 'MARK_CONTENT_AS_SAVED',
                })

                expect(result.translationMode).toBe('existing')
            })
        })

        describe('SET_AUTO_SAVING', () => {
            it('should set isAutoSaving to true', () => {
                const state = createInitialState({ isAutoSaving: false })

                const result = articleReducer(state, {
                    type: 'SET_AUTO_SAVING',
                    payload: true,
                })

                expect(result.isAutoSaving).toBe(true)
            })

            it('should set isAutoSaving to false', () => {
                const state = createInitialState({ isAutoSaving: true })

                const result = articleReducer(state, {
                    type: 'SET_AUTO_SAVING',
                    payload: false,
                })

                expect(result.isAutoSaving).toBe(false)
            })
        })
    })

    describe('Article reference actions', () => {
        describe('SET_ARTICLE', () => {
            it('should set article to the provided value', () => {
                const newArticle = createMockArticle({ id: 2 })
                const state = createInitialState()

                const result = articleReducer(state, {
                    type: 'SET_ARTICLE',
                    payload: newArticle,
                })

                expect(result.article).toBe(newArticle)
                expect(result.article?.id).toBe(2)
            })
        })

        describe('SET_TRANSLATION_MODE', () => {
            it('should set translationMode to new', () => {
                const state = createInitialState({
                    translationMode: 'existing',
                })

                const result = articleReducer(state, {
                    type: 'SET_TRANSLATION_MODE',
                    payload: 'new',
                })

                expect(result.translationMode).toBe('new')
            })

            it('should set translationMode to existing', () => {
                const state = createInitialState({ translationMode: 'new' })

                const result = articleReducer(state, {
                    type: 'SET_TRANSLATION_MODE',
                    payload: 'existing',
                })

                expect(result.translationMode).toBe('existing')
            })
        })

        describe('UPDATE_TRANSLATION', () => {
            it('should update translation fields when article exists', () => {
                const state = createInitialState({
                    article: createMockArticle(),
                })

                const result = articleReducer(state, {
                    type: 'UPDATE_TRANSLATION',
                    payload: {
                        title: 'Updated Title',
                        slug: 'updated-slug',
                    },
                })

                expect(result.article?.translation.title).toBe('Updated Title')
                expect(result.article?.translation.slug).toBe('updated-slug')
                expect(result.article?.translation.content).toBe(
                    '<p>Test content</p>',
                )
            })

            it('should return state unchanged when article is undefined', () => {
                const state = createInitialState({ article: undefined })

                const result = articleReducer(state, {
                    type: 'UPDATE_TRANSLATION',
                    payload: { title: 'New Title' },
                })

                expect(result).toBe(state)
            })

            it('should preserve other article properties', () => {
                const state = createInitialState()

                const result = articleReducer(state, {
                    type: 'UPDATE_TRANSLATION',
                    payload: { title: 'New Title' },
                })

                expect(result.article?.id).toBe(state.article?.id)
                expect(result.article?.help_center_id).toBe(
                    state.article?.help_center_id,
                )
            })
        })
    })

    describe('Locale actions', () => {
        describe('SET_LOCALE', () => {
            it('should set currentLocale to the provided value', () => {
                const state = createInitialState({ currentLocale: 'en-US' })

                const result = articleReducer(state, {
                    type: 'SET_LOCALE',
                    payload: 'fr-FR',
                })

                expect(result.currentLocale).toBe('fr-FR')
            })

            it('should clear pendingSettingsChanges', () => {
                const state = createInitialState({
                    pendingSettingsChanges: {
                        category_id: 5,
                        slug: 'test-slug',
                    } as SettingsChanges,
                })

                const result = articleReducer(state, {
                    type: 'SET_LOCALE',
                    payload: 'fr-FR',
                })

                expect(result.pendingSettingsChanges).toEqual({})
            })
        })

        describe('SWITCH_ARTICLE', () => {
            it('should update multiple fields when switching to existing article', () => {
                const newArticle = createMockArticle({
                    id: 2,
                    translation: {
                        locale: 'fr-FR',
                        title: 'French Article',
                        content: '<p>French content</p>',
                        slug: 'french-article',
                        excerpt: 'French excerpt',
                        category_id: 2,
                        visibility_status: 'PUBLIC',
                        article_id: 2,
                        article_unlisted_id: 'french-unlisted-id',
                        seo_meta: { title: '', description: '' },
                        created_datetime: '2024-01-01T00:00:00Z',
                        updated_datetime: '2024-01-02T00:00:00Z',
                        deleted_datetime: null,
                        is_current: true,
                        draft_version_id: null,
                        published_version_id: null,
                        published_datetime: null,
                        publisher_user_id: null,
                        commit_message: null,
                        version: null,
                    },
                })
                const state = createInitialState({
                    articleMode: 'read',
                    pendingSettingsChanges: {
                        category_id: 5,
                    } as SettingsChanges,
                })

                const result = articleReducer(state, {
                    type: 'SWITCH_ARTICLE',
                    payload: {
                        article: newArticle,
                        locale: 'fr-FR',
                        translationMode: 'existing',
                    },
                })

                expect(result.article).toBe(newArticle)
                expect(result.currentLocale).toBe('fr-FR')
                expect(result.translationMode).toBe('existing')
                expect(result.title).toBe('French Article')
                expect(result.content).toBe('<p>French content</p>')
                expect(result.savedSnapshot).toEqual({
                    title: 'French Article',
                    content: '<p>French content</p>',
                })
                expect(result.pendingSettingsChanges).toEqual({})
                expect(result.articleMode).toBe('read')
            })

            it('should set articleMode to edit when translationMode is new', () => {
                const state = createInitialState({ articleMode: 'read' })

                const result = articleReducer(state, {
                    type: 'SWITCH_ARTICLE',
                    payload: {
                        article: undefined,
                        locale: 'de-DE',
                        translationMode: 'new',
                    },
                })

                expect(result.articleMode).toBe('edit')
                expect(result.title).toBe('')
                expect(result.content).toBe('')
            })

            it('should use empty strings when article is undefined', () => {
                const state = createInitialState()

                const result = articleReducer(state, {
                    type: 'SWITCH_ARTICLE',
                    payload: {
                        article: undefined,
                        locale: 'es-ES',
                        translationMode: 'new',
                    },
                })

                expect(result.article).toBeUndefined()
                expect(result.title).toBe('')
                expect(result.content).toBe('')
                expect(result.savedSnapshot).toEqual({
                    title: '',
                    content: '',
                })
            })
        })
    })

    describe('Settings actions', () => {
        describe('SET_PENDING_SETTINGS', () => {
            it('should merge new settings with existing pendingSettingsChanges', () => {
                const state = createInitialState({
                    pendingSettingsChanges: {
                        category_id: 1,
                    } as SettingsChanges,
                })

                const result = articleReducer(state, {
                    type: 'SET_PENDING_SETTINGS',
                    payload: { slug: 'new-slug' },
                })

                expect(result.pendingSettingsChanges).toEqual({
                    category_id: 1,
                    slug: 'new-slug',
                })
            })

            it('should override existing settings with same key', () => {
                const state = createInitialState({
                    pendingSettingsChanges: {
                        category_id: 1,
                        slug: 'old-slug',
                    } as SettingsChanges,
                })

                const result = articleReducer(state, {
                    type: 'SET_PENDING_SETTINGS',
                    payload: { slug: 'new-slug' },
                })

                expect(result.pendingSettingsChanges.slug).toBe('new-slug')
                expect(result.pendingSettingsChanges.category_id).toBe(1)
            })
        })

        describe('CLEAR_PENDING_SETTINGS', () => {
            it('should clear all pending settings', () => {
                const state = createInitialState({
                    pendingSettingsChanges: {
                        category_id: 1,
                        slug: 'test-slug',
                        excerpt: 'Test excerpt',
                    } as SettingsChanges,
                })

                const result = articleReducer(state, {
                    type: 'CLEAR_PENDING_SETTINGS',
                })

                expect(result.pendingSettingsChanges).toEqual({})
            })
        })
    })

    describe('Version actions', () => {
        describe('SET_VERSION_STATUS', () => {
            it('should set versionStatus to latest_draft', () => {
                const state = createInitialState({ versionStatus: 'current' })

                const result = articleReducer(state, {
                    type: 'SET_VERSION_STATUS',
                    payload: 'latest_draft',
                })

                expect(result.versionStatus).toBe('latest_draft')
            })

            it('should set versionStatus to current', () => {
                const state = createInitialState({
                    versionStatus: 'latest_draft',
                })

                const result = articleReducer(state, {
                    type: 'SET_VERSION_STATUS',
                    payload: 'current',
                })

                expect(result.versionStatus).toBe('current')
            })
        })

        describe('SWITCH_VERSION', () => {
            it('should update article and content when switching versions', () => {
                const newArticle = createMockArticle({
                    translation: {
                        locale: 'en-US',
                        title: 'Published Title',
                        content: '<p>Published content</p>',
                        slug: 'test-article',
                        excerpt: 'Test excerpt',
                        category_id: 1,
                        visibility_status: 'PUBLIC',
                        article_id: 1,
                        article_unlisted_id: 'test-unlisted-id',
                        seo_meta: { title: '', description: '' },
                        created_datetime: '2024-01-01T00:00:00Z',
                        updated_datetime: '2024-01-02T00:00:00Z',
                        deleted_datetime: null,
                        is_current: true,
                        draft_version_id: null,
                        published_version_id: null,
                        published_datetime: null,
                        publisher_user_id: null,
                        commit_message: null,
                        version: null,
                    },
                })
                const state = createInitialState({
                    articleMode: 'edit',
                    versionStatus: 'latest_draft',
                })

                const result = articleReducer(state, {
                    type: 'SWITCH_VERSION',
                    payload: {
                        article: newArticle,
                        versionStatus: 'current',
                    },
                })

                expect(result.versionStatus).toBe('current')
                expect(result.article).toBe(newArticle)
                expect(result.title).toBe('Published Title')
                expect(result.content).toBe('<p>Published content</p>')
                expect(result.savedSnapshot).toEqual({
                    title: 'Published Title',
                    content: '<p>Published content</p>',
                })
            })

            it('should set articleMode to read when switching to current version', () => {
                const article = createMockArticle()
                const state = createInitialState({ articleMode: 'edit' })

                const result = articleReducer(state, {
                    type: 'SWITCH_VERSION',
                    payload: {
                        article,
                        versionStatus: 'current',
                    },
                })

                expect(result.articleMode).toBe('read')
            })

            it('should preserve articleMode when switching to draft version', () => {
                const article = createMockArticle()
                const state = createInitialState({ articleMode: 'read' })

                const result = articleReducer(state, {
                    type: 'SWITCH_VERSION',
                    payload: {
                        article,
                        versionStatus: 'latest_draft',
                    },
                })

                expect(result.articleMode).toBe('read')
            })

            it('should reset hasAutoSavedInSession to false when switching versions', () => {
                const article = createMockArticle()
                const state = createInitialState({
                    hasAutoSavedInSession: true,
                })

                const result = articleReducer(state, {
                    type: 'SWITCH_VERSION',
                    payload: {
                        article,
                        versionStatus: 'current',
                    },
                })

                expect(result.hasAutoSavedInSession).toBe(false)
            })
        })
    })

    describe('Modal actions', () => {
        describe('SET_MODAL', () => {
            it('should set activeModal to unsaved', () => {
                const state = createInitialState({ activeModal: null })

                const result = articleReducer(state, {
                    type: 'SET_MODAL',
                    payload: 'unsaved',
                })

                expect(result.activeModal).toBe('unsaved')
            })

            it('should set activeModal to delete-article', () => {
                const state = createInitialState({ activeModal: null })

                const result = articleReducer(state, {
                    type: 'SET_MODAL',
                    payload: 'delete-article',
                })

                expect(result.activeModal).toBe('delete-article')
            })

            it('should set activeModal to discard-draft', () => {
                const state = createInitialState({ activeModal: null })

                const result = articleReducer(state, {
                    type: 'SET_MODAL',
                    payload: 'discard-draft',
                })

                expect(result.activeModal).toBe('discard-draft')
            })

            it('should set activeModal to delete-translation object', () => {
                const state = createInitialState({ activeModal: null })
                const locale = {
                    code: 'fr-FR',
                    name: 'French',
                    label: 'French',
                    value: 'fr-FR' as LocaleCode,
                    text: 'French',
                }

                const result = articleReducer(state, {
                    type: 'SET_MODAL',
                    payload: { type: 'delete-translation', locale },
                })

                expect(result.activeModal).toEqual({
                    type: 'delete-translation',
                    locale,
                })
            })

            it('should set activeModal to null', () => {
                const state = createInitialState({ activeModal: 'unsaved' })

                const result = articleReducer(state, {
                    type: 'SET_MODAL',
                    payload: null,
                })

                expect(result.activeModal).toBeNull()
            })
        })

        describe('CLOSE_MODAL', () => {
            it('should set activeModal to null', () => {
                const state = createInitialState({ activeModal: 'unsaved' })

                const result = articleReducer(state, { type: 'CLOSE_MODAL' })

                expect(result.activeModal).toBeNull()
            })

            it('should set activeModal to null when already null', () => {
                const state = createInitialState({ activeModal: null })

                const result = articleReducer(state, { type: 'CLOSE_MODAL' })

                expect(result.activeModal).toBeNull()
            })
        })
    })

    describe('Loading actions', () => {
        describe('SET_UPDATING', () => {
            it('should set isUpdating to true', () => {
                const state = createInitialState({ isUpdating: false })

                const result = articleReducer(state, {
                    type: 'SET_UPDATING',
                    payload: true,
                })

                expect(result.isUpdating).toBe(true)
            })

            it('should set isUpdating to false', () => {
                const state = createInitialState({ isUpdating: true })

                const result = articleReducer(state, {
                    type: 'SET_UPDATING',
                    payload: false,
                })

                expect(result.isUpdating).toBe(false)
            })
        })
    })

    describe('Reset actions', () => {
        describe('RESET_TO_SERVER', () => {
            it('should reset title and content to server values', () => {
                const state = createInitialState({
                    title: 'Local Title',
                    content: '<p>Local content</p>',
                    savedSnapshot: {
                        title: 'Old Snapshot',
                        content: '<p>Old snapshot</p>',
                    },
                    isAutoSaving: true,
                })

                const result = articleReducer(state, {
                    type: 'RESET_TO_SERVER',
                    payload: {
                        title: 'Server Title',
                        content: '<p>Server content</p>',
                    },
                })

                expect(result.title).toBe('Server Title')
                expect(result.content).toBe('<p>Server content</p>')
                expect(result.savedSnapshot).toEqual({
                    title: 'Server Title',
                    content: '<p>Server content</p>',
                })
                expect(result.isAutoSaving).toBe(false)
            })

            it('should preserve other state properties', () => {
                const state = createInitialState({
                    articleMode: 'edit',
                    isFullscreen: true,
                    currentLocale: 'fr-FR',
                })

                const result = articleReducer(state, {
                    type: 'RESET_TO_SERVER',
                    payload: {
                        title: 'Reset Title',
                        content: '<p>Reset content</p>',
                    },
                })

                expect(result.articleMode).toBe('edit')
                expect(result.isFullscreen).toBe(true)
                expect(result.currentLocale).toBe('fr-FR')
            })
        })
    })

    describe('Historical version actions', () => {
        describe('VIEW_HISTORICAL_VERSION', () => {
            it('should set historicalVersion with version data', () => {
                const state = createInitialState()
                const version = createMockVersion()

                const result = articleReducer(state, {
                    type: 'VIEW_HISTORICAL_VERSION',
                    payload: version,
                })

                expect(result.historicalVersion).toEqual({
                    versionId: 10,
                    version: 3,
                    title: 'Version Title',
                    content: '<p>Version content</p>',
                    publishedDatetime: '2024-03-01T12:00:00Z',
                    publisherUserId: 42,
                    commitMessage: 'Published v3',
                    impactDateRange: {
                        start_datetime: '',
                        end_datetime: '',
                    },
                })
            })

            it('should update title and content to the version values', () => {
                const state = createInitialState({
                    title: 'Current Title',
                    content: '<p>Current content</p>',
                })
                const version = createMockVersion({
                    title: 'Old Version Title',
                    content: '<p>Old version content</p>',
                })

                const result = articleReducer(state, {
                    type: 'VIEW_HISTORICAL_VERSION',
                    payload: version,
                })

                expect(result.title).toBe('Old Version Title')
                expect(result.content).toBe('<p>Old version content</p>')
            })

            it('should set articleMode to read', () => {
                const state = createInitialState({ articleMode: 'edit' })
                const version = createMockVersion()

                const result = articleReducer(state, {
                    type: 'VIEW_HISTORICAL_VERSION',
                    payload: version,
                })

                expect(result.articleMode).toBe('read')
            })

            it('should default title and content to empty string when null', () => {
                const state = createInitialState()
                const version = createMockVersion({
                    title: null as unknown as string,
                    content: null as unknown as string,
                })

                const result = articleReducer(state, {
                    type: 'VIEW_HISTORICAL_VERSION',
                    payload: version,
                })

                expect(result.title).toBe('')
                expect(result.content).toBe('')
                expect(result.historicalVersion?.title).toBe('')
                expect(result.historicalVersion?.content).toBe('')
            })

            it('should handle version without optional fields', () => {
                const state = createInitialState()
                const version = createMockVersion({
                    published_datetime: null,
                    publisher_user_id: undefined,
                    commit_message: undefined,
                })

                const result = articleReducer(state, {
                    type: 'VIEW_HISTORICAL_VERSION',
                    payload: version,
                })

                expect(result.historicalVersion).toEqual({
                    versionId: 10,
                    version: 3,
                    title: 'Version Title',
                    content: '<p>Version content</p>',
                    publishedDatetime: null,
                    publisherUserId: undefined,
                    commitMessage: undefined,
                    impactDateRange: {
                        end_datetime: '',
                        start_datetime: '',
                    },
                })
            })

            it('should preserve other state properties', () => {
                const state = createInitialState({
                    isFullscreen: true,
                    isDetailsView: false,
                    currentLocale: 'fr-FR',
                    versionStatus: 'current',
                })
                const version = createMockVersion()

                const result = articleReducer(state, {
                    type: 'VIEW_HISTORICAL_VERSION',
                    payload: version,
                })

                expect(result.isFullscreen).toBe(true)
                expect(result.isDetailsView).toBe(false)
                expect(result.currentLocale).toBe('fr-FR')
                expect(result.versionStatus).toBe('current')
            })
        })

        describe('CLEAR_HISTORICAL_VERSION', () => {
            it('should set historicalVersion to null', () => {
                const state = createInitialState({
                    historicalVersion: {
                        versionId: 10,
                        version: 3,
                        title: 'Version Title',
                        content: '<p>Version content</p>',
                        publishedDatetime: '2024-03-01T12:00:00Z',
                        publisherUserId: 42,
                        commitMessage: 'Published v3',
                        impactDateRange: {
                            end_datetime: '',
                            start_datetime: '',
                        },
                    },
                })

                const result = articleReducer(state, {
                    type: 'CLEAR_HISTORICAL_VERSION',
                })

                expect(result.historicalVersion).toBeNull()
            })

            it('should restore title and content from the current article translation', () => {
                const article = createMockArticle({
                    translation: {
                        locale: 'en-US',
                        title: 'Original Article Title',
                        content: '<p>Original article content</p>',
                        slug: 'test-article',
                        excerpt: 'Test excerpt',
                        category_id: 1,
                        visibility_status: 'PUBLIC',
                        article_id: 1,
                        article_unlisted_id: 'test-unlisted-id',
                        seo_meta: { title: '', description: '' },
                        created_datetime: '2024-01-01T00:00:00Z',
                        updated_datetime: '2024-01-02T00:00:00Z',
                        deleted_datetime: null,
                        is_current: true,
                        draft_version_id: null,
                        published_version_id: null,
                        published_datetime: null,
                        publisher_user_id: null,
                        commit_message: null,
                        version: null,
                    },
                })
                const state = createInitialState({
                    article,
                    title: 'Historical Title',
                    content: '<p>Historical content</p>',
                    historicalVersion: {
                        versionId: 10,
                        version: 3,
                        title: 'Historical Title',
                        content: '<p>Historical content</p>',
                        publishedDatetime: '2024-03-01T12:00:00Z',
                        publisherUserId: 42,
                        commitMessage: 'Published v3',
                        impactDateRange: {
                            end_datetime: '',
                            start_datetime: '',
                        },
                    },
                })

                const result = articleReducer(state, {
                    type: 'CLEAR_HISTORICAL_VERSION',
                })

                expect(result.title).toBe('Original Article Title')
                expect(result.content).toBe('<p>Original article content</p>')
            })

            it('should use empty strings when article is undefined', () => {
                const state = createInitialState({
                    article: undefined,
                    title: 'Historical Title',
                    content: '<p>Historical content</p>',
                    historicalVersion: {
                        versionId: 10,
                        version: 3,
                        title: 'Historical Title',
                        content: '<p>Historical content</p>',
                        publishedDatetime: null,
                        publisherUserId: undefined,
                        commitMessage: undefined,
                        impactDateRange: {
                            end_datetime: '',
                            start_datetime: '',
                        },
                    },
                })

                const result = articleReducer(state, {
                    type: 'CLEAR_HISTORICAL_VERSION',
                })

                expect(result.title).toBe('')
                expect(result.content).toBe('')
            })

            it('should preserve other state properties', () => {
                const state = createInitialState({
                    isFullscreen: true,
                    articleMode: 'read',
                    currentLocale: 'fr-FR',
                    versionStatus: 'current',
                    historicalVersion: {
                        versionId: 10,
                        version: 3,
                        title: 'Version Title',
                        content: '<p>Version content</p>',
                        publishedDatetime: null,
                        publisherUserId: undefined,
                        commitMessage: undefined,
                        impactDateRange: {
                            end_datetime: '',
                            start_datetime: '',
                        },
                    },
                })

                const result = articleReducer(state, {
                    type: 'CLEAR_HISTORICAL_VERSION',
                })

                expect(result.isFullscreen).toBe(true)
                expect(result.articleMode).toBe('read')
                expect(result.currentLocale).toBe('fr-FR')
                expect(result.versionStatus).toBe('current')
            })

            it('should be a no-op on historicalVersion when already null', () => {
                const state = createInitialState({
                    historicalVersion: null,
                })

                const result = articleReducer(state, {
                    type: 'CLEAR_HISTORICAL_VERSION',
                })

                expect(result.historicalVersion).toBeNull()
            })

            it('should reset articleMode to read when in diff mode', () => {
                const state = createInitialState({
                    articleMode: 'diff',
                    historicalVersion: {
                        versionId: 10,
                        version: 3,
                        title: 'Version Title',
                        content: '<p>Version content</p>',
                        publishedDatetime: null,
                        publisherUserId: undefined,
                        commitMessage: undefined,
                        impactDateRange: {
                            end_datetime: '',
                            start_datetime: '',
                        },
                    },
                })

                const result = articleReducer(state, {
                    type: 'CLEAR_HISTORICAL_VERSION',
                })

                expect(result.articleMode).toBe('read')
            })
        })
    })

    describe('Default case', () => {
        it('should return state unchanged for unknown action', () => {
            const state = createInitialState()

            const result = articleReducer(state, {
                type: 'UNKNOWN_ACTION',
            } as never)

            expect(result).toBe(state)
        })
    })

    describe('Immutability', () => {
        it('should not mutate the original state', () => {
            const state = createInitialState()
            const originalState = { ...state }

            articleReducer(state, { type: 'SET_TITLE', payload: 'New Title' })

            expect(state).toEqual(originalState)
        })

        it('should return a new state object', () => {
            const state = createInitialState()

            const result = articleReducer(state, {
                type: 'SET_TITLE',
                payload: 'New Title',
            })

            expect(result).not.toBe(state)
        })
    })
})
