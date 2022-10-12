import classnames from 'classnames'
import React, {Component, ReactNode} from 'react'
import {ContentState, EditorState} from 'draft-js'
import {fromJS, Map, List} from 'immutable'
import _debounce from 'lodash/debounce'
import _noop from 'lodash/noop'
import {connect, ConnectedProps} from 'react-redux'

import {withLDConsumer} from 'launchdarkly-react-client-sdk'
import {LDFlagSet} from 'launchdarkly-js-client-sdk'
import Tooltip from 'pages/common/components/Tooltip'
import {FeatureFlagKey} from 'config/featureFlags'
import {RootState} from '../../../../../state/types'
import {canLeaveInternalNote, isRichType} from '../../../../../config/ticket'
import {humanize} from '../../../../../business/format'
import {getOtherAgents} from '../../../../../state/agents/selectors'
import {
    addAttachments,
    setResponseText,
} from '../../../../../state/newMessage/actions'
import {
    getNewMessageType,
    getNewMessageAttachments,
    isNewMessagePublic,
} from '../../../../../state/newMessage/selectors'
import {notify} from '../../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../../state/notifications/types'
import {
    getFileTooLargeError,
    getMaxAttachmentSize,
} from '../../../../../utils/file'
import DEPRECATED_RichField from '../../../../common/forms/RichField/DEPRECATED_RichField'
import {getContext} from '../../../../../state/prediction/selectors'
import {canAddAttachments} from '../../../../../business/ticket'
import {TicketMessageSourceType} from '../../../../../business/types/ticket'

import {ActionName} from '../../../../common/draftjs/plugins/toolbar/types'

import MacrosQuickReply from './MacrosQuickReply/MacrosQuickReply'

import css from './TicketReplyEditor.less'

type Props = {
    replyAreaFooter?: ReactNode
    applyMacro: (macro: Map<any, any>) => void
    macros: List<any>
    richAreaRef: (ref: DEPRECATED_RichField | null) => void
    shouldDisplayQuickReply: boolean
    ticket: Map<any, any>
    flags?: LDFlagSet
} & ConnectedProps<typeof connector>

// debounce the updating of the redux because it's slow otherwise when we type
export const updateMessageText = _debounce(
    ({newMessage, setResponseText}: Props, editorState: EditorState) => {
        if (!newMessage.getIn(['state', 'cacheAdded'])) {
            return
        }

        setResponseText(
            Map({
                contentState: editorState.getCurrentContent(),
                selectionState: editorState.getSelection(),
                forceUpdate: false,
                forceFocus: false,
            })
        )
    },
    100
)

type validationRegexType = string | RegExp

type State = {
    editorState: EditorState
}

export class TicketReplyEditorContainer extends Component<Props, State> {
    richArea: Maybe<DEPRECATED_RichField>

    static defaultProps: Pick<Props, 'richAreaRef' | 'attachments'> = {
        richAreaRef: _noop,
        attachments: fromJS([]),
    }

    componentWillMount() {
        // set the initial state of the editor - there might be drafts
        const editorState = this.getEditorStateFromReducer(this.props)
        editorState && this.updateEditorState(editorState)
    }

    componentWillUnmount() {
        // prevent updating the newMessage state value with an old value.
        // without it on unmount the newMessage state is populated with the old editor value,
        // because of the debouncer.
        updateMessageText.cancel()
    }

    componentWillReceiveProps(nextProps: Props) {
        // only update if forceUpdate is true and it changed
        const prevForceUpdate = this.props.newMessage.getIn([
            'state',
            'forceUpdate',
        ])
        const nextForceUpdate = nextProps.newMessage.getIn([
            'state',
            'forceUpdate',
        ])
        const shouldUpdate =
            nextForceUpdate && prevForceUpdate !== nextForceUpdate

        if (shouldUpdate) {
            const editorState = this.getEditorStateFromReducer(nextProps)
            editorState && this.updateEditorState(editorState)
        }
    }

    getEditorStateFromReducer = (props: Props) => {
        const state = props.newMessage.get('state') as EditorState
        const contentState = state.get('contentState') as ContentState

        let editorState = this.getEditorState()

        if (!editorState) {
            return editorState
        }

        if (contentState && contentState.hasText()) {
            editorState = EditorState.push(
                editorState,
                contentState,
                'insert-characters'
            )
        } else {
            // empty editor state (triggered after message is sent, textarea needs to be emptied)
            editorState = EditorState.push(
                editorState,
                ContentState.createFromText(''),
                'insert-characters'
            )
        }

        return editorState
    }

