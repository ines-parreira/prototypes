import type { GetArticleVersionStatus } from '@gorgias/help-center-types'

import type {
    BaseEditorState,
    HistoricalVersionState as BaseHistoricalVersionState,
    ImpactDateRange as BaseImpactDateRange,
    EditorMode,
    PlaygroundState,
} from 'common/knowledge-editor/types'
import type { HelpCenter } from 'models/helpCenter/types'
import { VisibilityStatusEnum } from 'models/helpCenter/types'
import type { SkillTemplate } from 'pages/aiAgent/skills/types'
import type { GuidanceArticle } from 'pages/aiAgent/types'
import type { Components } from 'rest_api/help_center_api/client.generated'

export type SkillModeType = EditorMode

export type ModalType =
    | 'unsaved'
    | 'discard'
    | 'delete'
    | 'publish'
    | 'enable'
    | 'disable'
    | 'restore'
    | null

export type ImpactDateRange = BaseImpactDateRange

export type HistoricalVersionState =
    | (NonNullable<BaseHistoricalVersionState> & {
          intents?: Components.Schemas.ArticleTranslationResponseDto['intents']
          useSupportingContent?: boolean | null
      })
    | null

export type ArticleTranslationVersion =
    Components.Schemas.ArticleTranslationVersionResponseDto

export type SkillComparisonVersion = {
    title: string
    content: string
    intents?: Components.Schemas.ArticleTranslationResponseDto['intents']
    useSupportingContent?: boolean | null
} | null

export type SkillState = Omit<
    BaseEditorState<ModalType>,
    'comparisonVersion' | 'historicalVersion'
> & {
    // Form data
    visibility: boolean
    skill: GuidanceArticle | undefined
    // Intents (resolved from skill, route, or template)
    intents: string[]
    // Autosave
    autoSaveError: boolean
    // Template tracking
    isFromTemplate: boolean
    hasTemplateChanges: boolean
    // Historical version
    historicalVersion: HistoricalVersionState
    // Comparison version
    comparisonVersion: SkillComparisonVersion
    // Supporting content
    useSupportingContent: boolean
}

export type SkillReducerAction =
    | { type: 'SET_MODE'; payload: SkillModeType }
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
              title?: string
              content?: string
              article?: GuidanceArticle
          }
      }
    | { type: 'SET_AUTO_SAVING'; payload: boolean }
    | { type: 'SET_AUTO_SAVE_ERROR'; payload: boolean }
    | { type: 'SET_VERSION_STATUS'; payload: GetArticleVersionStatus }
    | { type: 'SWITCH_VERSION'; payload: GuidanceArticle }
    | { type: 'SET_MODAL'; payload: ModalType }
    | { type: 'CLOSE_MODAL' }
    | { type: 'SET_INTENTS'; payload: string[] }
    | { type: 'SET_UPDATING'; payload: boolean }
    | {
          type: 'SWITCH_SKILL'
          payload: {
              article: GuidanceArticle
              mode: SkillModeType
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
              intents?: Components.Schemas.ArticleTranslationResponseDto['intents']
              useSupportingContent?: boolean | null
          }
      }

export type SkillRouteState = {
    title?: string
    intents?: string[]
}

export type SkillContextConfig = {
    shopName: string
    shopType: string
    skill?: GuidanceArticle
    skillTemplate?: SkillTemplate
    initialMode: SkillModeType
    helpCenter: HelpCenter
    onClose: () => void
    onDeleteFn?: () => void
    onCreateFn?: (article: GuidanceArticle) => void
    onUpdateFn?: () => void
    onEditFn?: () => void
    handleVisibilityUpdate?: (visibility: string) => void
    initialVersionId?: number
    initialVersionData?: HistoricalVersionState
    routeState?: SkillRouteState
}

export type { PlaygroundState } from 'common/knowledge-editor/types'

export type SkillContextValue = {
    canEdit: boolean
    // State
    state: SkillState
    dispatch: React.Dispatch<SkillReducerAction>

    // Computed values
    hasPendingChanges: boolean
    isFormValid: boolean
    hasDraft: boolean

    // Config
    config: SkillContextConfig

    // Skill data (from API)
    skill: GuidanceArticle | undefined

    // Playground
    playground: PlaygroundState
}

export const createInitialState = (
    skillTemplate?: SkillTemplate,
    article?: GuidanceArticle,
    initialMode: SkillModeType = 'create',
    initialVersionData?: HistoricalVersionState,
    routeState?: SkillRouteState,
): SkillState => {
    // For existing skills, use their visibility
    // For new skills, default to false if at limit
    let defaultVisibility = true
    if (article) {
        defaultVisibility = article.visibility === VisibilityStatusEnum.PUBLIC
    } else if (initialMode === 'create') {
        defaultVisibility = false
    }

    const templateName = skillTemplate?.name ?? ''
    const templateContent = skillTemplate?.guidance?.content ?? ''
    const title = article?.title || templateName || routeState?.title || ''
    const content = article?.content ?? templateContent
    const useSupportingContent = article?.useSupportingContent ?? true

    const intents: string[] = [
        ...new Set(
            article?.intents ??
                routeState?.intents ??
                skillTemplate?.intents?.map((i) => i.name) ??
                [],
        ),
    ]

    const state: SkillState = {
        mode: initialMode,
        isFullscreen: false,
        isDetailsView: true,
        title,
        content,
        visibility: defaultVisibility,
        savedSnapshot: {
            title,
            content,
        },
        skill: article ?? undefined,
        intents,
        isAutoSaving: false,
        hasAutoSavedInSession: false,
        autoSaveError: false,
        isFromTemplate: skillTemplate !== undefined && initialMode === 'create',
        hasTemplateChanges: false,
        versionStatus: 'latest_draft',
        historicalVersion: null,
        comparisonVersion: null,
        activeModal: null,
        isUpdating: false,
        useSupportingContent: useSupportingContent,
    }

    if (initialVersionData) {
        return {
            ...state,
            historicalVersion: initialVersionData,
            title: initialVersionData.title,
            content: initialVersionData.content,
            mode: 'read',
        }
    }

    return state
}
