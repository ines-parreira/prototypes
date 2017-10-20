import React, {PropTypes} from 'react'
import classnames from 'classnames'
import _forEach from 'lodash/forEach'

import css from './Toolbar.less'

class Toolbar extends React.Component {
    static propTypes = {
        actions: PropTypes.array.isRequired,
        buttons: PropTypes.array.isRequired,
        hideActions: PropTypes.bool.isRequired,
        displayedActions: PropTypes.array, // array of keys of actions that we want to display
        store: PropTypes.object.isRequired,
    }

    static defaultProps = {
        actions: [],
        buttons: [],
        hideActions: false,
    }

    _preventDefault = (event) => {
        event.preventDefault()
    }

    _renderAction = (action) => {
        const {store} = this.props

        const getEditorState = store.getItem('getEditorState')

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
                return func(store.getItem('getEditorState'), store.getItem('setEditorState'), ...other)
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
                className={classnames(css.button, {
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
            >
                <i
                    className={classnames('fa fa-fw', action.icon)}
                    title={action.name}
                />
            </div>
        )
    }

    _renderButton = (button, index) => {
        return (
            <div
                key={index}
                className={css.button}
            >
                {button}
            </div>
        )
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
            <div className={classnames('editor-toolbar', css.page)}>
                <div className={css.actions}>
                    {filteredActions.map(this._renderAction)}
                </div>
                {buttons.map(this._renderButton)}
            </div>
        )
    }
}

export default Toolbar
