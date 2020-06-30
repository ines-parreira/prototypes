// @flow
/**
 * Adapted from https://github.com/draft-js-plugins/draft-js-plugins/tree/master/draft-js-mention-plugin
 */

import React, {Component} from 'react'
import {genKey} from 'draft-js'
import {List, fromJS} from 'immutable'

import type {Map} from 'immutable'
import type {EditorState, SelectionState} from 'draft-js'

import addMention from '../modifiers/addMention'
import {decodeOffsetKey, getSearchText} from '../utils'

import Entry from './Entry'
import defaultEntryComponent from './Entry/defaultEntryComponent'

import type {themeType} from './types'

type eventCallbackType = (T: Event) => ?'handled'

type callbacksType = {
    onDownArrow: ?eventCallbackType,
    onUpArrow: ?eventCallbackType,
    onEscape: ?eventCallbackType,
    handleReturn: ?eventCallbackType,
    onTab: ?eventCallbackType,
    onChange: ?eventCallbackType,
}

type storeType = {
    getAllSearches: () => Map<*, *>,
    getPortalClientRect: (T: string) => void,
    resetEscapedSearch: () => void,
    isEscaped: (T: string) => boolean,
    escapeSearch: (T: string) => void,
    getEditorState: () => EditorState,
    setEditorState: (T: EditorState) => void,
}

type Props = {
    callbacks: callbacksType,
    store: storeType,
    ariaProps: {
        ariaHasPopup: 'true' | 'false',
        ariaExpanded: 'true' | 'false',
    },
    theme: themeType,
    suggestions: List<*>,
    positionSuggestions: (T: {
        decoratorRect: ?string,
        prevProps: Props,
    }) => {},
    onSearchChange: (T: {value: string}) => void,
    mentionTrigger: string,
    canAddMention?: boolean,
    entityMutability?: string,
    entryComponent?: () => void,
    mentionPrefix?: string,
}

type State = {
    isActive: boolean,
    focusedOptionIndex: number,
}

export default class MentionSuggestions extends Component<Props, State> {
    key: string
    activeOffsetKey: string
    lastSearchValue: string
    popover: ?HTMLElement
    lastSelectionIsInsideWord: SelectionState

    static defaultProps = {
        suggestions: fromJS([]),
    }

    state = {
        isActive: false,
        focusedOptionIndex: 0,
    }

    componentWillMount() {
        this.key = genKey()
        this.props.callbacks.onChange = this.onEditorStateChange
    }

    componentWillReceiveProps(nextProps: Props) {
        if (nextProps.suggestions.size === 0 && this.state.isActive) {
            this.closeDropdown()
        }
    }

    componentDidUpdate = (prevProps: Props, prevState: State) => {
        if (this.popover) {
            // In case the list shrinks there should be still an option focused.
            // Note: this might run multiple times and deduct 1 until the condition is
            // not fullfilled anymore.
            const size = this.props.suggestions.size
            if (size > 0 && this.state.focusedOptionIndex >= size) {
                this.setState({
                    focusedOptionIndex: size - 1,
                })
            }

            // Note: this is a simple protection for the error when componentDidUpdate
            // try to get new getPortalClientRect, but the key already was deleted by
            // previous action. (right now, it only can happened when set the mention
            // trigger to be multi-characters which not supported anyway!)
            if (!this.props.store.getAllSearches().has(this.activeOffsetKey)) {
                return
            }

            const decoratorRect = this.props.store.getPortalClientRect(
                this.activeOffsetKey
            )
            const newStyles = this.props.positionSuggestions({
                decoratorRect,
                prevProps,
                prevState,
                props: this.props,
                state: this.state,
                popover: this.popover,
            })
            Object.keys(newStyles).forEach((key) => {
                // $FlowFixMe
                this.popover.style[key] = newStyles[key]
            })
        }
    }

    componentWillUnmount = () => {
        this.props.callbacks.onChange = undefined
    }

