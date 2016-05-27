import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import _ from 'lodash'
import {EditorState, ContentState, RichUtils, convertFromHTML} from 'draft-js'
import {stateToHTML} from 'draft-js-export-html'
import Editor from 'draft-js-plugins-editor'
import createMentionPlugin from 'draft-js-mention-plugin'
import createLinkifyPlugin from 'draft-js-linkify-plugin'
import createEmojiPlugin from 'draft-js-emoji-plugin'
import createDndPlugin from 'draft-js-dnd-plugin'
import 'draft-js-mention-plugin/lib/plugin.css'
import 'draft-js-linkify-plugin/lib/plugin.css'
import 'draft-js-emoji-plugin/lib/plugin.css'
import TicketAttachments from './TicketAttachments'
import TicketReplyAction from './TicketReplyAction'

export default class TicketReply extends React.Component {
    constructor(props) {
        super(props)
        this.state = this.initialState(this.props)
    }

    componentDidMount() {
        // we're listening from stuff that comes from the extension
        window.addEventListener('message', this.onMessage, false)
        this.refs.editor.focus()
        $('.TicketReply .ui.accordion').accordion('open', 0)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value === '') {
            this.state = this.initialState(nextProps)
        }
    }

    componentWillUnmount() {
        // We should remove the listener so we don't explode the browser
        window.removeEventListener('message', this.onMessage, false)
    }

    onChange = (editorState) => {
        this.setState({editorState})

        const text = editorState.getCurrentContent().getPlainText()
        const html = text === '' ? '' : stateToHTML(editorState.getCurrentContent())

        return this.props.actions.ticket.setResponseText(
            this.props.currentUser,
            text,
            html
        )
    }

    onMessage = (event) => {
        // We're waiting for an event from Gorgias extension - that the template has been inserted
        if (event.data.source && event.data.source === 'gorgias-extension') {
            if (event.data.payload.event === 'template-inserted') {
                // update the editor state after the extension was used
                const actualHTML = this.refs.editor.refs.editor.refs.editor.innerHTML
                const contentBlock = convertFromHTML(actualHTML)
                const contentState = ContentState.createFromBlockArray(contentBlock)
                const editorState = EditorState.moveFocusToEnd(EditorState.createWithContent(contentState))

                this.setState({editorState})
            }
        }
    }

    dndPlugin = createDndPlugin()

    initialState(props) {
        const contentState = ContentState.createFromText(props.value)

        const mentions = fromJS(
            props.users.get('agents', [])
                .map(user => fromJS({name: user.get('name'), link: '', avatar: ''})
                ))

        const plugins = [
            createMentionPlugin({mentions}),
            createLinkifyPlugin({
                target: '_blank'
            }),
            createEmojiPlugin(),
            this.dndPlugin
        ]

        return {
            editorState: EditorState.createWithContent(contentState),
            plugins
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
        this.dndPlugin.handleDroppedFiles(
            selection,
            files,
            {
                getEditorState: () => this.state.editorState,
                setEditorState: this.onChange
            }
        )

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
        const {ticket, appliedMacro, actions} = this.props
        let internal = ''

        if (ticket.get('newMessage') && !ticket.getIn(['newMessage', 'public'])) {
            internal = 'internal'
        }

        const className = `TicketReply search ui raised segment ${internal}`
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
                            editorState={this.state.editorState}
                            onChange={this.onChange}
                            onTab={this.onTab}
                            handleKeyCommand={this.handleKeyCommand}
                            handleDroppedFiles={this.handleDroppedFiles}
                            plugins={this.state.plugins}
                            ref="editor"
                        />
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
    currentUser: PropTypes.object.isRequired,
    appliedMacro: PropTypes.object,
    users: PropTypes.object.isRequired,
    value: PropTypes.string.isRequired
}
