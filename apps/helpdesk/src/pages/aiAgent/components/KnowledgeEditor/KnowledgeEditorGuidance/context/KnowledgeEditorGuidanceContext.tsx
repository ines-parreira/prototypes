import { createContext, useContext, useEffect, useMemo, useRef } from 'react'

import { useStore } from 'zustand'
import { createStore } from 'zustand/vanilla'

import {
    getPlainTextLength,
    textLimit,
} from 'pages/aiAgent/components/GuidanceEditor/guidanceTextContent.utils'
import { areTrimmedStringsEqual } from 'pages/aiAgent/components/KnowledgeEditor/shared/utils'
import { usePlaygroundPanelInKnowledgeEditor } from 'pages/aiAgent/hooks/usePlaygroundPanelInKnowledgeEditor'
import type { GuidanceArticle } from 'pages/aiAgent/types'

import { guidanceReducer } from './KnowledgeEditorGuidanceReducer'
import type {
    GuidanceContextConfig,
    GuidanceContextValue,
    GuidanceReducerAction,
    GuidanceState,
    PlaygroundState,
} from './types'
import { createInitialState } from './types'

type GuidanceStoreState = {
    state: GuidanceState
    config: GuidanceContextConfig
    guidanceArticle: GuidanceArticle | undefined
    playground: PlaygroundState
    shouldAddToMissingKnowledge: boolean
}

type GuidanceStoreActions = {
    dispatch: (action: GuidanceReducerAction) => void
    setConfig: (config: GuidanceContextConfig) => void
    setGuidanceArticle: (guidanceArticle: GuidanceArticle | undefined) => void
    setPlayground: (playground: PlaygroundState) => void
    setShouldAddToMissingKnowledge: (value: boolean) => void
}

type GuidanceStoreValue = GuidanceStoreState & GuidanceStoreActions

type GuidanceStoreApi = ReturnType<typeof createGuidanceStore>

const noop = () => undefined

const defaultPlaygroundState: PlaygroundState = {
    isOpen: false,
    onTest: noop,
    onClose: noop,
    sidePanelWidth: '100vw',
    shouldHideFullscreenButton: false,
}

export const hasPendingChanges = (state: GuidanceState): boolean => {
    if (state.guidanceMode === 'read' || state.guidanceMode === 'diff') {
        return false
    }

    return (
        !areTrimmedStringsEqual(state.title, state.savedSnapshot.title) ||
        state.content !== state.savedSnapshot.content
    )
}

export const isFormValid = (state: GuidanceState): boolean =>
    state.title.trim() !== '' &&
    state.content.trim() !== '' &&
    getPlainTextLength(state.content) <= textLimit

export const hasDraft = (state: GuidanceState): boolean =>
    state.guidance !== undefined &&
    (!state.guidance.publishedVersionId ||
        state.guidance.draftVersionId !== state.guidance.publishedVersionId)

export const canEdit = (state: GuidanceState): boolean => {
    if (state.guidance === undefined) {
        return false
    }

    const guidanceHasDraft = hasDraft(state)

    if (state.guidance.isCurrent && guidanceHasDraft) {
        return false
    }

    return true
}

const createGuidanceStore = (config: GuidanceContextConfig) => {
    const initialState = createInitialState(
        config.guidanceTemplate,
        config.guidanceArticle,
        config.initialMode,
        config.initialVersionData,
    )

    return createStore<GuidanceStoreValue>()((set) => ({
        state: initialState,
        config,
        guidanceArticle: config.guidanceArticle,
        playground: defaultPlaygroundState,
        shouldAddToMissingKnowledge: config.showMissingKnowledgeCheckbox
            ? true
            : false,
        dispatch: (action) =>
            set((storeState) => ({
                state: guidanceReducer(storeState.state, action),
            })),
        setConfig: (nextConfig) => set({ config: nextConfig }),
        setGuidanceArticle: (nextGuidanceArticle) =>
            set({ guidanceArticle: nextGuidanceArticle }),
        setPlayground: (nextPlayground) => set({ playground: nextPlayground }),
        setShouldAddToMissingKnowledge: (value) =>
            set({ shouldAddToMissingKnowledge: value }),
    }))
}

const GuidanceStoreContext = createContext<GuidanceStoreApi | null>(null)

export const useGuidanceStoreApi = (): GuidanceStoreApi => {
    const store = useContext(GuidanceStoreContext)

    if (!store) {
        throw new Error(
            'useGuidanceStore must be used within a KnowledgeEditorGuidanceProvider',
        )
    }

    return store
}

export const useGuidanceStore = <T,>(
    selector: (state: GuidanceStoreValue) => T,
): T => {
    const store = useGuidanceStoreApi()
    return useStore(store, selector)
}

export const useGuidanceContext = (): GuidanceContextValue => {
    const state = useGuidanceStore((storeState) => storeState.state)
    const config = useGuidanceStore((storeState) => storeState.config)
    const dispatch = useGuidanceStore((storeState) => storeState.dispatch)
    const guidanceArticle = useGuidanceStore(
        (storeState) => storeState.guidanceArticle,
    )
    const playground = useGuidanceStore((storeState) => storeState.playground)

    const contextValue = useMemo<GuidanceContextValue>(
        () => ({
            state,
            config,
            dispatch,
            guidanceArticle,
            playground,
            hasPendingChanges: hasPendingChanges(state),
            isFormValid: isFormValid(state),
            hasDraft: hasDraft(state),
            canEdit: canEdit(state),
        }),
        [state, config, dispatch, guidanceArticle, playground],
    )

    return contextValue
}

type ProviderProps = {
    config: GuidanceContextConfig
    children: React.ReactNode
}

export const KnowledgeEditorGuidanceProvider = ({
    config,
    children,
}: ProviderProps) => {
    const storeRef = useRef<GuidanceStoreApi | null>(null)

    if (!storeRef.current) {
        storeRef.current = createGuidanceStore(config)
    }

    const store = storeRef.current

    const isFullscreen = useStore(
        store,
        (storeState) => storeState.state.isFullscreen,
    )

    const {
        isPlaygroundOpen,
        onTest,
        onClosePlayground,
        sidePanelWidth,
        shouldHideFullscreenButton,
    } = usePlaygroundPanelInKnowledgeEditor(isFullscreen)

    useEffect(() => {
        if (store.getState().config !== config) {
            store.getState().setConfig(config)
        }
    }, [store, config])

    useEffect(() => {
        if (store.getState().guidanceArticle !== config.guidanceArticle) {
            store.getState().setGuidanceArticle(config.guidanceArticle)
        }
    }, [store, config.guidanceArticle])

    useEffect(() => {
        const currentGuidanceId = store.getState().state.guidance?.id

        if (
            config.guidanceArticle &&
            config.guidanceArticle.id !== currentGuidanceId
        ) {
            store.getState().dispatch({
                type: 'SWITCH_GUIDANCE',
                payload: { article: config.guidanceArticle, mode: 'read' },
            })
        }
    }, [store, config.guidanceArticle])

    useEffect(() => {
        store.getState().setPlayground({
            isOpen: isPlaygroundOpen,
            onTest,
            onClose: onClosePlayground,
            sidePanelWidth,
            shouldHideFullscreenButton,
        })
    }, [
        store,
        isPlaygroundOpen,
        onTest,
        onClosePlayground,
        sidePanelWidth,
        shouldHideFullscreenButton,
    ])

    return (
        <GuidanceStoreContext.Provider value={store}>
            {children}
        </GuidanceStoreContext.Provider>
    )
}
