import type { SizeValue } from '@gorgias/axiom'
import type { GetArticleVersionStatus } from '@gorgias/help-center-types'

import type {
    ArticleWithLocalTranslation,
    Category,
    HelpCenter,
    Locale,
    LocaleCode,
    UpdateArticleTranslationDto,
} from 'models/helpCenter/types'
import type { OptionItem as LocaleOption } from 'pages/settings/helpCenter/components/articles/ArticleLanguageSelect'
import type { Components } from 'rest_api/help_center_api/client.generated'

export type ArticleModeType = 'create' | 'edit' | 'read' | 'diff'

export const InitialArticleMode = {
    READ: 'read',
    EDIT: 'edit',
} as const

export type InitialArticleModeValue =
    (typeof InitialArticleMode)[keyof typeof InitialArticleMode]

export type ImpactDateRange = {
    start_datetime: string
    end_datetime: string
}

export type HistoricalVersionState = {
    versionId: number
    version: number
    title: string
    content: string
    publishedDatetime: string | null
    publisherUserId?: number
    commitMessage?: string
    impactDateRange?: ImpactDateRange
} | null

export type ArticleTranslationVersion =
    Components.Schemas.ArticleTranslationVersionResponseDto

export type ModalType =
    | null
    | 'unsaved'
    | 'delete-article'
    | { type: 'delete-translation'; locale: LocaleOption }
    | 'discard-draft'
    | 'publish'
    | 'restore'

export type SettingsChanges = Pick<
    UpdateArticleTranslationDto,
    'category_id' | 'visibility_status' | 'slug' | 'excerpt' | 'seo_meta'
>

export type ArticleState = {
    // Mode & UI
    articleMode: ArticleModeType
    isFullscreen: boolean
    isDetailsView: boolean

    // Form data (content)
    title: string
    content: string

    // Autosave tracking
    savedSnapshot: { title: string; content: string }
    isAutoSaving: boolean
    hasAutoSavedInSession: boolean

    // Article reference
    article: ArticleWithLocalTranslation | undefined
    translationMode: 'existing' | 'new'

    // Locale management
    currentLocale: LocaleCode

    // Settings (synced separately)
    pendingSettingsChanges: SettingsChanges

    // Version info
    versionStatus: GetArticleVersionStatus

    // Historical version (read only mode - viewing old published versions)
    historicalVersion: HistoricalVersionState

    // Comparison version (used when comparing draft or historical to published)
    comparisonVersion: { title: string; content: string } | null

    // Modal state
    activeModal: ModalType

    // Loading
    isUpdating: boolean

    // Template tracking
    templateKey: string | undefined
}

