import { useEffect, useMemo } from 'react'

import type { StoreApi } from 'zustand/vanilla'
import { createStore } from 'zustand/vanilla'

import { createEditorStoreFactory } from 'common/knowledge-editor/state'
import { defaultPlaygroundState } from 'common/knowledge-editor/types'
import {
    canEdit as baseCanEdit,
    hasDraft as baseHasDraft,
    hasPendingChanges as baseHasPendingChanges,
} from 'common/knowledge-editor/utils'
import {
    getPlainTextLength,
    textLimit,
} from 'pages/aiAgent/components/GuidanceEditor/guidanceTextContent.utils'
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

export const hasPendingChanges = (state: GuidanceState): boolean =>
    baseHasPendingChanges(state)

export const isFormValid = (state: GuidanceState): boolean =>
    state.title.trim() !== '' &&
    state.content.trim() !== '' &&
    getPlainTextLength(state.content) <= textLimit

export const hasDraft = (state: GuidanceState): boolean =>
    baseHasDraft(state.guidance)

export const canEdit = (state: GuidanceState): boolean =>
    baseCanEdit(state.guidance)

const useSyncEffects = (
    store: StoreApi<GuidanceStoreValue>,
    config: GuidanceContextConfig,
) => {
    useEffect(() => {
        if (store.getState().guidanceArticle !== config.guidanceArticle) {
            store.getState().setGuidanceArticle(config.guidanceArticle)
        }
    }, [store, config.guidanceArticle])

    useEffect(() => {
        if (!config.guidanceArticle) return

        const currentState = store.getState().state
        const currentGuidanceId = currentState.guidance?.id

        if (config.guidanceArticle.id !== currentGuidanceId) {
            store.getState().dispatch({
                type: 'SWITCH_GUIDANCE',
                payload: { article: config.guidanceArticle, mode: 'read' },
            })
            return
        }

        const editorGuidance = currentState.guidance
        const hasLiveDelta =
            editorGuidance !== undefined &&
            (config.guidanceArticle.title !== editorGuidance.title ||
                config.guidanceArticle.content !== editorGuidance.content)

        if (hasLiveDelta && !hasPendingChanges(currentState)) {
            store.getState().dispatch({
                type: 'SWITCH_GUIDANCE',
                payload: {
                    article: config.guidanceArticle,
                    mode: currentState.mode,
                },
            })
        }
    }, [store, config.guidanceArticle])
}

const {
    Provider: KnowledgeEditorGuidanceProvider,
    useStore: useGuidanceStore,
    useStoreApi: useGuidanceStoreApi,
} = createEditorStoreFactory<GuidanceContextConfig, GuidanceStoreValue>(
    (config) => {
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
            setPlayground: (nextPlayground) =>
                set({ playground: nextPlayground }),
            setShouldAddToMissingKnowledge: (value) =>
                set({ shouldAddToMissingKnowledge: value }),
        }))
    },
    {
        name: 'GuidanceStore',
        useSyncEffects,
    },
)

export {
    KnowledgeEditorGuidanceProvider,
    useGuidanceStore,
    useGuidanceStoreApi,
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
