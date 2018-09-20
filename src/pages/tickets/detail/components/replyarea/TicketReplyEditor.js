// @flow
import React from 'react'
import classnames from 'classnames'
import {Map, List, fromJS} from 'immutable'
import {connect} from 'react-redux'
import _debounce from 'lodash/debounce'
import _noop from 'lodash/noop'

import {EditorState, ContentState} from 'draft-js'

import shortcutManager from '../../../../../services/shortcutManager'
import RichField from '../../../../common/forms/RichField'

import {isRichType, acceptsOnlyImages, canLeaveInternalNote} from '../../../../../config/ticket'
import {humanizeString} from '../../../../../utils'
import {ATTACHMENT_SIZE_ERROR, getMaxAttachmentSize} from '../../../../../utils/file'

import * as macroActions from '../../../../../state/macro/actions'
import * as newMessageActions from '../../../../../state/newMessage/actions'
import * as newMessageSelectors from '../../../../../state/newMessage/selectors'
import {getOtherAgents} from '../../../../../state/agents/selectors'
import {notify} from '../../../../../state/notifications/actions'

import type {attachmentType} from '../../../../../types'
import type {agentsType} from '../../../../../state/agents/types'
import type {Node} from 'react'

import css from './TicketReplyEditor.less'


// Those are the source types which can send either text or attachment, but not both at the same time
export const TEXT_OR_ATTACHMENT_SOURCE_TYPES = ['facebook-messenger']
// Those are the source types which cannot send more than one attachment at a time
export const ONLY_ONE_ATTACHMENT_SOURCE_TYPES = ['facebook-messenger', 'facebook-comment']

// debounce the updating of the redux because it's slow otherwise when we type
export const updateMessageText = _debounce((props, editorState) => {
    if (!props.newMessage.getIn(['state', 'cacheAdded'])) {
        return
    }

    props.setResponseText(Map({
        contentState: editorState.getCurrentContent(),
        selectionState: editorState.getSelection(),
        forceUpdate: false,
        forceFocus: false,
    }))
}, 100)

type richAreaType = {
    state: {
        editorState: EditorState
    },
    focusEditor: () => void,
    _setEditorState: (T: EditorState) => void
}
type toolbarPropsType = {
    buttons: Array<Node>,
    displayedActions?: Array<string>
}
type filesType = Array<attachmentType>
type validationRegexType = string | RegExp

type Props = {
    actions: {},
    agents:  agentsType,
    newMessage: Map<*,*>,
    newMessageType: string,
    ticket: Map<*,*>,
    attachments: List<*>,

    addAttachments: typeof newMessageActions.addAttachments,
    notify: ({}) => void,
    setMacrosVisible: typeof macroActions.setMacrosVisible,
    setResponseText: typeof newMessageActions.setResponseText,

    richAreaRef: (T: richAreaType) => void
}

type State = {
    editorState: EditorState
}

export class TicketReplyEditor extends React.Component<Props, State> {
    richArea: richAreaType

    static defaultProps = {
        richAreaRef: _noop,
        attachments: fromJS([])
    }

    componentWillMount() {
        // set the initial state of the editor - there might be drafts
        this._updateEditorState(this._getEditorStateFromReducer(this.props))
    }

    componentDidMount() {
        shortcutManager.bind('TicketDetailContainer', {
            FOCUS_REPLY_AREA: {
                action: this._focusReplyArea
            }
        })
    }

    componentWillUnmount() {
        shortcutManager.unbind('TicketDetailContainer')

        // prevent updating the newMessage state value with an old value.
        // without it on unmount the newMessage state is populated with the old editor value,
        // because of the debouncer.
        updateMessageText.cancel()
    }

