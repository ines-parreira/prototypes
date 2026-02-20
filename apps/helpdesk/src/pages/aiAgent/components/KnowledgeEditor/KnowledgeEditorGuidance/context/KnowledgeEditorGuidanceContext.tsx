import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useReducer,
} from 'react'

import {
    getPlainTextLength,
    textLimit,
} from 'pages/aiAgent/components/GuidanceEditor/guidanceTextContent.utils'
import { areTrimmedStringsEqual } from 'pages/aiAgent/components/KnowledgeEditor/shared/utils'
import { usePlaygroundPanelInKnowledgeEditor } from 'pages/aiAgent/hooks/usePlaygroundPanelInKnowledgeEditor'

import { guidanceReducer } from './KnowledgeEditorGuidanceReducer'
import type { GuidanceContextConfig, GuidanceContextValue } from './types'
import { createInitialState } from './types'

const GuidanceContext = createContext<GuidanceContextValue | null>(null)

export const useGuidanceContext = (): GuidanceContextValue => {
    const context = useContext(GuidanceContext)
    if (!context) {
        throw new Error(
            'useGuidanceContext must be used within a KnowledgeEditorGuidanceProvider',
        )
    }
    return context
}

type ProviderProps = {
    config: GuidanceContextConfig
    children: React.ReactNode
}

export const KnowledgeEditorGuidanceProvider = ({
    config,
    children,
}: ProviderProps) => {
    const { guidanceTemplate, initialMode, guidanceArticle } = config

    const [state, dispatch] = useReducer(
        guidanceReducer,
        createInitialState(guidanceTemplate, guidanceArticle, initialMode),
    )

    useEffect(() => {
        if (guidanceArticle && guidanceArticle.id !== state.guidance?.id) {
            dispatch({
                type: 'SWITCH_GUIDANCE',
                payload: { article: guidanceArticle, mode: 'read' },
            })
        }
    }, [guidanceArticle, state.guidance?.id, dispatch])

    const {
        isPlaygroundOpen,
        onTest,
        onClosePlayground,
        sidePanelWidth,
        shouldHideFullscreenButton,
    } = usePlaygroundPanelInKnowledgeEditor(state.isFullscreen)

    const hasPendingChanges = useMemo(() => {
        if (state.guidanceMode === 'read' || state.guidanceMode === 'diff')
            return false
        return (
            !areTrimmedStringsEqual(state.title, state.savedSnapshot.title) ||
            state.content !== state.savedSnapshot.content
        )
    }, [state.title, state.content, state.savedSnapshot, state.guidanceMode])

    const isFormValid = useMemo(
        () =>
            state.title.trim() !== '' &&
            state.content.trim() !== '' &&
            getPlainTextLength(state.content) <= textLimit,
        [state.title, state.content],
    )

    // a user has draft when either the published version is null or the draft version is different from the published version
    const hasDraft =
        state.guidance !== undefined &&
        (!state.guidance.publishedVersionId ||
            state.guidance.draftVersionId !== state.guidance.publishedVersionId)

    // a user can edit if they are seeing either the published version BUT don't have a draft version
    // or is seeing the draft version
    let canEdit = false
    if (state.guidance !== undefined) {
        if (state.guidance.isCurrent && hasDraft) {
            canEdit = false
        } else {
            canEdit = true
        }
    }

    const value = useMemo<GuidanceContextValue>(
        () => ({
            state,
            canEdit,
            dispatch,
            hasPendingChanges,
            isFormValid,
            hasDraft,
            config,
            guidanceArticle,
            playground: {
                isOpen: isPlaygroundOpen,
                onTest,
                onClose: onClosePlayground,
                sidePanelWidth,
                shouldHideFullscreenButton,
            },
        }),
        [
            state,
            canEdit,
            hasPendingChanges,
            isFormValid,
            config,
            hasDraft,
            guidanceArticle,
            isPlaygroundOpen,
            onTest,
            onClosePlayground,
            sidePanelWidth,
            shouldHideFullscreenButton,
        ],
    )

    return (
        <GuidanceContext.Provider value={value}>
            {children}
        </GuidanceContext.Provider>
    )
}
