import {EditorState, Modifier} from 'draft-js'
import React, {Component, KeyboardEvent} from 'react'
import {Button} from 'reactstrap'
import {connect, ConnectedProps} from 'react-redux'

import InputField from 'pages/common/forms/InputField'
import {removeLink} from '../../utils'
import {
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
        if (this.props.entityKey) {
            this._updateLink()
        } else {
            this._insertLink()
        }
        this.props.onClose()
    }

    _updateLink = () => {
        let editorState = this.props.getEditorState()
        let contentState = editorState.getCurrentContent()
        const {url, text, entityKey} = this.props
        // Use linkify to add protocol to the url
        const parsedUrl = linkify.match(url)?.[0]?.url || url

        if (!entityKey) {
            return
        }

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
    }

    _insertLink = () => {
        const {url, text} = this.props
        // Use linkify to add protocol to the url
        const parsedUrl = linkify.match(url)?.[0]?.url || url

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
    }

    render() {
        return (
            <Popover
                icon="link"
                name="Insert link"
                isActive={!!this._getSelectedLinkEntityKey()}
                isOpen={this.props.isOpen}
                onOpen={this._onPopoverOpen}
                onClose={this.props.onClose}
            >
                <div className={css.wrapper} onKeyDown={this._onKeyDown}>
                    <InputField
                        className={css.field}
                        label="Link text"
                        placeholder="Ex. Help Center Article"
                        onChange={this.props.onTextChange}
                        value={this.props.text}
                        autoFocus={!this.props.text}
                    />
                    <InputField
                        className={css.field}
                        label="URL"
                        placeholder="https://help.domain.com/article"
                        onChange={this.props.onUrlChange}
                        value={this.props.url}
                        autoFocus={!!this.props.text}
                    />
                    <Button
                        color="primary"
                        disabled={!this._isValid()}
                        onClick={this._submit}
                    >
                        {this.props.entityKey ? 'Update Link' : 'Insert Link'}
                    </Button>
                </div>
            </Popover>
        )
    }
}

const connector = connect(null, {
    linkEditionStarted,
    linkEditionEnded,
})

export default connector(AddLinkContainer)
