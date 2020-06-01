// @flow
import {ContentState, EditorState} from 'draft-js'
import {fromJS, List, Map} from 'immutable'
import _debounce from 'lodash/debounce'
import _noop from 'lodash/noop'
import React, {type Node} from 'react'
import {connect} from 'react-redux'

import { canAddAttachments, type TicketMessageSourceType } from '../../../../../business/ticket'
import {
    canLeaveInternalNote,
    isRichType
} from '../../../../../config/ticket'
import {getOtherAgents} from '../../../../../state/agents/selectors'
import type {agentsType} from '../../../../../state/agents/types'
import * as newMessageActions from '../../../../../state/newMessage/actions'
import * as newMessageSelectors from '../../../../../state/newMessage/selectors'
import {notify} from '../../../../../state/notifications/actions'
import type {attachmentType} from '../../../../../types'
import {getFileTooLargeError, getMaxAttachmentSize} from '../../../../../utils/file'
import RichField from '../../../../common/forms/RichField'
import {getContext} from '../../../../../state/prediction/selectors'

import css from './TicketReplyEditor.less'

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
type filesType = Array<attachmentType>
type validationRegexType = string | RegExp

type Props = {
    actions: {},
    agents: agentsType,
    newMessage: Map<*, *>,
    newMessageType: TicketMessageSourceType,
    ticket: Map<*, *>,
    predictionContext: Map<*, *>,
    attachments: List<*>,

    addAttachments: typeof newMessageActions.addAttachments,
    notify: ({}) => void,
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

    componentWillUnmount() {
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
    }

    _getEditorStateFromReducer = (props: Props) => {
        const state = props.newMessage.get('state')
        const contentState = state.get('contentState')

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

        return editorState
    }

    _canAddAttachments = (fileList: filesType = []) => {
        // FileList does not have map
        const files = Array.from(fileList)
        const {
            attachments,
            newMessage,
            newMessageType,
        } = this.props

        const notification = canAddAttachments(
            newMessageType,
            newMessage.getIn(['newMessage', 'body_text']),
            attachments.size + files.length
        )
        if (notification) {
            this.props.notify({
                status: notification.status,
                message: notification.message
            })
            return false
        }

        // check total attachments size.
        const currentSize = this._getFilesSize(files)
        const maxSize = getMaxAttachmentSize(this._getEditorState(), attachments.toJS())
        if (currentSize >= maxSize) {
            this.props.notify({
                status: 'error',
                message: getFileTooLargeError(maxSize)
            })
            return false
        }

        return true
    }

    _handleFiles = (files: filesType, validationRegex:? validationRegexType = null) => {
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

    _getFilesSize = (files: Array<attachmentType>) => {
        return files.reduce((sum, file) => sum + (file.size || 0), 0)
    }

    _getButtons = (): Node[] => {
        const {newMessage} = this.props

        const attachmentLoading = newMessage.getIn(['_internal', 'loading', 'addAttachment'])

        return [
            <div
                className="attachment"
                key="attachments"
            >
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
                                    attach_file
                                </i>
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
                />
            </div>
        ]
    }

    render() {
        const {newMessage, newMessageType, agents, richAreaRef, notify, attachments} = this.props

        const isNewMessageRichType = isRichType(newMessageType)
        const canAddMention = canLeaveInternalNote(newMessageType)

        const mentionProps = {
            canAddMention,
            mentionSuggestions: agents
        }

        let displayedActions

        if (!isNewMessageRichType) {
            displayedActions = ['EMOJI']
        }

        const canInsertInlineImages = (newMessageType === 'email')

        let predictionProps = {
            predictionContext: this.props.predictionContext
        }

        return (
            <div className={css.component}>
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
                    attachFiles={(files) => this._handleFiles(files)}
                    tabIndex="4"
                    readOnly={newMessage.getIn(['_internal', 'loading', 'submitMessage'])}
                    {...mentionProps}
                    placeholder="Click here to reply, or press r."
                    notify={notify}
                    canInsertInlineImages={canInsertInlineImages}
                    attachments={attachments}
                    buttons={this._getButtons()}
                    displayedActions={displayedActions}
                    canDropFiles
                    signature
                    spellCheck
                    {...predictionProps}
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
        predictionContext: getContext(state),
    }
}

const mapDispatchToProps = {
    addAttachments: newMessageActions.addAttachments,
    notify,
    setResponseText: newMessageActions.setResponseText,
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketReplyEditor)
