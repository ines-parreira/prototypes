import React, {Component, ComponentProps} from 'react'
import {ContentState, EditorState} from 'draft-js'
import _isEqual from 'lodash/isEqual'
import 'draft-js/dist/Draft.css'

import {attachEntitiesToVariables} from 'pages/common/draftjs/plugins/variables/utils'
import {contentStateFromTextOrHTML, convertToHTML} from 'utils/editor'

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
    constructor(props: Props) {
        super(props)
        const {defaultContentState} = props

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
    setEditorState = (editorState: EditorState) => {
        this.handleEditorChange(editorState)
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
        if (this.state.editorState) {
            return (
                convertToHTML(this.state.editorState.getCurrentContent()) !==
                html
            )
        }
    }

    _updateEditorState = (
        value: {
            html?: string
            text?: string
        },
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
        editorState = (
            EditorState.push as (
                editorState: EditorState,
                contentState: ContentState
            ) => EditorState
        )(editorState, contentState)

        // immutable variables on first load
        editorState = attachEntitiesToVariables(editorState, true)

        this.setState({editorState}, callback)
    }

    handleEditorChange = (editorState: EditorState) => {
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