export type ArticleReducerAction =
    // Mode & UI actions
    | { type: 'SET_MODE'; payload: ArticleModeType }
    | { type: 'SET_FULLSCREEN'; payload: boolean }
    | { type: 'TOGGLE_FULLSCREEN' }
    | { type: 'SET_DETAILS_VIEW'; payload: boolean }
    | { type: 'TOGGLE_DETAILS_VIEW' }
    // Form data actions
    | { type: 'SET_TITLE'; payload: string }
    | { type: 'SET_CONTENT'; payload: string }
    | {
          type: 'MARK_CONTENT_AS_SAVED'
          payload?: {
              title: string
              content: string
              article: ArticleWithLocalTranslation
          }
      }
    | { type: 'SET_AUTO_SAVING'; payload: boolean }
    // Article reference actions
    | { type: 'SET_ARTICLE'; payload: ArticleWithLocalTranslation }
    | { type: 'SET_TRANSLATION_MODE'; payload: 'existing' | 'new' }
    | {
          type: 'UPDATE_TRANSLATION'
          payload: Partial<ArticleWithLocalTranslation['translation']>
      }
    // Locale actions
    | { type: 'SET_LOCALE'; payload: LocaleCode }
    | {
          type: 'SWITCH_ARTICLE'
          payload: {
              article: ArticleWithLocalTranslation | undefined
              locale: LocaleCode
              translationMode: 'existing' | 'new'
          }
      }
    // Settings actions
    | { type: 'SET_PENDING_SETTINGS'; payload: Partial<SettingsChanges> }
    | { type: 'CLEAR_PENDING_SETTINGS' }
    // Version actions
    | { type: 'SET_VERSION_STATUS'; payload: GetArticleVersionStatus }
    | {
          type: 'SWITCH_VERSION'
          payload: {
              article: ArticleWithLocalTranslation
              versionStatus: GetArticleVersionStatus
          }
      }
    // Modal actions
    | { type: 'SET_MODAL'; payload: ModalType }
    | { type: 'CLOSE_MODAL' }
    // Loading actions
    | { type: 'SET_UPDATING'; payload: boolean }
    // Reset actions
    | {
          type: 'RESET_TO_SERVER'
          payload: { title: string; content: string }
      }
    // Historical version actions
    | {
          type: 'VIEW_HISTORICAL_VERSION'
          payload: ArticleTranslationVersion & {
              impactDateRange: ImpactDateRange
          }
      }
    | { type: 'CLEAR_HISTORICAL_VERSION' }
    | {
          type: 'SET_COMPARISON_VERSION'
          payload: {
              title: string
              content: string
          }
      }

export type ArticleContextConfig = {
    // Help center data
    helpCenter: HelpCenter
    supportedLocales: Locale[]
    categories: Category[]
    shopName?: string

    // Article data (for existing)
    articleId?: number
    initialArticle?: ArticleWithLocalTranslation
    versionStatus?: GetArticleVersionStatus

    // Template (for new)
    template?: { title: string; content: string; key: string }

    // Mode
    initialMode: ArticleModeType

    // Callbacks
    onClose: () => void
    onClickPrevious?: () => void
    onClickNext?: () => void
    onCreatedFn?: (
        article: ArticleWithLocalTranslation,
        shouldAddToMissingKnowledge?: boolean,
    ) => void
    onUpdatedFn?: () => void
    onDeletedFn?: () => void
    onEditFn?: () => void

    // UI options
    showMissingKnowledgeCheckbox?: boolean
}

export type PlaygroundState = {
    isOpen: boolean
    onTest: () => void
    onClose: () => void
    sidePanelWidth: SizeValue
    shouldHideFullscreenButton: boolean
}

export type ArticleContextValue = {
    // State
    state: ArticleState
    dispatch: React.Dispatch<ArticleReducerAction>

    // Config
    config: ArticleContextConfig

    // Computed values
    hasPendingContentChanges: boolean
    isFormValid: boolean
    hasDraft: boolean
    canEdit: boolean

    // Playground
    playground: PlaygroundState
    shouldAddToMissingKnowledge?: boolean
    setShouldAddToMissingKnowledge?: (value: boolean) => void
}

export const createInitialState = (
    config: ArticleContextConfig,
): ArticleState => {
    const { initialArticle, template, helpCenter, versionStatus, initialMode } =
        config

    const title = initialArticle?.translation.title ?? template?.title ?? ''
    const content =
        initialArticle?.translation.content ?? template?.content ?? ''

    return {
        articleMode: initialMode,
        isFullscreen: false,
        isDetailsView: true,
        title,
        content,
        savedSnapshot: { title, content },
        isAutoSaving: false,
        hasAutoSavedInSession: false,
        article: initialArticle,
        translationMode: initialArticle ? 'existing' : 'new',
        currentLocale:
            initialArticle?.translation.locale ?? helpCenter.default_locale,
        pendingSettingsChanges: {},
        versionStatus: versionStatus ?? 'latest_draft',
        historicalVersion: null,
        comparisonVersion: null,
        activeModal: null,
        isUpdating: false,
        templateKey: template?.key,
    }
}
