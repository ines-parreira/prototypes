import {EditorState, Modifier} from 'draft-js'
import React, {Component, KeyboardEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import ReactPlayer from 'react-player'

import {getLDClient} from 'utils/launchDarkly'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'

import {FeatureFlagKey} from 'config/featureFlags'
import {RootState} from 'state/types'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {canAddVideoPlayer} from 'utils'

import Button from 'pages/common/components/button/Button'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import {addVideo, linkifyWithTemplate, removeLink} from '../../utils'
import {
    focusToTheEndOfContent,
    getEntitySelectionState,
    getSelectedEntityKey,
    getSelectedText,
    linkify,
} from '../../../../../../utils/editor'
import {ActionInjectedProps} from '../types'
import {
    linkEditionEnded,
    linkEditionStarted,
} from '../../../../../../state/ui/editor/actions'
import {
    getNewMessageChannel,
    isNewMessagePublic,
} from '../../../../../../state/newMessage/selectors'

import css from './AddLink.less'
import Popover from './ButtonPopover'

type Props = {
    entityKey?: string
    url: string
    onUrlChange: (url: string) => void
    text: string
    onTextChange: (text: string) => void
    isOpen: boolean
    onOpen: () => void
    onClose: () => void
} & ActionInjectedProps &
    ConnectedProps<typeof connector>

export class AddLinkContainer extends Component<Props> {
    chatVideoSharingExtraLDFlag: boolean | undefined = getLDClient().allFlags()[
        FeatureFlagKey.ChatVideoSharingExtra
    ] as boolean | undefined

    componentDidUpdate(prevProps: Props) {
        const {isOpen, linkEditionEnded, linkEditionStarted} = this.props

        if (!prevProps.isOpen && isOpen) {
            linkEditionStarted()
        } else if (prevProps.isOpen && !isOpen) {
            linkEditionEnded()
        }
    }

    _isValid = (): boolean =>
        !!(
            this.props.text.trim() &&
            this.props.url.trim() &&
            linkify.test(this.props.url)
        )

    _getSelectedLinkEntityKey = (): Maybe<string> => {
        const editorState = this.props.getEditorState()
        const contentState = editorState.getCurrentContent()
        const selection = editorState.getSelection()
        const entityKey = getSelectedEntityKey(contentState, selection)

        if (
            !entityKey ||
            contentState.getEntity(entityKey).getType() !== 'link'
        ) {
            return
        }

        return entityKey
    }

    _onPopoverOpen = () => {
        const editorState = this.props.getEditorState()
        const contentState = editorState.getCurrentContent()
        const selection = editorState.getSelection()
        const entityKey = this._getSelectedLinkEntityKey()

        if (entityKey) {
            // if already a link, remove it
            this.props.setEditorState(removeLink(entityKey, editorState))
            return
        }

        this.props.onTextChange(getSelectedText(contentState, selection))
        this.props.onOpen()
    }

    _onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            this._submit()
        }

        if (e.key === 'Escape') {
            e.preventDefault()
            this.props.onClose()
        }
    }

    _submit = () => {
        if (!this._isValid()) {
            return
        }
        const newEditorState: EditorState | null = this.props.entityKey
            ? this._updateLink()
            : this._insertLink()

        if (
            this.chatVideoSharingExtraLDFlag &&
            newEditorState &&
            // Do not append a video if we are in `Update Link` mode.
            !this.props.entityKey
        ) {
            this._insertExtraVideoIfApplicable(newEditorState)
        }

        this.props.onClose()
    }

    _updateLink = (): EditorState | null => {
        let editorState = this.props.getEditorState()
        let contentState = editorState.getCurrentContent()
        const {url, text, entityKey} = this.props

        if (!entityKey) {
            return null
        }

        // Use linkify to add protocol to the url
        const parsedUrl = linkifyWithTemplate(url)

        // Update url
        contentState = contentState.replaceEntityData(entityKey, {
            url: parsedUrl,
        })
        editorState = EditorState.push(
            editorState,
            contentState,
            'apply-entity'
        )

        // Update text
        const selection = getEntitySelectionState(contentState, entityKey)
        if (selection) {
            contentState = Modifier.replaceText(
                contentState,
                selection,
                text,
                undefined,
                entityKey
            )
            editorState = EditorState.push(
                editorState,
                contentState,
                'change-block-data'
            )
        }

        // Force selection workaround to trigger re-render of decorators
        // https://github.com/facebook/draft-js/issues/1047
        this.props.setEditorState(
            EditorState.forceSelection(editorState, editorState.getSelection())
        )

        return editorState
    }

    _insertLink = (): EditorState | null => {
        const {url, text} = this.props
        // Use linkify to add protocol to the url
        const parsedUrl = linkifyWithTemplate(url)

        let editorState = this.props.getEditorState()
        const selection = editorState.getSelection()

        let contentState = editorState
            .getCurrentContent()
            .createEntity('link', 'MUTABLE', {url: parsedUrl})
        const entityKey = contentState.getLastCreatedEntityKey()

        contentState = Modifier.replaceText(
            contentState,
            selection,
            text,
            undefined,
            entityKey
        )
        editorState = EditorState.push(
            editorState,
            contentState,
            'apply-entity'
        )
        editorState = EditorState.forceSelection(
            editorState,
            editorState.getSelection()
        ) // Focus the editor

        this.props.setEditorState(editorState)

        return editorState
    }

    _insertExtraVideoIfApplicable = (editorState: EditorState) => {
        const {
            url,
            newMessageChannel,
            isNewMessagePublic,
            currentAccount,
            ticket,
            setEditorState,
        } = this.props

        if (
            !canAddVideoPlayer(newMessageChannel, isNewMessagePublic) ||
            !ReactPlayer.canPlay(url)
        ) {
            return
        }

        let newEditorState = focusToTheEndOfContent(editorState)
        newEditorState = addVideo(newEditorState, url)

        newEditorState = EditorState.forceSelection(
            newEditorState,
            newEditorState.getSelection()
        )
        setEditorState(newEditorState)

        logEvent(SegmentEvent.InsertVideoAddedFromInsertLink, {
            account_id: currentAccount?.get('domain'),
            channel: newMessageChannel,
            ticket: ticket?.get('id') || 'new',
        })
    }

    render() {
        return (
            <Popover
                icon="link"
                id="insert_link"
                name="Insert link"
                isActive={!!this._getSelectedLinkEntityKey()}
                isOpen={this.props.isOpen}
                onOpen={this._onPopoverOpen}
                onClose={this.props.onClose}
            >
                <div className={css.wrapper} onKeyDown={this._onKeyDown}>
                    <DEPRECATED_InputField
                        className={css.field}
                        label="Link text"
                        placeholder="Ex. Help Center Article"
                        onChange={this.props.onTextChange}
                        value={this.props.text}
                        autoFocus={!this.props.text}
                    />
                    <DEPRECATED_InputField
                        className={css.field}
                        label="URL"
                        placeholder="https://help.domain.com/article"
                        onChange={this.props.onUrlChange}
                        value={this.props.url}
                        autoFocus={!!this.props.text}
                    />
                    <Button
                        isDisabled={!this._isValid()}
                        onClick={this._submit}
                    >
                        {this.props.entityKey ? 'Update Link' : 'Insert Link'}
                    </Button>
                </div>
            </Popover>
        )
    }
}

const connector = connect((state: RootState) => ({
    linkEditionStarted,
    linkEditionEnded,
    currentAccount: getCurrentAccountState(state),
    ticket: state.ticket,
    newMessageChannel: getNewMessageChannel(state),
    isNewMessagePublic: isNewMessagePublic(state),
}))

export default connector(AddLinkContainer)
