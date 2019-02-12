/**
 * Adapted from https://github.com/draft-js-plugins/draft-js-plugins/tree/master/draft-js-mention-plugin
 */

import decorateComponentWithProps from 'decorate-component-with-props'
import {Map} from 'immutable'

import Mention from './Mention'
import MentionSuggestions from './MentionSuggestions'
import MentionSuggestionsPortal from './MentionSuggestionsPortal'
import mentionStrategy from './mentionStrategy'
import mentionSuggestionsStrategy from './mentionSuggestionsStrategy'
import {defaultSuggestionsFilter, positionSuggestions} from './utils'

import styles from './Mention.less'


const createMentionPlugin = () => {
    const theme = {
        // CSS class for mention text
        mention: styles.mention,
        // CSS class for suggestions component
        mentionSuggestions: styles.mentionSuggestions,
        // CSS classes for an entry in the suggestions component
        mentionSuggestionsEntry: styles.mentionSuggestionsEntry,
        mentionSuggestionsEntryFocused: styles.mentionSuggestionsEntryFocused,
        mentionSuggestionsEntryText: styles.mentionSuggestionsEntryText,
    }

    const mentionTrigger = '@'
    const mentionPrefix = '@'
    const entityMutability = 'SEGMENTED'
    const mentionRegExp = '[\\w]*'

    const callbacks = {
        keyBindingFn: undefined,
        handleKeyCommand: undefined,
        onDownArrow: undefined,
        onUpArrow: undefined,
        onTab: undefined,
        onEscape: undefined,
        handleReturn: undefined,
        onChange: undefined,
    }

    const ariaProps = {
        ariaHasPopup: 'false',
        ariaExpanded: 'false',
    }

    let searches = Map()
    let escapedSearch
    let clientRectFunctions = Map()

    const store = {
        getEditorState: undefined,
        setEditorState: undefined,
        getPortalClientRect: (offsetKey) => clientRectFunctions.get(offsetKey)(),
        getAllSearches: () => searches,
        isEscaped: (offsetKey) => escapedSearch === offsetKey,
        escapeSearch: (offsetKey) => {
            escapedSearch = offsetKey
        },

        resetEscapedSearch: () => {
            escapedSearch = undefined
        },

        register: (offsetKey) => {
            searches = searches.set(offsetKey, offsetKey)
        },

        updatePortalClientRect: (offsetKey, func) => {
            clientRectFunctions = clientRectFunctions.set(offsetKey, func)
        },

        unregister: (offsetKey) => {
            searches = searches.delete(offsetKey)
            clientRectFunctions = clientRectFunctions.delete(offsetKey)
        },
    }

    const mentionSearchProps = {
        ariaProps,
        callbacks,
        theme,
        store,
        entityMutability,
        mentionTrigger,
        mentionPrefix,
        positionSuggestions,
    }

    return {
        MentionSuggestions: decorateComponentWithProps(MentionSuggestions, mentionSearchProps),
        decorators: [
            {
                strategy: mentionStrategy(mentionTrigger),
                component: decorateComponentWithProps(Mention, {theme}),
            },
            {
                strategy: mentionSuggestionsStrategy(mentionTrigger, mentionRegExp),
                component: decorateComponentWithProps(MentionSuggestionsPortal, {store}),
            },
        ],
        getAccessibilityProps: () => (
            {
                role: 'combobox',
                ariaAutoComplete: 'list',
                ariaHasPopup: ariaProps.ariaHasPopup,
                ariaExpanded: ariaProps.ariaExpanded,
            }
        ),

        initialize: ({getEditorState, setEditorState}) => {
            store.getEditorState = getEditorState
            store.setEditorState = setEditorState
        },

        onDownArrow: (keyboardEvent) => callbacks.onDownArrow && callbacks.onDownArrow(keyboardEvent),
        onTab: (keyboardEvent) => callbacks.onTab && callbacks.onTab(keyboardEvent),
        onUpArrow: (keyboardEvent) => callbacks.onUpArrow && callbacks.onUpArrow(keyboardEvent),
        onEscape: (keyboardEvent) => callbacks.onEscape && callbacks.onEscape(keyboardEvent),
        handleReturn: (keyboardEvent) => callbacks.handleReturn && callbacks.handleReturn(keyboardEvent),
        onChange: (editorState) => {
            if (callbacks.onChange) {
                return callbacks.onChange(editorState)
            }
            return editorState
        },
    }
}

export const suggestionsFilter = defaultSuggestionsFilter
export default createMentionPlugin

