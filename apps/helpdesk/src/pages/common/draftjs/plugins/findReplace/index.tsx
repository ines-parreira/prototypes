import type { ComponentType, KeyboardEvent } from 'react'
import React from 'react'

import type { ContentBlock, ContentState } from 'draft-js'
import { EditorState, KeyBindingUtil, Modifier, SelectionState } from 'draft-js'

import {
    EditorHandledNotHandled,
    refreshEditor,
} from '../../../../../utils/editor'
import type {
    DecoratorComponentProps,
    DecoratorStrategyCallback,
    Plugin,
    PluginMethods,
} from '../types'
import FindReplaceDialog from './FindReplaceDialog'

import css from './FindReplaceDialog.less'

export type FindReplaceMatch = {
    blockKey: string
    start: number
    end: number
}

export type FindReplaceStore = {
    searchTerm: string
    matches: FindReplaceMatch[]
    currentMatchIndex: number
    isOpen: boolean
    showReplace: boolean
    replaceTerm: string
    shouldScrollToMatch: boolean
}

const createStore = (): FindReplaceStore => ({
    searchTerm: '',
    matches: [],
    currentMatchIndex: 0,
    isOpen: false,
    showReplace: false,
    replaceTerm: '',
    shouldScrollToMatch: false,
})

const OPEN_FIND_COMMAND = 'find-replace-open-find'
const OPEN_REPLACE_COMMAND = 'find-replace-open-replace'

function computeMatches(
    contentState: ContentState,
    searchTerm: string,
): FindReplaceMatch[] {
    if (!searchTerm) return []

    const matches: FindReplaceMatch[] = []
    const lowerSearch = searchTerm.toLowerCase()

    contentState.getBlockMap().forEach((block) => {
        if (!block) return
        const text = block.getText().toLowerCase()
        const blockKey = block.getKey()
        let index = text.indexOf(lowerSearch)

        while (index !== -1) {
            matches.push({
                blockKey,
                start: index,
                end: index + searchTerm.length,
            })
            index = text.indexOf(lowerSearch, index + 1)
        }
    })

    return matches
}

type FindReplacePlugin = Plugin & {
    FindReplaceDialog: ComponentType<{
        store: FindReplaceStore
        onSearchChange: (term: string) => void
        onReplaceChange: (term: string) => void
        onFindNext: () => void
        onFindPrevious: () => void
        onReplace: () => void
        onReplaceAll: () => void
        onClose: () => void
        onToggleReplace: () => void
    }>
    store: FindReplaceStore
    open: (showReplace: boolean) => void
    close: () => void
    toggleReplace: () => void
    onSearchChange: (term: string) => void
    onReplaceChange: (term: string) => void
    onFindNext: () => void
    onFindPrevious: () => void
    onReplace: () => void
    onReplaceAll: () => void
}

