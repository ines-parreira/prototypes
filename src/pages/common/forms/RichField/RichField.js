// @flow
import {EditorState} from 'draft-js'
import 'draft-js/dist/Draft.css'
import _isEqual from 'lodash/isEqual'
import React from 'react'

import {
    contentStateFromTextOrHTML,
    convertToHTML,
} from '../../../../utils/editor.tsx'
import {attachEntitiesToVariables} from '../../draftjs/plugins/variables/utils'
import InputField from '../InputField'

import RichFieldEditor, {
    type Props as RichFieldEditorProps,
} from './RichFieldEditor'

type Props = {
    allowExternalChanges: boolean,
    value: {
        html?: string,
        text: string,
    },
} & $Diff<
    RichFieldEditorProps,
    {
        editorState: EditorState,
    }
>

type State = {
    editorState: EditorState,
    isFocused: boolean,
}

// Deprecated component, use RichFieldEditor instead
export default class RichField extends InputField<Props, State> {
    constructor(props: Props) {
        super(props)

        let editorState = EditorState.createEmpty()

        this.state = ({
            editorState,
            isFocused: false,
        }: State)
    }

    componentWillMount() {
        this._updateEditorState(this.props.value)
    }

    componentWillReceiveProps(nextProps: Props) {
        // when we do a preview we're changing the value directly and so we need to update the editor state
        if (
            !_isEqual(nextProps.value, this.props.value) &&
            (this.props.displayOnly || this.props.allowExternalChanges)
        ) {
            this._updateEditorState(nextProps.value)
        }
    }

    // Warning: used by parents that want to set a new editor state
    _setEditorState = (editorState: EditorState) => {
        this._onChange(editorState)
    }

    // Warning: this method is used by parents through ref
    focusEditor = () => {
        this.setState({isFocused: true})
    }

    // Warning: this method is used by parent through ref
    isFocused = () => {
        return this.state.isFocused
    }

    _didHTMLChanged = (html?: string) => {
        return (
            convertToHTML(this.state.editorState.getCurrentContent()) !== html
        )
    }

    _updateEditorState = (
        value: {html?: string, text: string},
        callback?: () => any
    ) => {
        // if incoming value is the same as the current one, don't update the current one
        if (!this._didHTMLChanged(value.html)) {
            return
        }

        let {editorState} = this.state

        // generate a content state from incoming value
        const contentState = contentStateFromTextOrHTML(value.text, value.html)

        // set content state in editor state
        editorState = EditorState.push(editorState, contentState)

        // immutable variables on first load
        editorState = attachEntitiesToVariables(editorState, true)

        this.setState({editorState}, callback)
    }

    _onChange = (editorState: EditorState) => {
        this.setState({editorState}, () => {
            // notify the parent of the new editor state
            this.props.onChange(editorState)
        })
    }

    _onFocus = () => {
        this.setState({isFocused: true})
    }

    _onBlur = () => {
        this.setState({isFocused: false})
    }

    _getField = () => {
        return (
            <RichFieldEditor
                {...this.props}
                editorState={this.state.editorState}
                isFocused={this.state.isFocused}
                onChange={this._onChange}
                onFocus={this._onFocus}
                onBlur={this._onBlur}
            />
        )
    }
}
