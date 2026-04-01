import { createContext, useContext, useEffect, useRef } from 'react'

import type { StoreApi } from 'zustand'
import { useStore } from 'zustand'

import { usePlaygroundPanelInKnowledgeEditor } from 'pages/aiAgent/hooks/usePlaygroundPanelInKnowledgeEditor'

import type { PlaygroundState } from '../types/playground-state'

type BaseEditorStoreShape = {
    state: { isFullscreen: boolean }
    playground: PlaygroundState
    setPlayground: (playground: PlaygroundState) => void
}

type CreateEditorStoreFactoryOptions<
    TStore extends BaseEditorStoreShape,
    TConfig,
> = {
    name: string
    useSyncEffects?: (store: StoreApi<TStore>, config: TConfig) => void
}

type EditorStoreFactory<TStore extends BaseEditorStoreShape, TConfig> = {
    StoreContext: React.Context<StoreApi<TStore> | null>
    Provider: React.FC<{
        config: TConfig
        children: React.ReactNode
    }>
    useStoreApi: () => StoreApi<TStore>
    useStore: <T>(selector: (state: TStore) => T) => T
}

export function createEditorStoreFactory<
    TConfig,
    TStore extends BaseEditorStoreShape & {
        config: TConfig
        setConfig: (config: TConfig) => void
    },
>(
    createStoreFn: (config: TConfig) => StoreApi<TStore>,
    options: CreateEditorStoreFactoryOptions<TStore, TConfig>,
): EditorStoreFactory<TStore, TConfig> {
    const noop = () => {}
    const useSyncEffects = options.useSyncEffects ?? noop

    const StoreContext = createContext<StoreApi<TStore> | null>(null)

    const useStoreApi = (): StoreApi<TStore> => {
        const store = useContext(StoreContext)

        if (!store) {
            throw new Error(
                `use${options.name} must be used within its Provider`,
            )
        }

        return store
    }

    const useStoreHook = <T,>(selector: (state: TStore) => T): T => {
        const store = useStoreApi()
        return useStore(store, selector)
    }

    const Provider = ({
        config,
        children,
    }: {
        config: TConfig
        children: React.ReactNode
    }) => {
        const storeRef = useRef<StoreApi<TStore> | null>(null)

        if (!storeRef.current) {
            storeRef.current = createStoreFn(config)
        }

        const store = storeRef.current

        useEffect(() => {
            if (store.getState().config !== config) {
                store.getState().setConfig(config)
            }
        }, [store, config])

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

        useSyncEffects(store, config)

        return (
            <StoreContext.Provider value={store}>
                {children}
            </StoreContext.Provider>
        )
    }

    return { StoreContext, Provider, useStoreApi, useStore: useStoreHook }
}
