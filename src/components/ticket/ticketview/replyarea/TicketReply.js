import React, {PropTypes} from 'react'
import {Map} from 'immutable'
import _ from 'lodash'
import classNames from 'classnames'
import {EditorState, ContentState, RichUtils, convertFromHTML} from 'draft-js'
import Editor from 'draft-js-plugins-editor'
import createDndPlugin from 'draft-js-dnd-plugin'
import createEmojiPlugin from 'draft-js-emoji-plugin'
import createLinkifyPlugin from 'draft-js-linkify-plugin'
import 'draft-js-mention-plugin/lib/plugin.css'
import 'draft-js-linkify-plugin/lib/plugin.css'
import 'draft-js-emoji-plugin/lib/plugin.css'
import TicketAttachments from './TicketAttachments'
import TicketReplyAction from './TicketReplyAction'

const dndPlugin = createDndPlugin()
const linkifyPlugin = createLinkifyPlugin()
const emojiPlugin = createEmojiPlugin({
    emojiSuggestions: 'emoji-suggestions'
})
const {EmojiSuggestions} = emojiPlugin
const plugins = [emojiPlugin, dndPlugin, linkifyPlugin]

export default class TicketReply extends React.Component {
    constructor(props) {
        super(props)
        this.state = this.getEditorState(this.props)
    }

    componentDidMount() {
        // we're listening from stuff that comes from the Gorgias Chrome Extension
        window.addEventListener('message', this.onMessage, false)
        $('.TicketReply .ui.accordion').accordion('open', 0)
    }

    componentWillReceiveProps(nextProps) {
        // update the state if the we have a change that doesn't come from typing stuff (from macros for example)
        if (nextProps.contentState === null || nextProps.fromMacro) {
            this.setState(this.getEditorState(nextProps))
            // Mark the fromMacro as false so we don't get the same macro twice
            this.props.actions.ticket.receivedMacro()
        }

        // Manage autofocus: Autofocus on the editor if the edit area becomes visible
        // Note: When using a macro don't autofocus - macro should manage that
        if (nextProps.autoFocus && nextProps.visible && nextProps.visible !== this.props.visible && !nextProps.fromMacro) {
            this.refs.editor.focus()
        }
    }

    componentWillUnmount() {
        // We should remove the listener so we don't explode the browser
        window.removeEventListener('message', this.onMessage, false)
    }

    getEditorState(props) {
        const contentState = props.contentState ? props.contentState : ContentState.createFromText('')
        const editorState = EditorState.createWithContent(contentState)
        return {editorState}
    }

    // throttle the updating of the redux because it's slow otherwise when we type
    updateMessageText = _.throttle((editorState) => {
        const contentState = editorState.getCurrentContent()
        this.props.actions.ticket.setResponseText(this.props.currentUser, Map({contentState}))
    }, 300)

    // store the content before the tab (completion from the extension), this allows us to manage the state correctly
    textBeforeTab = ''
    onTab = () => {
        this.textBeforeTab = this.refs.editor.refs.editor.refs.editor.innerText
    }

    onChange = (editorState) => {
        // don't update the state if the change came from the extension
        if (this.textBeforeTab !== '' &&
            this.refs.editor && this.refs.editor.refs.editor.refs.editor.innerText !== this.textBeforeTab) {
            // we do this to let onMessage be called which will itself call onChange
            this.textBeforeTab = ''
            return
        }
        this.setState({editorState})
        this.updateMessageText(editorState)
    }

    onMessage = (event) => {
        // We're waiting for an event from Gorgias extension - that the template has been inserted
        if (!(event.data.source && event.data.source === 'gorgias-extension')) {
            return
        }

        if (event.data.payload.event === 'template-inserted') {
            // update the editor state after the extension was used
            const blocks = this.refs.editor.refs.editor.refs.editor.querySelectorAll('[data-text=true]')
            let actualHTML = ''
            for (let i = 0; i < blocks.length; i++) {
                actualHTML += `<div>${blocks.item(i).innerHTML}</div>`
            }

            // const browserSelection = window.getSelection()
            // const selectionState = SelectionState.createEmpty()
            const contentBlocks = convertFromHTML(actualHTML)
            const contentState = ContentState.createFromBlockArray(contentBlocks)
            const editorState = EditorState.moveFocusToEnd(EditorState.createWithContent(contentState))

            this.onChange(editorState)
        }
    }


    // This is for handling things like Bold, Italic, etc..
    handleKeyCommand = (command) => {
        const newState = RichUtils.handleKeyCommand(this.state.editorState, command)
        if (newState) {
            this.onChange(newState)
            return true
        }
        return false
    }

    handleFiles(files) {
        let newFiles = []

        if (files.constructor.name === 'FileList') {
            newFiles = _.values(files)
        } else {
            newFiles = files
        }

        const atts = newFiles.map((o, i) => ({
            url: null,
            name: o.name,
            size: o.size,
            content_type: o.type,
            file: document.getElementById('file-input').files[i] || o
        }))

        this.props.actions.ticket.addAttachments(atts)
    }

    handleDroppedFiles = (selection, files) => {
        dndPlugin.handleDroppedFiles(selection, files, {
            getEditorState: () => this.state.editorState,
            setEditorState: this.onChange
        })
        this.handleFiles(files)
        return false
    }

    renderAttachmentInput = () => {
        if (this.props.ticket.getIn(['state', 'attachmentLoading'])) {
            return (
                <div className="attachments-pseudobar">
                    <div className="ui small active loader"></div>
                </div>
            )
        }

        return (
            <div className="attachments-pseudobar">
                <div className="fake-fileinput">
                    <i className="large attach icon"/>
                    <input
                        type="file"
                        id="file-input"
                        onChange={(e) => this.handleFiles(e.target.files)}
                    />
                </div>
            </div>
        )
    }

    render() {
        const {ticket, visible, appliedMacro, actions} = this.props
        const className = classNames('TicketReply search ui raised segment', {
            internal: ticket.get('newMessage') && !ticket.getIn(['newMessage', 'public']),
            hidden: !visible
        })

        const httpActions = appliedMacro ?
            appliedMacro.get('actions').filter(action => action.get('name') === 'http') : []

        return (
            <div className={className}>
                <form
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
                            editorState={this.state.editorState}
                            plugins={plugins}
                            onChange={this.onChange}
                            onTab={this.onTab}
                            handleKeyCommand={this.handleKeyCommand}
                            handleDroppedFiles={this.handleDroppedFiles}
                        />
                        <EmojiSuggestions />
                    </div>
                </form>

                {this.renderAttachmentInput()}

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
    visible: PropTypes.bool,
    currentUser: PropTypes.object.isRequired,
    appliedMacro: PropTypes.object,
    users: PropTypes.object.isRequired,
    contentState: PropTypes.object,
    fromMacro: PropTypes.bool,
    receivedMacro: PropTypes.func,
    autoFocus: PropTypes.bool.isRequired
}
