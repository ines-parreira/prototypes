import type { ComponentProps } from 'react'
import React, { Component } from 'react'

import type { ContentState } from 'draft-js'
import { EditorState } from 'draft-js'
import _isEqual from 'lodash/isEqual'

import 'draft-js/dist/Draft.css'

import { attachEntitiesToVariables } from 'pages/common/draftjs/plugins/variables/utils'
import {
    contentStateFromTextOrHTML,
    convertToHTML,
    isValidSelectionKey,
} from 'utils/editor'

import RichFieldEditor from './RichFieldEditor'

export type Props = {
    allowExternalChanges?: boolean
    defaultContentState?: ContentState
    onChange: (arg: EditorState) => void
    value: {
        html?: string
        text?: string
    }
} & Partial<Omit<ComponentProps<typeof RichFieldEditor>, 'editorState'>>

type State = {
    editorState: EditorState
    isFocused: boolean
}

export default class RichField extends Component<Props, State> {
    // Synchronous mirror of `this.state.editorState` to avoid stale reads
    // between batched/async `setState` calls (e.g. in _didHTMLChanged).
    _latestEditorState: EditorState | null = null
    _sentHTMLSet = new Set<string>()
    _sentHTMLCleanupTimer: ReturnType<typeof setTimeout> | null = null

    constructor(props: Props) {
        super(props)
        const { defaultContentState } = props

        let editorState = EditorState.createEmpty()

        if (defaultContentState) {
            editorState = EditorState.createWithContent(defaultContentState)
            editorState = attachEntitiesToVariables(editorState, true)
        }

        this.state = {
            editorState,
            isFocused: false,
        } as State
    }

    UNSAFE_componentWillMount() {
        this._updateEditorState(this.props.value)
    }

    UNSAFE_componentWillReceiveProps(nextProps: Props) {
        // update editor state only if value has changed externally (display-only or allowExternalChanges)
        if (
            !_isEqual(nextProps.value, this.props.value) &&
            (this.props.displayOnly || this.props.allowExternalChanges)
        ) {
            this._updateEditorState(nextProps.value)
        }
    }

    // Warning: used by parents that want to set a new editor state
    setEditorState = (editorState: EditorState) => {
        this.handleEditorChange(editorState)
    }

    // Warning: this method is used by parents through ref
    focusEditor = () => {
        this.setState({ isFocused: true })
    }

    // Warning: this method is used by parent through ref
    isFocused = () => {
        return this.state.isFocused
    }

    _didHTMLChanged = (html?: string, text?: string) => {
        const incomingIsEmpty = !html && !text
        if (incomingIsEmpty) {
            const editorState =
                this._latestEditorState || this.state.editorState
            const currentIsEmpty =
                !editorState ||
                editorState.getCurrentContent().getPlainText() === ''
            if (currentIsEmpty) return false
        }

        if (html !== undefined && this._sentHTMLSet.has(html)) {
            return false
        }

        const editorState = this._latestEditorState || this.state.editorState
        if (editorState) {
            return convertToHTML(editorState.getCurrentContent()) !== html
        }
    }

    _updateEditorState = (
        value: {
            html?: string
            text?: string
        },
        callback?: () => any,
    ) => {
        // if incoming value is the same as the current one, don't update the current one
        if (!this._didHTMLChanged(value.html, value.text)) {
            return
        }

        let { editorState } = this.state

        // Preserve current selection before updating content
        const currentSelection = editorState.getSelection()

        // generate a content state from incoming value
        const contentState = contentStateFromTextOrHTML(value.text, value.html)
        // set content state in editor state
        editorState = (
            EditorState.push as (
                editorState: EditorState,
                contentState: ContentState,
            ) => EditorState
        )(editorState, contentState)

        // immutable variables on first load
        editorState = attachEntitiesToVariables(editorState, true)

        // Restore the preserved selection to maintain cursor position
        // Only if the selection is still valid (block keys exist in new content)
        if (isValidSelectionKey(editorState, currentSelection)) {
            editorState = EditorState.forceSelection(
                editorState,
                currentSelection,
            )
        }

        this._latestEditorState = editorState
        this.setState({ editorState }, callback)
    }

    handleEditorChange = (editorState: EditorState) => {
        this._latestEditorState = editorState
        this.setState({ editorState }, () => {
            const html = convertToHTML(editorState.getCurrentContent())
            this._sentHTMLSet.add(html)

            if (this._sentHTMLCleanupTimer !== null) {
                clearTimeout(this._sentHTMLCleanupTimer)
            }
            this._sentHTMLCleanupTimer = setTimeout(() => {
                this._sentHTMLSet.clear()
            }, 3000)

            this.props.onChange(editorState)
        })
    }

    componentWillUnmount() {
        if (this._sentHTMLCleanupTimer !== null) {
            clearTimeout(this._sentHTMLCleanupTimer)
        }
    }

    _onFocus = () => {
        this.setState({ isFocused: true })
    }

    _onBlur = () => {
        this.setState({ isFocused: false })
        this.props.onBlur?.()
    }

    render() {
        /* eslint-disable @typescript-eslint/no-unused-vars */
        const {
            allowExternalChanges,
            defaultContentState,
            onChange,
            value,
            ...richFieldEditorProps
        } = this.props
        /* eslint-enable @typescript-eslint/no-unused-vars */

        return (
            <RichFieldEditor
                {...richFieldEditorProps}
                editorState={this.state.editorState}
                isFocused={this.state.isFocused}
                onChange={this.handleEditorChange}
                onFocus={this._onFocus}
                onBlur={this._onBlur}
            />
        )
    }
}
