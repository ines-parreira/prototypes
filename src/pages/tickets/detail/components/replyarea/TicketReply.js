import React, {PropTypes} from 'react'
import {Map} from 'immutable'
import _ from 'lodash'
import classNames from 'classnames'

import {EditorState, ContentState, RichUtils} from 'draft-js'
import Editor from 'draft-js-plugins-editor'
import createDndPlugin from 'draft-js-dnd-plugin'
import createEmojiPlugin from 'draft-js-emoji-plugin'
import createLinkifyPlugin from 'draft-js-linkify-plugin'
import 'draft-js-linkify-plugin/lib/plugin.css'
import 'draft-js-emoji-plugin/lib/plugin.css'
import TicketAttachments from './TicketAttachments'
import TicketReplyAction from './TicketReplyAction'

const dndPlugin = createDndPlugin()
const linkifyPlugin = createLinkifyPlugin()
const emojiPlugin = createEmojiPlugin()
const {EmojiSuggestions} = emojiPlugin
const plugins = [emojiPlugin, dndPlugin, linkifyPlugin]

export default class TicketReply extends React.Component {
    componentWillMount() {
        this.state = this._getEditorState(this.props)
    }

    componentDidMount() {
        // Autofocus on editor
        this.refs.editor.focus()
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
            editorState = EditorState.acceptSelection(editorState, selectionState.merge({
                hasFocus: false
            }))
        }
        return {editorState}
    }

    // throttle the updating of the redux because it's slow otherwise when we type
    _updateMessageText = _.throttle((editorState) => {
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

    _handleFiles(files) {
        const newFiles = []

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const {name, size, type} = file
            newFiles.push({url: null, name, size, content_type: type, file})
        }

        this.props.actions.ticket.addAttachments(this.props.ticket, newFiles)
    }

    _handleDroppedFiles = (selection, files) => {
        dndPlugin.handleDroppedFiles(selection, files, {
            getEditorState: () => this.state.editorState,
            setEditorState: this._onChange
        })
        this._handleFiles(files)
        return false
    }

    _renderAttachmentInput = () => {
        if (this.props.ticket.getIn(['_internal', 'loading', 'addAttachment'])) {
            return (
                <div className="attachments-pseudobar">
                    <div className="ui small active loader"></div>
                </div>
            )
        }

        return (
            <div className="attachments-pseudobar">
                <div className="fake-fileinput">
                    <label htmlFor="attachments-input">
                        <i className="large attach icon"/>
                    </label>
                    <input
                        id="attachments-input"
                        type="file"
                        multiple
                        onChange={(e) => this._handleFiles(e.target.files)}
                    />
                </div>
            </div>
        )
    }


    render() {
        const {ticket, appliedMacro, actions} = this.props
        const className = classNames('TicketReply search ui raised segment', {
            internal: ticket.get('newMessage') && !ticket.getIn(['newMessage', 'public']),
        })

        const httpActions = appliedMacro ?
            appliedMacro.get('actions').filter(action => action.get('name') === 'http') : []

        return (
            <div className={className}>
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

                {this._renderAttachmentInput()}

                <TicketAttachments
                    removable
                    attachments={ticket.getIn(['newMessage', 'attachments'])}
                    deleteAttachment={actions.ticket.deleteAttachment}
                />
                {
                    httpActions.map((action, key) => (
                        <TicketReplyAction
                            key={key}
                            index={appliedMacro.get('actions').indexOf(action)}
                            action={action}
                            update={actions.macro.updateActionArgsOnApplied}
                            remove={actions.macro.deleteActionOnApplied}
                            ticketId={ticket.get('id')}
                        />
                    ))
                }
            </div>
        )
    }
}

TicketReply.propTypes = {
    actions: PropTypes.object.isRequired,
    ticket: PropTypes.object.isRequired,
    appliedMacro: PropTypes.object,
}
