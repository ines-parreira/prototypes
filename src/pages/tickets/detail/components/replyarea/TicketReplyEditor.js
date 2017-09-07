import React, {PropTypes} from 'react'
import classnames from 'classnames'
import {Map} from 'immutable'
import {connect} from 'react-redux'
import _debounce from 'lodash/debounce'
import ImmutablePropTypes from 'react-immutable-proptypes'

import {EditorState, ContentState} from 'draft-js'
import createDndPlugin from 'draft-js-dnd-plugin'

import shortcutManager from '../../../../../services/shortcutManager'
import RichField from '../../../../common/forms/RichField'

import {isRichType, acceptsOnlyImages, canLeaveInternalNote} from '../../../../../config/ticket'

import * as macroActions from '../../../../../state/macro/actions'
import * as newMessageActions from '../../../../../state/newMessage/actions'
import * as newMessageSelectors from '../../../../../state/newMessage/selectors'
import {getOtherAgents} from '../../../../../state/users/selectors'

import {notify} from '../../../../../state/notifications/actions'

const dndPlugin = createDndPlugin()

// Those are the source type which can send either text or attachment, but not both; they also cannot send more
// than one attachment at a time
const RESTRAINED_SOURCE_TYPES = ['facebook-messenger']

// debounce the updating of the redux because it's slow otherwise when we type
export const updateMessageText = _debounce((props, editorState) => {
    if (!props.newMessage.getIn(['state', 'cacheAdded'])) {
        return
    }

    props.setResponseText(Map({
        contentState: editorState.getCurrentContent(),
        selectionState: editorState.getSelection()
    }))
}, 100)

class TicketReplyEditor extends React.Component {
    componentWillMount() {
        this._updateEditorState(this._getEditorStateFromReducer(this.props))
    }

    componentDidMount() {
        this._bindKeys()
    }

    componentWillReceiveProps(nextProps) {
        // only update if forceUpdate is true and it changed
        const prevForceUpdate = this.props.newMessage.getIn(['state', 'forceUpdate'])
        const nextForceUpdate = nextProps.newMessage.getIn(['state', 'forceUpdate'])
        const shouldUpdate = nextForceUpdate && prevForceUpdate !== nextForceUpdate

        if (shouldUpdate) {
            this._updateEditorState(this._getEditorStateFromReducer(nextProps))
        }

        // only focus if focus changed
        const prevForceFocus = this.props.newMessage.getIn(['state', 'forceFocus'])
        const nextForceFocus = nextProps.newMessage.getIn(['state', 'forceFocus'])
        const shouldFocus = nextForceFocus && prevForceFocus !== nextForceFocus

        if (shouldFocus && this.richArea) {
            // wait for the next tick to focus
            setTimeout(() => this.richArea._focusEditor(), 1)
        }
    }

    componentWillUnmount() {
        shortcutManager.unbind('TicketDetailContainer')
    }

    _bindKeys() {
        shortcutManager.bind('TicketDetailContainer', {
            FOCUS_REPLY_AREA: {
                action: (e) => {
                    if (e && e.preventDefault) { // no incoming event if manually triggered
                        e.preventDefault()
                    }

                    if (this.richArea) {
                        this.props.setMacrosVisible(false)
                        this.richArea._focusEditor()
                    }
                }
            },
        })
    }

    _getEditorStateFromReducer = (props) => {
        const state = props.newMessage.get('state')
        const contentState = state.get('contentState')
        const selectionState = state.get('selectionState')

        let editorState = this._getEditorState()

        if (!editorState) {
            return editorState
        }

        if (contentState && contentState.hasText()) {
            editorState = EditorState.push(editorState, contentState, 'insert-characters')
        } else {
            // empty editor state (triggered after message is sent, textarea needs to be emptied)
            editorState = EditorState.push(editorState, ContentState.createFromText(''))
        }

        if (selectionState) {
            // hasFocus:false is important here because otherwise the editor will have a very strange behavior
            editorState = EditorState.forceSelection(editorState, selectionState.merge({
                hasFocus: false
            }))
        }

        return editorState
    }

    _onChange = (editorState) => {
        this.setState({editorState})
        updateMessageText(this.props, editorState)
    }

    _canAddAttachments = (files) => {
        const cantAddAttachmentBecauseOfText =
            RESTRAINED_SOURCE_TYPES.includes(this.props.newMessage.getIn(['newMessage', 'source', 'type']))
            && this.props.newMessage.getIn(['newMessage', 'body_text'])

        const cantAddAttachmentBecauseOfAttachments =
            RESTRAINED_SOURCE_TYPES.includes(this.props.newMessage.getIn(['newMessage', 'source', 'type']))
            && this.props.newMessage.getIn(['newMessage', 'attachments']).size >= 1

        const tryToAddTooManyAttachments =
            RESTRAINED_SOURCE_TYPES.includes(this.props.newMessage.getIn(['newMessage', 'source', 'type']))
            && files.length > 1

        if (cantAddAttachmentBecauseOfText) {
            this.props.notify({
                type: 'error',
                message: 'When using Facebook, you can either send a text message, or an attachment, ' +
                'but not both at the same time'
            })

            return false
        }

        if (cantAddAttachmentBecauseOfAttachments || tryToAddTooManyAttachments) {
            this.props.notify({
                type: 'error',
                message: 'When using Facebook, you can only send attachments one by one.'
            })

            return false
        }

        return true
    }

