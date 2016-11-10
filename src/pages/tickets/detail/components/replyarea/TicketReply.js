import React, {PropTypes} from 'react'
import {Map} from 'immutable'
import _ from 'lodash'
import classNames from 'classnames'
import {EditorState, ContentState, SelectionState, RichUtils} from 'draft-js'
import {convertFromHTML} from 'draft-convert'
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
        this.state = this._getEditorState(this.props)
        this.isInitialized = false
    }

    componentDidMount() {
        // we're listening to stuff that comes from the Gorgias Chrome Extension
        window.addEventListener('message', this._onMessage, false)
        $('.TicketReply .ui.accordion').accordion('open', 0)
    }

    componentWillReceiveProps(nextProps) {
        // update the state if we have a change that doesn't come from typing stuff (from macros for example)
        if (nextProps.contentState === null || nextProps.fromMacro) {
            this.isInitialized = false
            this.setState(this._getEditorState(nextProps))
            // Mark the fromMacro as false so we don't get the same macro twice
            this.props.actions.ticket.receivedMacro()
        }
    }

    componentDidUpdate(prevProps) {
        // Manage autofocus: Autofocus on the editor if the edit area becomes visible
        // Note: When using a macro don't autofocus - macro should manage that
        if (
            this.props.autoFocus &&
            (
                (
                    // If the editor wasnt visible before but is visible now
                    this.props.visible && this.props.visible !== prevProps.visible
                ) || (
                    // If the editor was read-only before and is editable again now
                !this.props.ticket.getIn(['_internal', 'loading', 'submitMessage']) &&
                this.props.ticket.getIn(['_internal', 'loading', 'submitMessage']) !== prevProps.ticket.getIn(['_internal', 'loading', 'submitMessage']))
            ) && !this.props.fromMacro
        ) {
            this.refs.editor.focus()
        }

        // manually trigger the change event if from macro,
        // to save state.
        // otherwise text added by macros is not cached.
        if (this.props.fromMacro) {
            this._onChange(this.state.editorState)
        }
    }

    componentWillUnmount() {
        // We should remove the listener so we don't explode the browser
        window.removeEventListener('message', this._onMessage, false)
    }

    _getEditorState(props) {
        let defaultContent = ContentState.createFromText('')

        if ( // We check both signature_html and signature_text, because sometimes the signature_html is not null
        // when it should be (ex. : signature_text = '', signature_html = '<div><br></div>').
        props.ticket.get('channel') === 'email'
        && props.currentUser.get('signature_html')
        && props.currentUser.get('signature_text')
        ) {
            defaultContent = convertFromHTML(`<br>${props.currentUser.get('signature_html')}`)
        }

        const contentState = props.contentState ? props.contentState : defaultContent
        const editorState = EditorState.acceptSelection(
            EditorState.createWithContent(contentState),
            SelectionState.createEmpty(contentState.getFirstBlock().getKey())
        )

        return {editorState}
    }

    // throttle the updating of the redux because it's slow otherwise when we type
    _updateMessageText = _.throttle((editorState) => {
        const contentState = editorState.getCurrentContent()
        const selectionState = editorState.getSelection()
        this.props.actions.ticket.setResponseText(this.props.currentUser, Map({contentState, selectionState}), this.props.ticket.get('id'))
    }, 300)

    // store the content before the tab (completion from the extension), this allows us to manage the state correctly
    textBeforeTab = ''
    _onTab = () => {
        this.textBeforeTab = this.refs.editor.refs.editor.refs.editor.innerText
    }

    _onChange = (editorState) => {
        // don't update the state if the change came from the extension
        if (this.textBeforeTab !== '' &&
            this.refs.editor && this.refs.editor.refs.editor.refs.editor.innerText !== this.textBeforeTab) {
            // we do this to let _onMessage be called which will itself call _onChange
            this.textBeforeTab = ''
            return
        }

        let res = editorState

        // When initializing the state, the Editor component move the focus to the end
        // This is to prevent this behavior.
        if (!this.isInitialized && editorState.getCurrentContent().equals(this.state.editorState.getCurrentContent())) {
            res = EditorState.forceSelection(editorState, this.state.editorState.getSelection())
        }

        // the editor triggers a change event when focused
        // (on load - if not a macro),
        // causing issues with changing contentState.
        // (eg. after clearing contentState in the reducer,
        // the change event will rewrite it with the text in the editor -
        // the previous data).
        // set state only after the first change.
        if (this.isInitialized || this.props.fromMacro) {
            this.setState({editorState: res})
            this._updateMessageText(res)
        }

        if (!this.isInitialized) {
            this.isInitialized = true
        }
    }

    _onMessage = (event) => {
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
            const contentState = convertFromHTML(actualHTML)
            const editorState = EditorState.moveFocusToEnd(EditorState.createWithContent(contentState))

            this._onChange(editorState)
        }
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
                    <i className="large attach icon" />
                    <input
                        type="file"
                        multiple
                        id="file-input"
                        onChange={(e) => this._handleFiles(e.target.files)}
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
                            onTab={this._onTab}
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
    visible: PropTypes.bool,
    currentUser: PropTypes.object.isRequired,
    appliedMacro: PropTypes.object,
    users: PropTypes.object.isRequired,
    contentState: PropTypes.object,
    fromMacro: PropTypes.bool,
    receivedMacro: PropTypes.func,
    autoFocus: PropTypes.bool.isRequired
}