    componentWillReceiveProps(nextProps: Props) {
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
            setTimeout(() => {
                // it's rare, but sometimes the richArea disappears after the tick
                if (this.richArea) {
                    this.richArea.focusEditor()
                }
            }, 1)
        }
    }

    _focusReplyArea = (e: Event) => {
        if (e && e.preventDefault) { // no incoming event if manually triggered
            e.preventDefault()
        }

        if (this.richArea) {
            this.props.setMacrosVisible(false)
            this.richArea.focusEditor()
        }
    }

    _getEditorStateFromReducer = (props: Props) => {
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

    _canAddAttachments = (fileList: filesType = []) => {
        // FileList does not have map
        const files = Array.from(fileList)
        const {newMessageType, newMessage, attachments} = this.props
        const cantAddAttachmentBecauseOfText = TEXT_OR_ATTACHMENT_SOURCE_TYPES.includes(newMessageType)
            && newMessage.getIn(['newMessage', 'body_text'])

        const tooManyAttachments = ONLY_ONE_ATTACHMENT_SOURCE_TYPES.includes(newMessageType)
            && (attachments.size >= 1 || files.length > 1)

        if (cantAddAttachmentBecauseOfText) {
            this.props.notify({
                status: 'warning',
                message: `When using ${humanizeString(newMessageType)}, you can either send a text message, or an ` +
                'attachment, but not both at the same time.'
            })

            return false
        }

        if (tooManyAttachments) {
            this.props.notify({
                status: 'warning',
                message: `When using ${humanizeString(newMessageType)}, you can only send attachments one by one.`
            })

            return false
        }

        // check total attachments size.
        const currentSize = this._getFilesSize(files)
        const maxSize = getMaxAttachmentSize(this._getEditorState(), attachments.toJS())
        if (currentSize >= maxSize) {
            this.props.notify(ATTACHMENT_SIZE_ERROR)
            return false
        }

        return true
    }

    _handleFiles = (files: filesType, validationRegex: validationRegexType) => {
        const {newMessageType} = this.props
        if (!this._canAddAttachments(files)) {
            return
        }

        let regex = null
        let cancel = false

        let filesArray = Array.from(files)

        if (validationRegex) {
            regex = new RegExp(validationRegex)
        }

        filesArray.forEach((file) => {
            if (regex && !file.type.match(regex) && !cancel) {
                this.props.notify({
                    type: 'error',
                    status: 'warning',
                    message: `When answering to ${newMessageType} messages, the only attachments allowed are ${' '}
                    images (except svg).`
                })
                cancel = true
            }

            if (file.type.endsWith('svg+xml')) {
                this.props.notify({
                    type: 'error',
                    status: 'warning',
                    message: 'Uploading SVGs is not allowed.'
                })
                cancel = true
            }
        })

        if (cancel) {
            return
        }

        this.props.addAttachments(this.props.ticket, files)
    }

    _getEditorState = () => {
        if (!this.richArea) {
            return
        }

        return this.richArea.state.editorState
    }

    _updateEditorState = (editorState: EditorState) => {
        if (!this.richArea) {
            return
        }
        this.richArea._setEditorState(editorState)
    }

    _onEditorChange = (editorState: EditorState) => {
        // update the reducer when the editor state is changed
        updateMessageText(this.props, editorState)
    }

    _getFilesSize = (files: Array<File>) => {
        return files.reduce((sum, file) => sum + (file.size || 0), 0)
    }

    render() {
        const {newMessage, newMessageType, agents, richAreaRef, notify, attachments} = this.props

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

        const attachmentLoading = newMessage.getIn(['_internal', 'loading', 'addAttachment'])

        const toolbarProps: toolbarPropsType = {
            buttons: [
                <div className="attachment" key="attachments">
                    <label
                        htmlFor="attachments-input"
                        className="m-0"
                        title="Add attachment"
                    >
                        {
                            attachmentLoading
                                ? (
                                    <i className="icon material-icons md-spin">
                                        refresh
                                    </i>
                                ) : (
                                    <i className="material-icons">
                                        {newMessageAcceptsOnlyImages ? 'insert_photo' : 'attach_file'}
                                    </i>
                                )
                        }
                    </label>
                    <input
                        id="attachments-input"
                        type="file"
                        multiple
                        onChange={(event) => {
                            return this._handleFiles(event.target.files, attachmentInputProps.accept)
                        }}
                        onClick={(event) => {
                            // empty input on click
                            return event.target.value = null
                        }}
                        {...attachmentInputProps}
                    />
                </div>
            ],
            attachments
        }

        const cantWriteTextBecauseOfAttachments =
            TEXT_OR_ATTACHMENT_SOURCE_TYPES.includes(this.props.newMessage.getIn(['newMessage', 'source', 'type']))
            && attachments.size >= 1

        if (!isNewMessageRichType) {
            toolbarProps.displayedActions = ['emoji']
        }

        // If we can't write text nor add more attachments, we don't need to display any toolbar button
        if (cantWriteTextBecauseOfAttachments) {
            toolbarProps.displayedActions = []
            toolbarProps.buttons = []
        }

        const alertText = 'When using Facebook, you can either send a text message, or an attachment, ' +
            'but not both at the same time. If you want to write a message, remove the attachment first.'

        const isAlert = cantWriteTextBecauseOfAttachments
        const canInsertInlineImages = (newMessageType === 'email')

        return (
            <div className={classnames(css.component, {[css.isAlert]: isAlert})}>
                <RichField
                    ref={
                        // $FlowFixMe
                        (richArea: richAreaType) => {
                            this.richArea = richArea
                            richAreaRef(richArea)
                        }
                    }
                    value={{
                        text: newMessage.getIn(['newMessage', 'body_text']),
                        html: newMessage.getIn(['newMessage', 'body_html']),
                    }}
                    onChange={this._onEditorChange}
                    attachFiles = {(files) => {
                        return this._handleFiles(files, attachmentInputProps.accept)
                    }}
                    tabIndex="4"
                    readOnly={
                        newMessage.getIn(['_internal', 'loading', 'submitMessage']) ||
                        cantWriteTextBecauseOfAttachments
                    }
                    toolbarProps={toolbarProps}
                    mentionProps={mentionProps}
                    alertMode={isAlert && 'warning'}
                    alertText={alertText}
                    placeholder="Click here to reply, or press r."
                    notify={notify}
                    canInsertInlineImages={canInsertInlineImages}
                    attachments={attachments}
                    canDropFiles
                    signature
                    spellCheck
                />
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        newMessageType: newMessageSelectors.getNewMessageType(state),
        attachments: newMessageSelectors.getNewMessageAttachments(state),
        newMessage: state.newMessage,
        agents: getOtherAgents(state),
    }
}

const mapDispatchToProps = {
    addAttachments: newMessageActions.addAttachments,
    notify,
    setMacrosVisible: macroActions.setMacrosVisible,
    setResponseText: newMessageActions.setResponseText,
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketReplyEditor)