    canAddAttachments = (fileList: File[] | FileList) => {
        // FileList does not have map
        const files = Array.from(fileList)
        const {attachments, newMessage, newMessageType} = this.props

        const notification = canAddAttachments(
            newMessageType,
            newMessage.getIn(['newMessage', 'body_text']),
            attachments.size + files.length
        )
        if (notification) {
            void this.props.notify({
                status: notification.status,
                message: notification.message,
            })
            return false
        }

        // Twitter only allows either a single GIF or a maximum of 4 pictures
        if (newMessageType === TicketMessageSourceType.TwitterTweet) {
            // Filter the newly added files to be uploaded
            const gifFiles = files.filter(
                (file) => file.type && file.type === 'image/gif'
            )

            // Filter the existing, already uploaded files
            const gifAttachments = attachments.filter(
                (attachment: Map<any, any>) =>
                    attachment.get('content_type') === 'image/gif'
            )

            if (
                gifAttachments.size + gifFiles.length > 0 &&
                attachments.size + files.length > 1
            ) {
                void this.props.notify({
                    type: NotificationStatus.Error,
                    status: NotificationStatus.Warning,
                    message: `When answering to ${humanize(
                        newMessageType
                    )} messages, you can only attach a single GIF or a maximum of 4 pictures.`,
                })
                return false
            }
        }

        // check total attachments size.
        const currentSize = this.getFilesSize(files)
        const maxSize = getMaxAttachmentSize(
            this.getEditorState(),
            attachments.toJS()
        )
        if (currentSize >= maxSize) {
            void this.props.notify({
                status: NotificationStatus.Error,
                message: getFileTooLargeError(maxSize),
            })
            return false
        }

        return true
    }

    handleFiles = (
        files: File[] | FileList,
        validationRegex?: validationRegexType
    ) => {
        const {newMessageType} = this.props
        if (!this.canAddAttachments(files)) {
            return
        }

        const regex = validationRegex && new RegExp(validationRegex)
        let cancel = false

        Array.from(files).forEach((file) => {
            if (regex && !regex.exec(file.type) && !cancel) {
                void this.props.notify({
                    type: NotificationStatus.Error,
                    status: NotificationStatus.Warning,
                    message: `When answering to ${humanize(
                        newMessageType
                    )} messages, the only attachments allowed are ${' '}
                    images (except svg).`,
                })
                cancel = true
            }

            if (file.type.endsWith('svg+xml')) {
                void this.props.notify({
                    type: NotificationStatus.Error,
                    status: NotificationStatus.Warning,
                    message: 'Uploading SVGs is not allowed.',
                })
                cancel = true
            }
        })

        if (cancel) {
            return
        }

        this.props.addAttachments(this.props.ticket, files)
    }

    getEditorState = () => {
        if (!this.richArea) {
            return
        }

        return this.richArea.state.editorState
    }

    updateEditorState = (editorState: EditorState) => {
        if (!this.richArea) {
            return
        }
        this.richArea.setEditorState(editorState)
    }

    onEditorChange = (editorState: EditorState) => {
        // update the reducer when the editor state is changed
        updateMessageText(this.props, editorState)
    }

    getFilesSize = (files: File[] | FileList) => {
        return Array.from(files).reduce(
            (sum, file) => sum + (file.size || 0),
            0
        )
    }

    getButtons = () => {
        const {attachments, newMessage, newMessageType} = this.props
        let attachmentsMask: string

        if (
            canAddAttachments(
                newMessageType,
                newMessage.getIn(['newMessage', 'body_text']),
                attachments.size + 1
            ) != null
        ) {
            return []
        }
        const attachmentLoading = newMessage.getIn([
            '_internal',
            'loading',
            'addAttachment',
        ])

        if (newMessageType === TicketMessageSourceType.TwitterTweet) {
            attachmentsMask = 'image/*'
        }

        if (newMessageType === TicketMessageSourceType.Sms) {
            attachmentsMask = 'image/*'
        }

        return [
            <div className="attachment" key="attachments">
                <label
                    htmlFor="attachments-input"
                    className="m-0"
                    id="attachment"
                >
                    {attachmentLoading ? (
                        <i className="icon material-icons md-spin">refresh</i>
                    ) : (
                        <i className="material-icons">attach_file</i>
                    )}
                </label>
                <Tooltip
                    autohide={false}
                    delay={100}
                    target="attachment"
                    placement="bottom"
                >
                    Add attachment
                </Tooltip>
                <input
                    id="attachments-input"
                    type="file"
                    multiple
                    onChange={(event) => {
                        event.target.files &&
                            this.handleFiles(
                                event.target.files,
                                attachmentsMask
                            )
                    }}
                    onClick={(event) => {
                        // empty input on click
                        return ((event.target as HTMLInputElement).value = '')
                    }}
                />
            </div>,
        ]
    }

