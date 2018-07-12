// @flow
import React from 'react'
import classnames from 'classnames'
import _forEach from 'lodash/forEach'

import css from './Toolbar.less'

import type {EditorState} from 'draft-js'
import type {ComponentType, Node} from 'react'

type actionType = {
    isActive: (T: () => EditorState) => boolean,
    isDisabled: (T: () => EditorState) => boolean,
    component: ComponentType<*>,
    key: string,
    name: string,
    icon: string,
    functions: Array<*>,
}

type State = {
    isHovered: boolean,
}

type Props = {
    actions: Array<actionType>,
    buttons: Array<?Node>,
    hideActions: boolean,
    toolbarStore: {
        getItem: (T: string) => any,
        setItem: (T: string, U: any) => void,
    },
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

    _renderAction = (action: actionType) => {
        const {toolbarStore} = this.props

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

        // pass getter and setter of editorState to functions
        const functions = {}
        _forEach(action.functions, (func, name) => {
            functions[name] = (...other) => {
                return func(toolbarStore.getItem('getEditorState'), toolbarStore.getItem('setEditorState'), ...other)
            }
        })

        if (action.component) {
            return (
                <action.component
                    key={action.key}
                    action={action}
                    functions={functions}
                    isActive={isActive}
                    isDisabled={isDisabled}
                />
            )
        }

        return (
            <div
                key={action.key}
                className={classnames(css.button, 'btn btn-secondary btn-transparent', {
                    [css.active]: action.isActive(getEditorState),
                    [css.disabled]: isDisabled,
                })}
                onClick={(e) => {
                    this._preventDefault(e)

                    if (!isDisabled) {
                        functions.toggle()
                    }
                }}
                onMouseDown={this._preventDefault}
                title={action.name}
            >
                <i className="material-icons">
                    {action.icon}
                </i>
            </div>
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
        const {getCanDropFiles, attachFiles} = this.props
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
        const {getCanDropFiles} = this.props
        if (!getCanDropFiles()) {
            return
        }

        e.preventDefault()
        this.setState({isHovered: true})
    }

    _hideDragHover = () => {
        this.setState({isHovered: false})
    }

    render() {
        const {actions, buttons, hideActions, displayedActions} = this.props

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
