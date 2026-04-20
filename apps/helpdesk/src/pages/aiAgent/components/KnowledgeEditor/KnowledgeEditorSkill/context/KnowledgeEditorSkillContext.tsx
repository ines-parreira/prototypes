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

import { skillReducer } from './KnowledgeEditorSkillReducer'
import type {
    PlaygroundState,
    SkillContextConfig,
    SkillContextValue,
    SkillReducerAction,
    SkillState,
} from './types'
import { createInitialState } from './types'

type SkillStoreState = {
    state: SkillState
    config: SkillContextConfig
    skill: GuidanceArticle | undefined
    playground: PlaygroundState
}

type SkillStoreActions = {
    dispatch: (action: SkillReducerAction) => void
    setConfig: (config: SkillContextConfig) => void
    setSkill: (skill: GuidanceArticle | undefined) => void
    setPlayground: (playground: PlaygroundState) => void
}

type SkillStoreValue = SkillStoreState & SkillStoreActions

export const hasPendingChanges = (state: SkillState): boolean =>
    baseHasPendingChanges(state)

export const isFormValid = (state: SkillState): boolean =>
    state.title.trim() !== '' &&
    state.content.trim() !== '' &&
    getPlainTextLength(state.content) <= textLimit &&
    state.intents.length > 0

export const hasDraft = (state: SkillState): boolean =>
    baseHasDraft(state.skill)

export const canEdit = (state: SkillState): boolean => baseCanEdit(state.skill)

const useSyncEffects = (
    store: StoreApi<SkillStoreValue>,
    config: SkillContextConfig,
) => {
    useEffect(() => {
        if (store.getState().skill !== config.skill) {
            store.getState().setSkill(config.skill)
        }
    }, [store, config.skill])

    useEffect(() => {
        const currentSkillId = store.getState().state.skill?.id

        if (config.skill && config.skill.id !== currentSkillId) {
            store.getState().dispatch({
                type: 'SWITCH_SKILL',
                payload: { article: config.skill, mode: 'edit' },
            })
        }
    }, [store, config.skill])
}

const {
    Provider: KnowledgeEditorSkillProvider,
    useStore: useSkillEditorStore,
    useStoreApi: useSkillEditorStoreApi,
} = createEditorStoreFactory<SkillContextConfig, SkillStoreValue>(
    (config) => {
        const initialState = createInitialState(
            config.skillTemplate,
            config.skill,
            config.initialMode,
            config.initialVersionData,
            config.routeState,
        )

        return createStore<SkillStoreValue>()((set) => ({
            state: initialState,
            config,
            skill: config.skill,
            playground: defaultPlaygroundState,
            dispatch: (action) =>
                set((storeState) => ({
                    state: skillReducer(storeState.state, action),
                })),
            setConfig: (nextConfig) => set({ config: nextConfig }),
            setSkill: (nextSkill) => set({ skill: nextSkill }),
            setPlayground: (nextPlayground) =>
                set({ playground: nextPlayground }),
        }))
    },
    {
        name: 'SkillEditorStore',
        useSyncEffects,
    },
)

export {
    KnowledgeEditorSkillProvider,
    useSkillEditorStore,
    useSkillEditorStoreApi,
}

export const useSkillEditorContext = (): SkillContextValue => {
    const state = useSkillEditorStore((storeState) => storeState.state)
    const config = useSkillEditorStore((storeState) => storeState.config)
    const dispatch = useSkillEditorStore((storeState) => storeState.dispatch)
    const skill = useSkillEditorStore((storeState) => storeState.skill)
    const playground = useSkillEditorStore(
        (storeState) => storeState.playground,
    )

    const contextValue = useMemo<SkillContextValue>(
        () => ({
            state,
            config,
            dispatch,
            skill,
            playground,
            hasPendingChanges: hasPendingChanges(state),
            isFormValid: isFormValid(state),
            hasDraft: hasDraft(state),
            canEdit: canEdit(state),
        }),
        [state, config, dispatch, skill, playground],
    )

    return contextValue
}