const createFindReplacePlugin = (): FindReplacePlugin => {
    let pluginMethods: PluginMethods
    const store = createStore()

    const updateMatches = (content?: ContentState) => {
        const contentState =
            content ?? pluginMethods.getEditorState().getCurrentContent()
        store.matches = computeMatches(contentState, store.searchTerm)
        if (store.currentMatchIndex >= store.matches.length) {
            store.currentMatchIndex = Math.max(0, store.matches.length - 1)
        }
    }

    const forceRedecorate = () => {
        const editorState = pluginMethods.getEditorState()
        pluginMethods.setEditorState(refreshEditor(editorState))
    }

    const applyCurrentMatchHighlight = () => {
        setTimeout(() => {
            const highlights = document.querySelectorAll(
                '[data-find-replace-highlight]',
            )
            highlights.forEach((el, i) => {
                const span = el as HTMLElement
                span.style.backgroundColor =
                    i === store.currentMatchIndex ? 'var(--heat-4)' : ''
            })
            const currentEl = highlights[store.currentMatchIndex] as HTMLElement
            if (currentEl && store.shouldScrollToMatch) {
                store.shouldScrollToMatch = false
                currentEl.scrollIntoView({ block: 'nearest' })
            }
        }, 0)
    }

    const onSearchChange = (term: string) => {
        store.searchTerm = term
        updateMatches()
        store.currentMatchIndex = 0
        forceRedecorate()
        applyCurrentMatchHighlight()
    }

    const onReplaceChange = (term: string) => {
        store.replaceTerm = term
    }

    const onFindNext = () => {
        if (store.matches.length === 0) return
        store.currentMatchIndex =
            (store.currentMatchIndex + 1) % store.matches.length
        store.shouldScrollToMatch = true
        forceRedecorate()
        applyCurrentMatchHighlight()
    }

    const onFindPrevious = () => {
        if (store.matches.length === 0) return
        store.currentMatchIndex =
            (store.currentMatchIndex - 1 + store.matches.length) %
            store.matches.length
        store.shouldScrollToMatch = true
        forceRedecorate()
        applyCurrentMatchHighlight()
    }

    const onReplace = () => {
        if (store.matches.length === 0) return

        const match = store.matches[store.currentMatchIndex]
        if (!match) return

        const editorState = pluginMethods.getEditorState()
        const contentState = editorState.getCurrentContent()

        const selection = SelectionState.createEmpty(match.blockKey).merge({
            anchorOffset: match.start,
            focusOffset: match.end,
        }) as SelectionState

        const newContent = Modifier.replaceText(
            contentState,
            selection,
            store.replaceTerm,
        )

        const newEditorState = EditorState.push(
            editorState,
            newContent,
            'insert-characters',
        )

        updateMatches(newContent)

        if (store.currentMatchIndex >= store.matches.length) {
            store.currentMatchIndex = 0
        }

        store.shouldScrollToMatch = true
        pluginMethods.setEditorState(refreshEditor(newEditorState))
        applyCurrentMatchHighlight()
    }

    const onReplaceAll = () => {
        if (store.matches.length === 0) return

        const editorState = pluginMethods.getEditorState()
        let contentState = editorState.getCurrentContent()

        // Replace from last to first to avoid offset shifting
        const sortedMatches = [...store.matches].reverse()

        for (const match of sortedMatches) {
            const selection = SelectionState.createEmpty(match.blockKey).merge({
                anchorOffset: match.start,
                focusOffset: match.end,
            }) as SelectionState

            contentState = Modifier.replaceText(
                contentState,
                selection,
                store.replaceTerm,
            )
        }

        const newEditorState = EditorState.push(
            editorState,
            contentState,
            'insert-characters',
        )

        store.matches = []
        store.currentMatchIndex = 0
        pluginMethods.setEditorState(refreshEditor(newEditorState))
        applyCurrentMatchHighlight()
    }

    const open = (showReplace: boolean) => {
        store.isOpen = true
        store.showReplace = showReplace
        updateMatches()
        forceRedecorate()
        applyCurrentMatchHighlight()
    }

    const close = () => {
        store.isOpen = false
        store.searchTerm = ''
        store.replaceTerm = ''
        store.matches = []
        store.currentMatchIndex = 0
        forceRedecorate()
    }

    const toggleReplace = () => {
        store.showReplace = !store.showReplace
        forceRedecorate()
    }

    const decoratorStrategy = (
        contentBlock: ContentBlock,
        callback: DecoratorStrategyCallback,
        __contentState: ContentState,
    ) => {
        if (!store.isOpen || !store.searchTerm) return

        const text = contentBlock.getText().toLowerCase()
        const search = store.searchTerm.toLowerCase()
        let index = text.indexOf(search)

        while (index !== -1) {
            callback(index, index + search.length)
            index = text.indexOf(search, index + 1)
        }
    }

    const HighlightComponent = (props: DecoratorComponentProps) => (
        <span data-find-replace-highlight className={css.highlight}>
            {props.children}
        </span>
    )

    return {
        FindReplaceDialog,
        store,
        open,
        close,
        toggleReplace,
        onSearchChange,
        onReplaceChange,
        onFindNext,
        onFindPrevious,
        onReplace,
        onReplaceAll,

        initialize(methods: PluginMethods) {
            pluginMethods = methods
        },

        keyBindingFn(event: KeyboardEvent) {
            if (
                KeyBindingUtil.hasCommandModifier(event) &&
                event.shiftKey &&
                (event.key === 'f' || event.key === 'F')
            ) {
                event.preventDefault()
                return OPEN_REPLACE_COMMAND
            }

            if (
                KeyBindingUtil.hasCommandModifier(event) &&
                !event.shiftKey &&
                event.key === 'f'
            ) {
                event.preventDefault()
                return OPEN_FIND_COMMAND
            }

            // Ctrl+H for Windows/Linux
            if (
                event.ctrlKey &&
                !event.metaKey &&
                (event.key === 'h' || event.key === 'H') &&
                !event.shiftKey
            ) {
                event.preventDefault()
                return OPEN_REPLACE_COMMAND
            }

            return undefined
        },

        handleKeyCommand(command: string) {
            if (command === OPEN_FIND_COMMAND) {
                open(true)
                return EditorHandledNotHandled.Handled
            }

            if (command === OPEN_REPLACE_COMMAND) {
                open(true)
                return EditorHandledNotHandled.Handled
            }

            return EditorHandledNotHandled.NotHandled
        },

        decorators: [
            {
                strategy: decoratorStrategy,
                component: HighlightComponent,
            },
        ],
    }
}

export default createFindReplacePlugin