    onEditorStateChange = (editorState: EditorState) => {
        const searches = this.props.store.getAllSearches()

        // if no search portal is active there is no need to show the popover
        if (searches.size === 0) {
            return editorState
        }

        const removeList = () => {
            this.props.store.resetEscapedSearch()
            this.closeDropdown()
            return editorState
        }

        // get the current selection
        const selection = editorState.getSelection()
        const anchorKey = selection.getAnchorKey()
        const anchorOffset = selection.getAnchorOffset()

        // the list should not be visible if a range is selected or the editor has no focus
        if (!selection.isCollapsed() || !selection.getHasFocus()) {
            return removeList()
        }

        // identify the start & end positon of each search-text
        const offsetDetails = searches.map((offsetKey) =>
            decodeOffsetKey(offsetKey)
        )

        // a leaf can be empty when it is removed due e.g. using backspace
        const leaves = offsetDetails
            .filter(({blockKey}) => blockKey === anchorKey)
            .map(({blockKey, decoratorKey, leafKey}) =>
                editorState
                    .getBlockTree(blockKey)
                    .getIn([decoratorKey, 'leaves', leafKey])
            )

        // if all leaves are undefined the popover should be removed
        if (leaves.every((leave) => leave === undefined)) {
            return removeList()
        }

        // Checks that the cursor is after the @ character but still somewhere in
        // the word (search term). Setting it to allow the cursor to be left of
        // the @ causes troubles due selection confusion.
        // See https://github.com/draft-js-plugins/draft-js-plugins/issues/619
        const plainText = editorState.getCurrentContent().getPlainText()
        const selectionIsInsideWord = leaves
            .filter((leave) => leave !== undefined)
            .map(({start, end}) => {
                const isFirstCharacter =
                    start === 0 &&
                    anchorOffset === 1 && // cursor is directly to the right of the @ character
                    plainText.charAt(anchorOffset) !==
                        this.props.mentionTrigger && // 2 @ characters should close the popup
                    new RegExp(this.props.mentionTrigger, 'g').test(
                        plainText
                    ) &&
                    anchorOffset <= end

                const isInWord = anchorOffset > start + 1 && anchorOffset <= end

                return isFirstCharacter || isInWord
            })

        if (selectionIsInsideWord.every((isInside) => isInside === false)) {
            return removeList()
        }

        this.activeOffsetKey = selectionIsInsideWord
            .filter((value) => value === true)
            .keySeq()
            .first()

        this.onSearchChange(editorState, selection)

        // make sure the escaped search is reset in the cursor since the user
        // already switched to another mention search
        if (!this.props.store.isEscaped(this.activeOffsetKey)) {
            this.props.store.resetEscapedSearch()
        }

        // If none of the above triggered to close the window, it's safe to assume
        // the dropdown should be open. This is useful when a user focuses on another
        // input field and then comes back: the dropdown will again.
        if (
            !this.state.isActive &&
            !this.props.store.isEscaped(this.activeOffsetKey)
        ) {
            this.openDropdown()
        }

        // makes sure the focused index is reset every time a new selection opens
        // or the selection was moved to another mention search
        if (
            this.lastSelectionIsInsideWord === undefined ||
            !selectionIsInsideWord.equals(this.lastSelectionIsInsideWord)
        ) {
            this.setState({
                focusedOptionIndex: 0,
            })
        }

        this.lastSelectionIsInsideWord = selectionIsInsideWord

        return editorState
    }

    onSearchChange = (editorState: EditorState, selection: SelectionState) => {
        const {word} = getSearchText(editorState, selection)
        const searchValue = word.substring(1, word.length)
        if (this.lastSearchValue !== searchValue) {
            this.lastSearchValue = searchValue
            this.props.onSearchChange({value: searchValue})
        }
    }

    onDownArrow = (keyboardEvent: Event) => {
        keyboardEvent.preventDefault()
        const newIndex = this.state.focusedOptionIndex + 1
        this.onMentionFocus(
            newIndex >= this.props.suggestions.size ? 0 : newIndex
        )
    }

    onTab = (keyboardEvent: Event) => {
        keyboardEvent.preventDefault()
        this.commitSelection()
    }

