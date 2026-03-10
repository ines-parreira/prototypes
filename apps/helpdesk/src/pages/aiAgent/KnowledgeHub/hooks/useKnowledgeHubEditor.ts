import { useCallback, useMemo, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import type { GetArticleVersionStatus } from '@gorgias/help-center-types'

import { useNotify } from 'hooks/useNotify'
import { VisibilityStatusEnum } from 'models/helpCenter/types'
import { InitialArticleMode } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/context'
import type { InitialArticleModeValue } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/context'
import type { GuidanceTemplate } from 'pages/aiAgent/types'

import { REFETCH_KNOWLEDGE_HUB_TABLE } from '../constants'
import { dispatchDocumentEvent } from '../EmptyState/utils'
import type {
    EditorMode,
    GuidanceEditorConfig,
    KnowledgeEditorConfig,
} from '../types'

type GuidanceEditorState = {
    editorType: 'guidance'
    isEditorOpen: boolean
    currentArticleId: number | undefined
    editorMode: EditorMode
    guidanceMode: EditorMode
    guidanceTemplate: GuidanceTemplate | undefined
    shopName: string
    shopType: string
    hasPrevious: boolean
    hasNext: boolean
}

type FaqEditorState = {
    editorType: 'faq'
    isEditorOpen: boolean
    currentArticleId: number | undefined
    editorMode: EditorMode
    faqArticleMode: 'new' | 'existing'
    initialArticleMode: InitialArticleModeValue
    shopName: string
    hasPrevious: boolean
    hasNext: boolean
    versionStatus?: GetArticleVersionStatus
}

type SnippetEditorState = {
    editorType: 'snippet'
    isEditorOpen: boolean
    currentArticleId: number | undefined
    editorMode: EditorMode
    shopName: string
    hasPrevious: boolean
    hasNext: boolean
}

type CommonEditorActions = {
    openEditorForCreate: (template?: GuidanceTemplate) => void
    openEditorForEdit: (
        articleId: number,
        versionStatus?: GetArticleVersionStatus,
    ) => void
    closeEditor: () => void
    handleCreate: (createdArticle?: { id: number }) => void
    handleUpdate: () => void
    handleDelete: () => void
    handleVisibilityUpdate?: (visibility: string) => void
    handleClickPrevious: () => void
    handleClickNext: () => void
}

type KnowledgeEditorStateUnion =
    | GuidanceEditorState
    | FaqEditorState
    | SnippetEditorState

export type KnowledgeEditorReturn<T extends KnowledgeEditorConfig> = Extract<
    KnowledgeEditorStateUnion,
    { editorType: T['type'] }
> &
    CommonEditorActions

const EDITOR_CONFIG = {
    guidance: {
        notifications: {
            created: 'Guidance created successfully',
            updated: 'Guidance updated successfully',
            deleted: 'Guidance deleted successfully',
            copied: 'Guidance duplicated successfully',
            visibilityOn: 'Content enabled for AI Agent.',
            visibilityOff: 'Content disabled for AI Agent.',
        },
        events: {
            created: SegmentEvent.AiAgentGuidanceCreated,
            updated: SegmentEvent.AiAgentGuidanceEdited,
            deleted: SegmentEvent.AiAgentKnowledgeContentEdited,
            copied: SegmentEvent.AiAgentKnowledgeContentCreated,
        },
    },
    faq: {
        notifications: {
            created: 'Help Center article created successfully',
            updated: 'Help Center article updated successfully',
            deleted: 'Help Center article deleted successfully',
            visibilityOn: 'Content enabled for AI Agent.',
            visibilityOff: 'Content disabled for AI Agent.',
        },
        events: {
            created: SegmentEvent.AiAgentKnowledgeContentCreated,
            updated: SegmentEvent.AiAgentKnowledgeContentEdited,
            deleted: SegmentEvent.AiAgentKnowledgeContentEdited,
        },
    },
    snippet: {
        notifications: {
            created: 'Snippet created successfully',
            updated: 'Snippet updated successfully',
            deleted: 'Snippet deleted successfully',
            visibilityOn: 'Content enabled for AI Agent.',
            visibilityOff: 'Content disabled for AI Agent.',
        },
        events: {
            created: SegmentEvent.AiAgentKnowledgeContentCreated,
            updated: SegmentEvent.AiAgentKnowledgeContentEdited,
            deleted: SegmentEvent.AiAgentKnowledgeContentEdited,
        },
    },
}

export const useKnowledgeHubEditor = <T extends KnowledgeEditorConfig>(
    config: T,
): KnowledgeEditorReturn<T> => {
    const { type, shopName, filteredArticles } = config
    const { success: notifySuccess } = useNotify()
    const [versionStatus, setVersionStatus] = useState<
        GetArticleVersionStatus | undefined
    >(undefined)
    const editorConfig = EDITOR_CONFIG[type]

    const [isEditorOpen, setIsEditorOpen] = useState(false)
    const [currentArticleId, setCurrentArticleId] = useState<
        number | undefined
    >(undefined)
    const [editorMode, setEditorMode] = useState<EditorMode>('create')
    const [guidanceTemplate, setGuidanceTemplate] = useState<
        GuidanceTemplate | undefined
    >(undefined)
    const [faqArticleMode, setFaqArticleMode] = useState<'new' | 'existing'>(
        'new',
    )
    const [initialArticleMode, setInitialArticleMode] =
        useState<InitialArticleModeValue>(InitialArticleMode.READ)

    const currentArticleIndex = useMemo(() => {
        if (!currentArticleId || editorMode === 'create') {
            return -1
        }
        return filteredArticles.findIndex(
            (article) => article.id === currentArticleId,
        )
    }, [currentArticleId, filteredArticles, editorMode])

    const hasPrevious = currentArticleIndex > 0
    const hasNext =
        currentArticleIndex >= 0 &&
        currentArticleIndex < filteredArticles.length - 1

    const openEditorForCreate = useCallback(
        (template?: GuidanceTemplate) => {
            setCurrentArticleId(undefined)
            setEditorMode('create')

            if (type === 'guidance') {
                setGuidanceTemplate(template)
            }

            if (type === 'faq') {
                setFaqArticleMode('new')
            }

            setIsEditorOpen(true)
        },
        [type],
    )

    const openEditorForEdit = useCallback(
        (articleId: number, versionStatus?: GetArticleVersionStatus) => {
            setCurrentArticleId(articleId)
            setEditorMode('read')

            if (type === 'guidance') {
                setGuidanceTemplate(undefined)
            }

            if (type === 'faq') {
                setFaqArticleMode('existing')
                setInitialArticleMode(InitialArticleMode.READ)
                setVersionStatus(versionStatus)
            }

            setIsEditorOpen(true)
        },
        [type],
    )

    const closeEditor = useCallback(() => {
        setIsEditorOpen(false)
        setCurrentArticleId(undefined)
        setEditorMode('create')
        setGuidanceTemplate(undefined)
        setFaqArticleMode('new')
        setInitialArticleMode(InitialArticleMode.READ)
        setVersionStatus(undefined)
    }, [])

    const handleCreate = useCallback(() => {
        logEvent(editorConfig.events.created, {
            source: 'knowledge_hub',
            shop_name: shopName,
            type,
        })

        if (type !== 'guidance' && type !== 'faq') {
            notifySuccess(editorConfig.notifications.created)
        }
        dispatchDocumentEvent(REFETCH_KNOWLEDGE_HUB_TABLE)
    }, [editorConfig, shopName, type, notifySuccess])

    const handleUpdate = useCallback(() => {
        logEvent(editorConfig.events.updated, {
            source: 'knowledge_hub',
            shop_name: shopName,
            type,
        })

        dispatchDocumentEvent(REFETCH_KNOWLEDGE_HUB_TABLE)
    }, [editorConfig, shopName, type])

    const handleDelete = useCallback(() => {
        logEvent(editorConfig.events.deleted, {
            source: 'knowledge_hub',
            shop_name: shopName,
            type,
        })

        notifySuccess(editorConfig.notifications.deleted)
        dispatchDocumentEvent(REFETCH_KNOWLEDGE_HUB_TABLE)
        closeEditor()
    }, [editorConfig, shopName, type, notifySuccess, closeEditor])

    const handleVisibilityUpdate = useCallback(
        (visibility: string) => {
            logEvent(editorConfig.events.updated, {
                source: 'knowledge_hub',
                shop_name: shopName,
                type,
            })

            const notificationType =
                visibility === VisibilityStatusEnum.PUBLIC
                    ? 'visibilityOn'
                    : 'visibilityOff'

            notifySuccess(editorConfig.notifications[notificationType])
            dispatchDocumentEvent(REFETCH_KNOWLEDGE_HUB_TABLE)
        },
        [editorConfig, shopName, type, notifySuccess],
    )

    const handleClickPrevious = useCallback(() => {
        if (hasPrevious) {
            const previousArticle = filteredArticles[currentArticleIndex - 1]
            setCurrentArticleId(previousArticle.id)
            setEditorMode('read')

            if (type === 'faq') {
                setFaqArticleMode('existing')
                setInitialArticleMode(InitialArticleMode.READ)
            }
        }
    }, [hasPrevious, currentArticleIndex, filteredArticles, type])

    const handleClickNext = useCallback(() => {
        if (hasNext) {
            const nextArticle = filteredArticles[currentArticleIndex + 1]
            setCurrentArticleId(nextArticle.id)
            setEditorMode('read')

            if (type === 'faq') {
                setFaqArticleMode('existing')
                setInitialArticleMode(InitialArticleMode.READ)
            }
        }
    }, [hasNext, currentArticleIndex, filteredArticles, type])

    const commonState = {
        editorType: type,
        isEditorOpen,
        currentArticleId,
        editorMode,
        shopName,
        hasPrevious,
        hasNext,
    }

    const commonActions = {
        openEditorForCreate,
        openEditorForEdit,
        closeEditor,
        handleCreate,
        handleUpdate,
        handleVisibilityUpdate,
        handleDelete,
        handleClickPrevious,
        handleClickNext,
    }

    if (type === 'guidance') {
        return {
            ...commonState,
            shopType: (config as GuidanceEditorConfig).shopType,
            guidanceMode: editorMode,
            guidanceTemplate,
            ...commonActions,
        } as KnowledgeEditorReturn<T>
    }

    if (type === 'faq') {
        return {
            ...commonState,
            faqArticleMode,
            initialArticleMode,
            versionStatus,
            ...commonActions,
        } as KnowledgeEditorReturn<T>
    }

    if (type === 'snippet') {
        return {
            ...commonState,
            ...commonActions,
        } as KnowledgeEditorReturn<T>
    }

    throw new Error(`Unsupported editor type: ${type}`)
}
