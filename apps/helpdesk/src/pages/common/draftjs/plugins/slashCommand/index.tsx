import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { EditorState, Modifier, SelectionState } from 'draft-js'

import type {
    GuidanceVariable,
    GuidanceVariableGroup,
    GuidanceVariableList,
} from 'pages/aiAgent/components/GuidanceEditor/variables.types'
import { encodeAction } from 'pages/common/draftjs/plugins/guidanceActions/utils'
import { useToolbarContext } from 'pages/common/draftjs/plugins/toolbar/ToolbarContext'

import SlashCommandSuggestions from './SlashCommandSuggestions'
import type { SlashCommandItem } from './types'

type Options = {
    getVariables?: () => GuidanceVariableList
}

function flattenVariables(list: GuidanceVariableList): GuidanceVariable[] {
    const result: GuidanceVariable[] = []
    for (const item of list) {
        if ('variables' in item) {
            result.push(
                ...flattenVariables((item as GuidanceVariableGroup).variables),
            )
        } else {
            result.push(item as GuidanceVariable)
        }
    }
    return result
}

const TRIGGER_REGEX = /(?:^|\s)[/@]([\w]*)$/

type SlashState = {
    isOpen: boolean
    searchText: string
    highlightedIndex: number
    position: { top: number; left: number } | null
    triggerInfo: { blockKey: string; triggerOffset: number } | null
}

type SlashStore = {
    state: SlashState
    listeners: Set<() => void>
    setState: (partial: Partial<SlashState>) => void
    subscribe: (listener: () => void) => () => void
    getState: () => SlashState
}

function createStore(): SlashStore {
    const store: SlashStore = {
        state: {
            isOpen: false,
            searchText: '',
            highlightedIndex: 0,
            position: null,
            triggerInfo: null,
        },
        listeners: new Set(),
        setState(partial) {
            store.state = { ...store.state, ...partial }
            store.listeners.forEach((l) => l())
        },
        subscribe(listener) {
            store.listeners.add(listener)
            return () => store.listeners.delete(listener)
        },
        getState() {
            return store.state
        },
    }
    return store
}

function useStore(store: SlashStore): SlashState {
    const [state, setState] = useState(store.getState())
    useEffect(() => {
        return store.subscribe(() => setState(store.getState()))
    }, [store])
    return state
}

function getSlashSearchText(
    editorState: EditorState,
): { searchText: string; triggerOffset: number } | null {
    const selection = editorState.getSelection()
    if (!selection.isCollapsed()) return null

    const contentState = editorState.getCurrentContent()
    const block = contentState.getBlockForKey(selection.getStartKey())
    const text = block.getText()
    const offset = selection.getStartOffset()
    const textBeforeCursor = text.substring(0, offset)

    const match = TRIGGER_REGEX.exec(textBeforeCursor)
    if (!match) return null

    const slashIndex = match.index + (match[0].startsWith(' ') ? 1 : 0)
    return {
        searchText: match[1],
        triggerOffset: slashIndex,
    }
}

