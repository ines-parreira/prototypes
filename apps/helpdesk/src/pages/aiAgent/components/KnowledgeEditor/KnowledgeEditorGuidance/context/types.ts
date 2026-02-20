import type { SizeValue } from '@gorgias/axiom'
import type { GetArticleVersionStatus } from '@gorgias/help-center-types'

import type { HelpCenter } from 'models/helpCenter/types'
import type { FilteredKnowledgeHubArticle } from 'pages/aiAgent/KnowledgeHub/types'
import type { GuidanceArticle, GuidanceTemplate } from 'pages/aiAgent/types'
import type { Components } from 'rest_api/help_center_api/client.generated'

export type GuidanceModeType = 'create' | 'edit' | 'read' | 'diff'

export type ModalType =
    | 'unsaved'
    | 'discard'
    | 'delete'
    | 'publish'
    | 'restore'
    | 'duplicate'
    | null

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

export type GuidanceState = {
    // Mode & UI
    guidanceMode: GuidanceModeType
    isFullscreen: boolean
    isDetailsView: boolean

    // Form data
    title: string
    content: string
    visibility: boolean

    // Autosave
    savedSnapshot: { title: string; content: string }
    guidance: GuidanceArticle | undefined
    isAutoSaving: boolean
    hasAutoSavedInSession: boolean
    autoSaveError: boolean

    // Template tracking (for create mode autosave)
    isFromTemplate: boolean
    hasTemplateChanges: boolean

    // Version info (edit only)
    versionStatus: GetArticleVersionStatus

    // Historical version (read only mode - viewing old published versions)
    historicalVersion: HistoricalVersionState

    // Comparison version (used when comparing draft or historical to published)
    comparisonVersion: { title: string; content: string } | null

    // Modal state
    activeModal: ModalType

    // Loading
    isUpdating: boolean
}

export type GuidanceReducerAction =
    | { type: 'SET_MODE'; payload: GuidanceModeType }
    | { type: 'SET_FULLSCREEN'; payload: boolean }
    | { type: 'TOGGLE_FULLSCREEN' }
    | { type: 'SET_DETAILS_VIEW'; payload: boolean }
    | { type: 'TOGGLE_DETAILS_VIEW' }
    | { type: 'SET_TITLE'; payload: string }
    | { type: 'SET_CONTENT'; payload: string }
    | { type: 'SET_VISIBILITY'; payload: boolean }
    | {
          type: 'RESET_FORM'
          payload: { title: string; content: string; visibility: boolean }
      }
    | {
          type: 'MARK_AS_SAVED'
          payload?: {
              title: string
              content: string
              guidance: GuidanceArticle
          }
      }
    | { type: 'SET_AUTO_SAVING'; payload: boolean }
    | { type: 'SET_AUTO_SAVE_ERROR'; payload: boolean }
    | { type: 'SET_VERSION_STATUS'; payload: GetArticleVersionStatus }
    | { type: 'SWITCH_VERSION'; payload: GuidanceArticle }
    | { type: 'SET_MODAL'; payload: ModalType }
    | { type: 'CLOSE_MODAL' }
    | { type: 'SET_UPDATING'; payload: boolean }
    | {
          type: 'SWITCH_GUIDANCE'
          payload: {
              article: GuidanceArticle
              mode: GuidanceModeType
          }
      }
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

export type GuidanceContextConfig = {
    shopName: string
    shopType: string
    guidanceArticle?: GuidanceArticle
    guidanceTemplate?: GuidanceTemplate
    guidanceArticles: FilteredKnowledgeHubArticle[]
    initialMode: GuidanceModeType
    guidanceHelpCenter: HelpCenter
    onClose: () => void
    onClickPrevious?: () => void
    onClickNext?: () => void
    onDeleteFn?: () => void
    onCreateFn?: () => void
    onUpdateFn?: () => void
    onCopyFn?: () => void
    handleVisibilityUpdate?: (visibility: string) => void
}

export type PlaygroundState = {
    isOpen: boolean
    onTest: () => void
    onClose: () => void
    sidePanelWidth: SizeValue
    shouldHideFullscreenButton: boolean
}

export type GuidanceContextValue = {
    canEdit: boolean
    // State
    state: GuidanceState
    dispatch: React.Dispatch<GuidanceReducerAction>

    // Computed values
    hasPendingChanges: boolean
    isFormValid: boolean
    hasDraft: boolean

    // Config
    config: GuidanceContextConfig

    // Article data (from API)
    guidanceArticle: GuidanceArticle | undefined

    // Playground
    playground: PlaygroundState
}

export const createInitialState = (
    template?: GuidanceTemplate,
    article?: GuidanceArticle,
    initialMode: GuidanceModeType = 'create',
): GuidanceState => {
    // For existing articles, use their visibility
    // For new articles, default to false if at limit
    let defaultVisibility = true
    if (article) {
        defaultVisibility = article.visibility === 'PUBLIC'
    } else if (initialMode === 'create') {
        defaultVisibility = false
    }

    return {
        guidanceMode: initialMode,
        isFullscreen: false,
        isDetailsView: true,
        title: article?.title ?? template?.name ?? '',
        content: article?.content ?? template?.content ?? '',
        visibility: defaultVisibility,
        savedSnapshot: {
            title: article?.title ?? template?.name ?? '',
            content: article?.content ?? template?.content ?? '',
        },
        guidance: article ?? undefined,
        isAutoSaving: false,
        hasAutoSavedInSession: false,
        autoSaveError: false,
        isFromTemplate: template !== undefined && initialMode === 'create',
        hasTemplateChanges: false,
        versionStatus: 'latest_draft',
        historicalVersion: null,
        comparisonVersion: null,
        activeModal: null,
        isUpdating: false,
    }
}
