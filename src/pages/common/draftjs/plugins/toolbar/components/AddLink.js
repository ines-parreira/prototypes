//@flow
import {EditorState, Modifier} from 'draft-js'
import React from 'react'
import {Button} from 'reactstrap'
import InputField from '../../../../forms/InputField'
import {removeLink} from '../../utils'
import {getEntitySelectionState, getSelectedEntityKey, getSelectedText, linkify} from '../../../../../../utils/editor'
import css from './AddLink.less'
import Popover from './ButtonPopover'
import type {ActionInjectedProps} from '../types'

type Props = {
    entityKey?: string,
    url: string,
    onUrlChange: string => void,
    text: string,
    onTextChange: string => void,
    isOpen: boolean,
    onOpen: () => void,
    onClose: () => void
} & ActionInjectedProps

export default class AddLink extends React.Component<Props> {
    _isValid = (): boolean => !!(this.props.text.trim() && this.props.url.trim() && linkify.test(this.props.url))

    _getSelectedLinkEntityKey = (): ?string => {
        const editorState = this.props.getEditorState()
        const contentState = editorState.getCurrentContent()
        const selection = editorState.getSelection()
        const entityKey = getSelectedEntityKey(contentState, selection)

        if (!entityKey || contentState.getEntity(entityKey).getType() !== 'link') {
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

    _onKeyDown = (e: SyntheticKeyboardEvent<HTMLInputElement>) => {
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
        let { url, text, entityKey } = this.props
        let editorState = this.props.getEditorState()
        let contentState = editorState.getCurrentContent()

        if (!entityKey) {
            return
        }

        // Update url
        contentState = contentState.replaceEntityData(entityKey, { url })
        editorState = EditorState.push(editorState, contentState, 'apply-entity')

        // Update text
        const selection = getEntitySelectionState(contentState, entityKey)
        if (selection) {
            contentState = Modifier.replaceText(contentState, selection, text, undefined, entityKey)
            editorState = EditorState.push(editorState, contentState, 'change-block-data')
        }

        // Force selection workaround to trigger re-render of decorators
        // https://github.com/facebook/draft-js/issues/1047
        this.props.setEditorState(EditorState.forceSelection(editorState, editorState.getSelection()))
    }

    _insertLink = () => {
        let { url, text } = this.props

        let editorState = this.props.getEditorState()
        const selection = editorState.getSelection()

        let contentState = editorState.getCurrentContent().createEntity(
            'link',
            'MUTABLE',
            { url }
        )
        const entityKey = contentState.getLastCreatedEntityKey()

        contentState = Modifier.replaceText(contentState, selection, text, undefined, entityKey)
        editorState = EditorState.push(editorState, contentState, 'apply-entity')
        editorState = EditorState.forceSelection(editorState, editorState.getSelection()) // Focus the editor

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
                <div
                    className={css.wrapper}
                    onKeyDown={this._onKeyDown}
                >
                    <InputField
                        className={css.field}
                        label="Link text"
                        placeholder="Ex. Helpcenter Article"
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
                        autoFocus={this.props.text}
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