    _isLDFlagActivated = (flag: string) => {
        if (this.props.flags && Object.keys(this.props.flags).includes(flag)) {
            return Boolean(this.props.flags[flag])
        }
        return false
    }

    render() {
        const {
            isNewMessagePublic,
            newMessage,
            newMessageType,
            agents,
            richAreaRef,
            notify,
            attachments,
            macros,
            applyMacro,
            shouldDisplayQuickReply,
            replyAreaFooter,
        } = this.props

        const isNewMessageRichType = isRichType(newMessageType)
        const isNewMessageFacebookMessengerType =
            newMessageType === TicketMessageSourceType.FacebookMessenger
        const isNewMessageSmsType =
            newMessageType === TicketMessageSourceType.Sms
        const canAddMention = canLeaveInternalNote(newMessageType)
        let attachmentsMask: string

        const mentionProps = {
            canAddMention,
            mentionSuggestions: agents,
        }

        let displayedActions = [
            ActionName.Bold,
            ActionName.Italic,
            ActionName.Underline,
            ActionName.Link,
            ActionName.Image,
            ActionName.Emoji,
            ActionName.ProductPicker,
        ]

        if (!isNewMessageRichType) {
            displayedActions = [ActionName.Emoji, ActionName.ProductPicker]
        }

        if (this._isLDFlagActivated(FeatureFlagKey.RevenueDiscountCodesV0)) {
            displayedActions.push(ActionName.DiscountCodePicker)
        }

        if (isNewMessageFacebookMessengerType) {
            displayedActions.push(ActionName.Image)
        }

        if (isNewMessageSmsType) {
            displayedActions = [ActionName.Emoji]
        }

        const canInsertInlineImages =
            newMessageType === 'email' || isNewMessageFacebookMessengerType

        const predictionProps = {
            predictionContext: this.props.predictionContext,
        }

        if (newMessageType === TicketMessageSourceType.TwitterTweet) {
            attachmentsMask = 'image/*'
        }

        if (newMessageType === TicketMessageSourceType.Sms) {
            attachmentsMask = 'image/*'
        }

        return (
            <div className={css.component}>
                <DEPRECATED_RichField
                    className={classnames(css.richField, {
                        [css.isInternal]: !isNewMessagePublic,
                    })}
                    footer={replyAreaFooter}
                    ref={(richArea) => {
                        this.richArea = richArea
                        richAreaRef(richArea)
                    }}
                    defaultContentState={newMessage.getIn([
                        'state',
                        'contentState',
                    ])}
                    value={{
                        html: newMessage.getIn(['newMessage', 'body_html']),
                        text: newMessage.getIn(['newMessage', 'body_text']),
                    }}
                    onChange={this.onEditorChange}
                    attachFiles={(files: File[] | FileList) =>
                        this.handleFiles(files, attachmentsMask)
                    }
                    tabIndex={4}
                    readOnly={newMessage.getIn([
                        '_internal',
                        'loading',
                        'submitMessage',
                    ])}
                    {...mentionProps}
                    placeholder="Click here to reply, or press r."
                    notify={notify}
                    canInsertInlineImages={canInsertInlineImages}
                    attachments={attachments}
                    buttons={this.getButtons()}
                    displayedActions={displayedActions}
                    quickReply={
                        shouldDisplayQuickReply ? (
                            <MacrosQuickReply
                                applyMacro={applyMacro}
                                macros={macros.slice(0, 3) as Map<any, any>}
                            />
                        ) : undefined
                    }
                    canDropFiles
                    emailExtraEnabled
                    spellCheck
                    {...predictionProps}
                />
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        agents: getOtherAgents(state),
        attachments: getNewMessageAttachments(state),
        isNewMessagePublic: isNewMessagePublic(state),
        newMessage: state.newMessage,
        newMessageType: getNewMessageType(state),
        predictionContext: getContext(state),
    }),
    {
        addAttachments,
        notify,
        setResponseText,
    }
)

export default connector(withLDConsumer()(TicketReplyEditorContainer))