export default function createSlashCommandPlugin(options: Options) {
    const store = createStore()
    let getEditorState: (() => EditorState) | null = null
    let setEditorState: ((state: EditorState) => void) | null = null
    let preventClose = false
    let searchInputFocused = false
    let itemCount = 0
    let selectHighlightedFn: (() => void) | null = null
    let navigateLeftFn: (() => boolean) | null = null
    let inProviderView = false
    let canNavigateRight = false

    function navigate(direction: 'up' | 'down') {
        if (itemCount === 0) return
        const current = store.getState().highlightedIndex
        const next =
            direction === 'down'
                ? (current + 1) % itemCount
                : (current - 1 + itemCount) % itemCount
        store.setState({ highlightedIndex: next })
    }

    function SlashCommandSuggestionsComponent() {
        const { isOpen, searchText, highlightedIndex, position, triggerInfo } =
            useStore(store)
        const selectHighlightedRef = useRef<(() => void) | null>(null)
        const navigateLeftRef = useRef<(() => boolean) | null>(null)

        useEffect(() => {
            selectHighlightedFn = () => selectHighlightedRef.current?.()
            navigateLeftFn = () => navigateLeftRef.current?.() ?? false
            return () => {
                selectHighlightedFn = null
                navigateLeftFn = null
            }
        }, [])
        const { guidanceActions = [] } = useToolbarContext()

        const variableList = useMemo(() => options.getVariables?.() ?? [], [])

        const allItems = useMemo((): SlashCommandItem[] => {
            const items: SlashCommandItem[] = []
            if (options.getVariables) {
                const vars = flattenVariables(options.getVariables())
                for (const v of vars) {
                    items.push({
                        label: v.name,
                        value: v.value,
                        type: 'variable',
                        category: v.category,
                    })
                }
            }
            for (const a of guidanceActions) {
                items.push({
                    label: a.name,
                    value: encodeAction(a),
                    type: 'action',
                })
            }
            return items
        }, [guidanceActions])

        const filteredItems = useMemo(() => {
            if (!searchText) return allItems
            const lower = searchText.toLowerCase()
            return allItems.filter((item) =>
                item.label.toLowerCase().includes(lower),
            )
        }, [allItems, searchText])

        const triggerInfoRef = useRef(triggerInfo)
        triggerInfoRef.current = triggerInfo

        const handleSelect = useCallback((item: SlashCommandItem) => {
            if (!getEditorState || !setEditorState || !triggerInfoRef.current)
                return

            const editorState = getEditorState()
            const contentState = editorState.getCurrentContent()
            const selection = editorState.getSelection()

            const replaceSelection = SelectionState.createEmpty(
                triggerInfoRef.current.blockKey,
            ).merge({
                anchorOffset: triggerInfoRef.current.triggerOffset,
                focusOffset: selection.getStartOffset(),
            }) as SelectionState

            const newContent = Modifier.replaceText(
                contentState,
                replaceSelection,
                item.value,
            )

            const newEditorState = EditorState.push(
                editorState,
                newContent,
                'insert-characters',
            )

            const newSelection = newContent
                .getSelectionAfter()
                .merge({ hasFocus: true })
            setEditorState(
                EditorState.forceSelection(newEditorState, newSelection),
            )

            store.setState({
                isOpen: false,
                triggerInfo: null,
            })
        }, [])

        const handleClose = useCallback(() => {
            store.setState({ isOpen: false, triggerInfo: null })
        }, [])

        const handleInteractionStart = useCallback(() => {
            preventClose = true
            setTimeout(() => {
                preventClose = false
            }, 0)
        }, [])

        const handleSearchFocusChange = useCallback((focused: boolean) => {
            searchInputFocused = focused
        }, [])

        const handleSearchTextChange = useCallback((text: string) => {
            store.setState({ searchText: text, highlightedIndex: 0 })
        }, [])

        const handleNavigate = useCallback(
            (direction: 'up' | 'down') => navigate(direction),
            [],
        )

        const handleItemCountChange = useCallback((count: number) => {
            itemCount = count
        }, [])

        const handleProviderViewChange = useCallback((value: boolean) => {
            inProviderView = value
        }, [])

        const handleCanNavigateRightChange = useCallback((value: boolean) => {
            canNavigateRight = value
        }, [])

        const handleResetHighlight = useCallback(() => {
            store.setState({ highlightedIndex: 0 })
        }, [])

        return (
            <SlashCommandSuggestions
                items={filteredItems}
                variableList={variableList}
                guidanceActions={guidanceActions}
                searchText={searchText}
                isOpen={isOpen}
                position={position}
                highlightedIndex={highlightedIndex}
                selectHighlightedRef={selectHighlightedRef}
                navigateLeftRef={navigateLeftRef}
                onSelect={handleSelect}
                onClose={handleClose}
                onInteractionStart={handleInteractionStart}
                onSearchTextChange={handleSearchTextChange}
                onSearchFocusChange={handleSearchFocusChange}
                onNavigate={handleNavigate}
                onItemCountChange={handleItemCountChange}
                onProviderViewChange={handleProviderViewChange}
                onCanNavigateRightChange={handleCanNavigateRightChange}
                onResetHighlight={handleResetHighlight}
            />
        )
    }

    return {
        initialize(methods: {
            getEditorState: () => EditorState
            setEditorState: (state: EditorState) => void
        }) {
            getEditorState = methods.getEditorState
            setEditorState = methods.setEditorState
        },

        onChange(editorState: EditorState) {
            const selection = editorState.getSelection()
            if (!selection.getHasFocus()) {
                if (
                    store.getState().isOpen &&
                    !searchInputFocused &&
                    !preventClose
                ) {
                    store.setState({ isOpen: false, triggerInfo: null })
                }
                return editorState
            }

            const result = getSlashSearchText(editorState)
            if (result) {
                const prevSearchText = store.getState().searchText
                store.setState({
                    isOpen: true,
                    searchText: result.searchText,
                    triggerInfo: {
                        blockKey: selection.getStartKey(),
                        triggerOffset: result.triggerOffset,
                    },
                    ...(result.searchText !== prevSearchText
                        ? { highlightedIndex: 0 }
                        : {}),
                })

                requestAnimationFrame(() => {
                    try {
                        const nativeSelection = window.getSelection()
                        if (nativeSelection && nativeSelection.rangeCount > 0) {
                            const range = nativeSelection.getRangeAt(0)
                            const rect = range.getBoundingClientRect()
                            store.setState({
                                position: {
                                    top: rect.bottom + 4,
                                    left: rect.left,
                                },
                            })
                        }
                    } catch {
                        // getBoundingClientRect may not be available in all environments
                    }
                })
            } else if (
                store.getState().isOpen &&
                !preventClose &&
                !searchInputFocused
            ) {
                store.setState({ isOpen: false, triggerInfo: null })
            }

            return editorState
        },

        handleReturn() {
            if (store.getState().isOpen) {
                selectHighlightedFn?.()
                return 'handled' as const
            }
            return 'not-handled' as const
        },

        onDownArrow(event: React.KeyboardEvent) {
            if (store.getState().isOpen) {
                event.preventDefault()
                navigate('down')
                return true
            }
        },

        onUpArrow(event: React.KeyboardEvent) {
            if (store.getState().isOpen) {
                event.preventDefault()
                navigate('up')
                return true
            }
        },

        onRightArrow(event: React.KeyboardEvent) {
            if (store.getState().isOpen && canNavigateRight) {
                event.preventDefault()
                selectHighlightedFn?.()
                store.setState({ highlightedIndex: 0 })
                return true
            }
        },

        onLeftArrow(event: React.KeyboardEvent) {
            if (store.getState().isOpen && inProviderView) {
                event.preventDefault()
                navigateLeftFn?.()
                store.setState({ highlightedIndex: 0 })
                return true
            }
        },

        SlashCommandSuggestions: SlashCommandSuggestionsComponent,
    }
}
