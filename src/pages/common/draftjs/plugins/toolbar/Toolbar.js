// @flow
import classnames from 'classnames'
import React, {type Node} from 'react'

import css from './Toolbar.less'
import type {ActionName, ActionInjectedProps} from './types'
import {AddEmoji, Bold, Italic, Underline} from './components'

type State = {
    isHovered: boolean,
}

type Props = {
    buttons: Node[],
    attachFiles: (T: Array<Blob>) => void,
    canDropFiles: boolean,
    displayedActions?: ActionName[],
    linkAction: Node,
    imageAction: Node,
} & ActionInjectedProps

export default class Toolbar extends React.Component<Props, State> {
    static defaultProps = {
        buttons: [],
    }

    static isDisplayedAction = (
        name: ActionName,
        displayedActions: ?(ActionName[])
    ) => {
        if (!displayedActions) {
            return true
        }

        return displayedActions.indexOf(name) !== -1
    }

    state: State = {
        isHovered: false,
    }

    _renderButton = (button: ?Node, index: number) => {
        return (
            <div
                key={index}
                className={classnames(
                    css.button,
                    'btn btn-secondary btn-transparent'
                )}
            >
                {button}
            </div>
        )
    }

    _onDrop = (e: DragEvent) => {
        const {canDropFiles, attachFiles} = this.props
        if (!canDropFiles) {
            return
        }

        e.preventDefault()
        const eventFiles = (e.dataTransfer && e.dataTransfer.files) || []
        const files = Array.from(eventFiles)
        attachFiles(files)
        this._hideDragHover()
    }

    _onDragOver = (e: Event) => {
        const {canDropFiles} = this.props
        if (!canDropFiles) {
            return
        }

        e.preventDefault()
        this.setState({isHovered: true})
    }

    _hideDragHover = () => {
        this.setState({isHovered: false})
    }

    _isDisplayedAction = (name: ActionName): boolean =>
        Toolbar.isDisplayedAction(name, this.props.displayedActions)

    render() {
        const {buttons, getEditorState, setEditorState} = this.props
        const actionsProps = {getEditorState, setEditorState}

        return (
            <div
                className={classnames('editor-toolbar', css.page, {
                    [css.isHovered]: this.state.isHovered,
                })}
                onDrop={this._onDrop}
                onDragOver={this._onDragOver}
                onDragLeave={this._hideDragHover}
            >
                <div className={css.actions}>
                    {this._isDisplayedAction('BOLD') && (
                        <Bold {...actionsProps} />
                    )}
                    {this._isDisplayedAction('ITALIC') && (
                        <Italic {...actionsProps} />
                    )}
                    {this._isDisplayedAction('UNDERLINE') && (
                        <Underline {...actionsProps} />
                    )}
                    {this._isDisplayedAction('LINK') && this.props.linkAction}
                    {this._isDisplayedAction('IMAGE') && this.props.imageAction}
                    {this._isDisplayedAction('EMOJI') && (
                        <AddEmoji {...actionsProps} />
                    )}
                </div>

                {buttons.map(this._renderButton)}

                <div className={css.hoverOverlay}>Add files as attachments</div>
            </div>
        )
    }
}