    onUpArrow = (keyboardEvent: Event) => {
        keyboardEvent.preventDefault()
        if (this.props.suggestions.size > 0) {
            const newIndex = this.state.focusedOptionIndex - 1
            this.onMentionFocus(
                newIndex < 0 ? this.props.suggestions.size - 1 : newIndex
            )
        }
    }

    onEscape = (keyboardEvent: Event) => {
        keyboardEvent.preventDefault()

        const activeOffsetKey = this.lastSelectionIsInsideWord
            .filter((value) => value === true)
            .keySeq()
            .first()
        this.props.store.escapeSearch(activeOffsetKey)
        this.closeDropdown()

        // to force a re-render of the outer component to change the aria props
        this.props.store.setEditorState(this.props.store.getEditorState())
    }

    onMentionSelect = (mention: Map<*, *>) => {
        // Note: This can happen in case a user typed @xxx (invalid mention) and
        // then hit Enter. Then the mention will be undefined.
        if (!mention) {
            return
        }

        this.closeDropdown()
        const newEditorState = addMention(
            this.props.store.getEditorState(),
            mention,
            this.props.mentionPrefix,
            this.props.mentionTrigger,
            this.props.entityMutability
        )
        this.props.store.setEditorState(newEditorState)
    }

    onMentionFocus = (index: number) => {
        // eslint-disable-next-line react/no-direct-mutation-state
        this.state.focusedOptionIndex = index

        // to force a re-render of the outer component to change the aria props
        this.props.store.setEditorState(this.props.store.getEditorState())
    }

    commitSelection = () => {
        this.onMentionSelect(
            this.props.suggestions.get(this.state.focusedOptionIndex)
        )
        return 'handled'
    }

    openDropdown = () => {
        // This is a really nasty way of attaching & releasing the key related functions.
        // It assumes that the keyFunctions object will not loose its reference and
        // by this we can replace inner parameters spread over different modules.
        this.props.callbacks.onDownArrow = this.onDownArrow
        this.props.callbacks.onUpArrow = this.onUpArrow
        this.props.callbacks.onEscape = this.onEscape
        this.props.callbacks.handleReturn = this.commitSelection
        this.props.callbacks.onTab = this.onTab

        this.props.ariaProps.ariaHasPopup = 'true'
        this.props.ariaProps.ariaExpanded = 'true'
        this.setState({
            isActive: true,
        })
    }

    closeDropdown = () => {
        // make sure none of these callbacks are triggered
        this.props.callbacks.onDownArrow = undefined
        this.props.callbacks.onUpArrow = undefined
        this.props.callbacks.onTab = undefined
        this.props.callbacks.onEscape = undefined
        this.props.callbacks.handleReturn = undefined

        this.props.ariaProps.ariaHasPopup = 'false'
        this.props.ariaProps.ariaExpanded = 'false'
        this.setState({
            isActive: false,
        })
    }

    render() {
        if (!this.state.isActive) {
            return null
        }

        const {
            entryComponent,
            suggestions,
            theme = {},
            canAddMention,
        } = this.props

        if (!canAddMention) {
            return null
        }

        return (
            <div
                className={theme.mentionSuggestions}
                role="listbox"
                id={`mentions-list-${this.key}`}
                ref={(element) => {
                    this.popover = element
                }}
            >
                {suggestions
                    .map((mention, index) => {
                        if (!mention.get('name')) {
                            return null
                        }
                        return (
                            <Entry
                                key={
                                    mention.has('id')
                                        ? mention.get('id')
                                        : mention.get('name')
                                }
                                onMentionSelect={this.onMentionSelect}
                                onMentionFocus={this.onMentionFocus}
                                isFocused={
                                    this.state.focusedOptionIndex === index
                                }
                                mention={mention}
                                index={index}
                                id={`mention-option-${this.key}-${index}`}
                                theme={theme}
                                searchValue={this.lastSearchValue}
                                entryComponent={
                                    entryComponent || defaultEntryComponent
                                }
                            />
                        )
                    })
                    .toJS()}
            </div>
        )
    }
}