    _handleFiles = (files) => {
        if (!this._canAddAttachments(files)) {
            return
        }

        this.props.addAttachments(this.props.ticket, files)
    }

    _handleDroppedFiles = (selection, files) => {
        dndPlugin.handleDroppedFiles(selection, files, {
            getEditorState: () => this.state.editorState,
            setEditorState: this._onChange
        })

        this._handleFiles(files)
        return false
    }

    _getEditorState = () => {
        if (!this.richArea) {
            return
        }

        return this.richArea.state.editorState
    }

    _updateEditorState = (editorState) => {
        if (!this.richArea) {
            return
        }

        this.richArea._setEditorState(editorState)
    }

    _updateReducer = () => {
        if (!this.richArea) {
            return
        }

        const {editorState} = this.richArea.state
        updateMessageText(this.props, editorState)
    }

    _handleOnEscape = () => {
        shortcutManager.triggerAction('TicketDetailContainer', 'BLUR_EVERYTHING')
    }

    render() {
        const {newMessage, newMessageType, agents} = this.props

        const isNewMessageRichType = isRichType(newMessageType)
        const newMessageAcceptsOnlyImages = acceptsOnlyImages(newMessageType)
        const canAddMention = canLeaveInternalNote(newMessageType)

        const attachmentInputProps = {}

        // if not rich type (like chat or Facebook message), only accept images
        if (newMessageAcceptsOnlyImages) {
            attachmentInputProps.accept = 'image/*'
        }

        const mentionProps = {
            canAddMention,
            suggestions: agents
        }

        const toolbarProps = {
            buttons: [
                <div className="attachment">
                    <label
                        htmlFor="attachments-input"
                        className="m-0"
                    >
                        {
                            newMessage.getIn(['_internal', 'loading', 'addAttachment'])
                                ? (
                                    <i className="fa fa-fw fa-circle-o-notch fa-spin"/>
                                ) : (
                                    <i
                                        className={classnames('fa fa-fw', {
                                            'fa-paperclip': !newMessageAcceptsOnlyImages,
                                            'fa-file-image-o': newMessageAcceptsOnlyImages,
                                        })}
                                        title="Add attachment"
                                    />
                                )
                        }
                    </label>
                    <input
                        id="attachments-input"
                        type="file"
                        multiple
                        onChange={(event) => {
                            return this._handleFiles(event.target.files)
                        }}
                        onClick={(event) => {
                            // empty input on click
                            return event.target.value = null
                        }}
                        {...attachmentInputProps}
                    />
                </div>
            ],
        }


        if (!isNewMessageRichType) {
            toolbarProps.displayedActions = ['emoji']
        }

        const cantWriteTextBecauseOfAttachments =
            RESTRAINED_SOURCE_TYPES.includes(this.props.newMessage.getIn(['newMessage', 'source', 'type']))
            && this.props.newMessage.getIn(['newMessage', 'attachments']).size >= 1

        const alertText = 'When using Facebook, you can either send a text message, or an attachment, ' +
            'but not both at the same time. If you want to write a message, remove the attachment first.'

        return (
            <div className="TicketReplyEditor">
                <RichField
                    ref={(richArea) => {
                        this.richArea = richArea
                    }}
                    value={{
                        text: newMessage.getIn(['newMessage', 'body_text']),
                        html: newMessage.getIn(['newMessage', 'body_html']),
                    }}
                    onChange={this._updateReducer}
                    handleDroppedFiles={this._handleDroppedFiles}
                    onEscape={this._handleOnEscape}
                    tabIndex="4"
                    spellCheck
                    canDropFiles
                    readOnly={
                        newMessage.getIn(['_internal', 'loading', 'submitMessage']) ||
                        cantWriteTextBecauseOfAttachments
                    }
                    toolbarProps={toolbarProps}
                    mentionProps={mentionProps}
                    alertMode={cantWriteTextBecauseOfAttachments && 'warning'}
                    alertText={alertText}
                    keyBindingFn={this._keyBindingFn}
                    handleKeyCommand={this._handleKeyCommand}
                    placeholder="Click here to reply, or press r."
                />
            </div>
        )
    }
}

TicketReplyEditor.propTypes = {
    addAttachments: PropTypes.func.isRequired,
    setResponseText: PropTypes.func.isRequired,
    actions: PropTypes.object.isRequired,
    ticket: PropTypes.object.isRequired,
    newMessageType: PropTypes.string.isRequired,
    newMessage: PropTypes.object.isRequired,
    notify: PropTypes.func.isRequired,
    setMacrosVisible: PropTypes.func.isRequired,
    agents: ImmutablePropTypes.list.isRequired
}

function mapStateToProps(state) {
    return {
        newMessageType: newMessageSelectors.getNewMessageType(state),
        newMessage: state.newMessage,
        agents: getOtherAgents(state)
    }
}

const mapDispatchToProps = {
    addAttachments: newMessageActions.addAttachments,
    setResponseText: newMessageActions.setResponseText,
    notify,
    setMacrosVisible: macroActions.setMacrosVisible,
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketReplyEditor)
