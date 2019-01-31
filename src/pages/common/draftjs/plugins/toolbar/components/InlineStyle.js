//@flow
import * as React from 'react'
import Button from './Button'
import type { ActionInjectedProps } from '../types'
import { RichUtils } from 'draft-js'

type Props = {
    name: string,
    icon: string,
    style: string
} & ActionInjectedProps

export default class InlineStyle extends React.Component<Props> {
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
        this.props.setEditorState(RichUtils.toggleInlineStyle(
            editorState,
            this.props.style
        ))
    }

    render() {
        return (
            <Button
                name={this.props.name}
                icon={this.props.icon}
                isActive={this._isActive()}
                isDisabled={false}
                onToggle={this._onToggle}
            />
        )
    }
}
