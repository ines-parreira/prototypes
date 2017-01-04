import React, {PropTypes} from 'react'
import {Map} from 'immutable'
import _throttle from 'lodash/throttle'

import {EditorState, ContentState, RichUtils} from 'draft-js'
import Editor from 'draft-js-plugins-editor'
import createDndPlugin from 'draft-js-dnd-plugin'
import createEmojiPlugin from 'draft-js-emoji-plugin'
import createLinkifyPlugin from 'draft-js-linkify-plugin'
import 'draft-js-linkify-plugin/lib/plugin.css'
import 'draft-js-emoji-plugin/lib/plugin.css'

const dndPlugin = createDndPlugin()
const linkifyPlugin = createLinkifyPlugin()
const emojiPlugin = createEmojiPlugin()
const {EmojiSuggestions} = emojiPlugin
const plugins = [emojiPlugin, dndPlugin, linkifyPlugin]

export default class TicketReplyEditor extends React.Component {
    componentWillMount() {
        this.state = this._getEditorState(this.props)
    }

    componentDidMount() {
        // We'd like to autofocus the editor, but in componentDidMount the editor element might not be ready
        // so we're using the setTimeout hack to focus the editor here
        setTimeout(() => this.refs.editor && this.refs.editor.focus(), 1)
    }

    componentWillReceiveProps(nextProps) {
        const contentState = nextProps.ticket.getIn(['state', 'contentState'])
        const forceUpdate = nextProps.ticket.getIn(['state', 'forceUpdate'])
        if (contentState === null || forceUpdate) {
            this.setState(this._getEditorState(nextProps))
        }
    }

    _getEditorState(props) {
        const state = props.ticket.get('state')
        const contentState = state.get('contentState')
        const selectionState = state.get('selectionState')

        let editorState = EditorState.createWithContent(ContentState.createFromText(''))
        if (contentState && contentState.hasText()) {
            editorState = EditorState.push(editorState, contentState, 'insert-characters')
        } else {
            // This is required because otherwise the cursor has an undefined state for an empty content
            // See: https://github.com/facebook/draft-js/issues/410
            editorState = EditorState.moveFocusToEnd(editorState)
        }

        if (selectionState) {
            // hasFocus:false is important here because otherwise the editor will have a very strange behavior
            editorState = EditorState.forceSelection(editorState, selectionState.merge({
                hasFocus: false
            }))
        }
        return {editorState}
    }

    // throttle the updating of the redux because it's slow otherwise when we type
    _updateMessageText = _throttle((editorState) => {
        this.props.actions.ticket.setResponseText(this.props.ticket.get('id'), Map({
            contentState: editorState.getCurrentContent(),
            selectionState: editorState.getSelection()
        }))
    }, 300)

    _onChange = (editorState) => {
        this.setState({editorState})
        this._updateMessageText(editorState)
    }

    // This is for handling things like Bold, Italic, etc..
    _handleKeyCommand = (command) => {
        const newState = RichUtils.handleKeyCommand(this.state.editorState, command)
        if (newState) {
            this._onChange(newState)
            return true
        }
        return false
    }

    _handleDroppedFiles = (selection, files) => {
        dndPlugin.handleDroppedFiles(selection, files, {
            getEditorState: () => this.state.editorState,
            setEditorState: this._onChange
        })
        this.props.handleFiles(files)
        return false
    }

    render() {
        const {ticket} = this.props

        return (
            <div
                ref="overlay"
                className="ui reply form"
                onDragEnter={() => this.refs.overlay.classList.add('active')}
                onDragLeave={() => this.refs.overlay.classList.remove('active')}
                onDrop={() => this.refs.overlay.classList.remove('active')}
            >
                <div className="field">
                    <Editor
                        ref="editor"
                        tabIndex="4"
                        spellCheck
                        readOnly={ticket.getIn(['_internal', 'loading', 'submitMessage'])}
                        editorState={this.state.editorState}
                        plugins={plugins}
                        onChange={this._onChange}
                        handleKeyCommand={this._handleKeyCommand}
                        handleDroppedFiles={this._handleDroppedFiles}
                    />
                    <EmojiSuggestions />
                </div>
            </div>
        )
    }
}

TicketReplyEditor.propTypes = {
    actions: PropTypes.object.isRequired,
    ticket: PropTypes.object.isRequired,
    handleFiles: PropTypes.func.isRequired,
}
