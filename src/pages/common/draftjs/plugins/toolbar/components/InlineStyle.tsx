import React, {Component} from 'react'
import {RichUtils} from 'draft-js'

import {ActionInjectedProps} from '../types'

import Button from './Button'

type Props = {
    name: string
    icon: string
    style: string
    id: string
} & ActionInjectedProps

export default class InlineStyle extends Component<Props> {
    _isActive = () => {
        const editorState = this.props.getEditorState()
        const contentState = editorState.getCurrentContent()

        if (!contentState.hasText()) {
            return false
        }

        const currentStyle = editorState.getCurrentInlineStyle()
        return currentStyle.has(this.props.style)
    }

    _onToggle = () => {
        const editorState = this.props.getEditorState()
        this.props.setEditorState(
            RichUtils.toggleInlineStyle(editorState, this.props.style)
        )
    }

    render() {
        return (
            <Button
                name={this.props.name}
                icon={this.props.icon}
                id={this.props.id}
                isActive={this._isActive()}
                isDisabled={false}
                onToggle={this._onToggle}
            />
        )
    }
}
