// @flow
import classnames from 'classnames'
import _mapValues from 'lodash/mapValues'
import React, { type Node } from 'react'
import css from './Toolbar.less'
import type { ToolbarAction, ActionComponentPropCreator, EditorStateSetter, EditorStateGetter } from './types'
import DefaultAction from './components/Default'
import type { Store } from './createStore'

type State = {
    isHovered: boolean,
}

type Props = {
    actions: ToolbarAction[],
    buttons: Array<?Node>,
    hideActions: boolean,
    toolbarStore: Store,
    attachFiles: (T: Array<Blob>) => void,
    displayedActions?: Array<*>, // array of keys of actions that we want to display
    getCanDropFiles: () => boolean,
}


class Toolbar extends React.Component<Props, State> {
    static defaultProps = {
        actions: [],
        buttons: [],
        hideActions: false,
    }

    state = {
        isHovered: false,
    }

    _preventDefault = (event: Event) => {
        event.preventDefault()
    }

    _getActionInjectedProp = (action: ToolbarAction, propCreator: ActionComponentPropCreator) => {
        const { toolbarStore } = this.props
        const getEditorState: EditorStateGetter = toolbarStore.getItem('getEditorState')
        const setEditorState: EditorStateSetter = toolbarStore.getItem('setEditorState')
        const editorState = getEditorState()
        const block = editorState
            .getCurrentContent()
            .getBlockForKey(editorState.getSelection().getStartKey())
        return propCreator(block, action, editorState, setEditorState)
    }

    _renderAction = (action: ToolbarAction) => {
        const { toolbarStore } = this.props

        const getEditorState = toolbarStore.getItem('getEditorState')

        // sometimes the editor state is not present - so we're augmenting the exception here.
        let isActive = false
        try {
            isActive = action.isActive(getEditorState)
        } catch (e) {
            if (window.Raven) {
                window.Raven.captureException(e, {
                    editorState: getEditorState()
                })
            } else {
                throw e
            }
        }

        const isDisabled = action.isDisabled(getEditorState)
        const injectedProps = _mapValues(action.componentFunctions, (pc) => this._getActionInjectedProp(action, pc))
        const ActionComponent = action.component || DefaultAction
        return (
            <ActionComponent
                key={action.key}
                name={action.name}
                isActive={isActive}
                isDisabled={isDisabled}
                icon={action.icon}
                {...injectedProps}
            />
        )
    }

    _renderButton = (button: ?Node, index: number) => {
        return (
            <div
                key={index}
                className={classnames(css.button, 'btn btn-secondary btn-transparent')}
            >
                {button}
            </div>
        )
    }

    _onDrop = (e: DragEvent) => {
        const { getCanDropFiles, attachFiles } = this.props
        if (!getCanDropFiles()) {
            return
        }

        e.preventDefault()
        const eventFiles = e.dataTransfer && e.dataTransfer.files || []
        const files = Array.from(eventFiles)
        attachFiles(files)
        this._hideDragHover()
    }

    _onDragOver = (e: Event) => {
        const { getCanDropFiles } = this.props
        if (!getCanDropFiles()) {
            return
        }

        e.preventDefault()
        this.setState({ isHovered: true })
    }

    _hideDragHover = () => {
        this.setState({ isHovered: false })
    }

    render() {
        const { actions, buttons, hideActions, displayedActions } = this.props

        let filteredActions = actions

        if (hideActions) {
            filteredActions = []
        }

        if (displayedActions) {
            filteredActions = filteredActions.filter((action) => displayedActions.includes(action.key))
        }

        return (
            <div
                className={classnames('editor-toolbar', css.page, {
                    [css.isHovered]: this.state.isHovered
                })}
                onDrop={this._onDrop}
                onDragOver={this._onDragOver}
                onDragLeave={this._hideDragHover}
            >
                <div className={css.actions}>
                    {filteredActions.map(this._renderAction)}
                </div>
                {buttons.map(this._renderButton)}

                <div className={css.hoverOverlay}>
                    Add files as attachments
                </div>
            </div>
        )
    }
}

export default Toolbar
