import {KeyboardEvent} from 'react'
import {EditorState, DraftHandleValue, DraftEditorCommand} from 'draft-js'
import {Map} from 'immutable'

export type EditorCommand = DraftEditorCommand | string
export type CallbackReturnType = EditorCommand | null | undefined | void

export interface GetSetEditorState {
    setEditorState(editorState: EditorState): void // a function to update the EditorState
    getEditorState(): EditorState // a function to get the current EditorState
}

export interface MentionSuggestionCallbacks {
    keyBindingFn?(event: KeyboardEvent): CallbackReturnType
    handleKeyCommand: undefined
    onDownArrow?(event: KeyboardEvent): CallbackReturnType
    onUpArrow?(event: KeyboardEvent): CallbackReturnType
    onTab?(event: KeyboardEvent): CallbackReturnType
    onEscape?(event: KeyboardEvent): CallbackReturnType
    handleReturn?(event: KeyboardEvent): DraftHandleValue
    onChange?(editorState: EditorState): EditorState
}

export interface ClientRectFunction {
    (): DOMRect
}

export interface MentionData {
    link?: string
    avatar?: string
    name: string
    id?: null | string | number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [x: string]: any
}

export interface MentionPluginTheme {
    mention?: string
    mentionSuggestions?: string
    mentionSuggestionsPopup?: string
    mentionSuggestionsPopupVisible?: string
    mentionSuggestionsEntry?: string
    mentionSuggestionsEntryFocused?: string
    mentionSuggestionsEntryText?: string
    mentionSuggestionsEntryAvatar?: string
    [x: string]: string | undefined
}

export interface MentionPluginStore {
    setEditorState?(editorState: EditorState): void
    getEditorState?(): EditorState
    getPortalClientRect(offsetKey: string): DOMRect
    getAllSearches(): Map<string, string>
    isEscaped(offsetKey: string): boolean
    escapeSearch(offsetKey: string): void
    resetEscapedSearch(): void
    register(offsetKey: string): void
    updatePortalClientRect(offsetKey: string, funct: () => DOMRect): void
    unregister(offsetKey: string): void
}
