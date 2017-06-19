import React, {PropTypes} from 'react'
import classnames from 'classnames'
import _forEach from 'lodash/forEach'

import css from './Toolbar.less'

class Toolbar extends React.Component {
    static propTypes = {
        actions: PropTypes.array.isRequired,
        buttons: PropTypes.array.isRequired,
        hideActions: PropTypes.bool.isRequired,
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

        const isActive = action.isActive(getEditorState)
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
                    key={action.label}
                    action={action}
                    functions={functions}
                    isActive={isActive}
                    isDisabled={isDisabled}
                />
            )
        }

        return (
            <div
                key={action.label}
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
        const {actions, buttons, hideActions} = this.props

        const displaySeparator = !hideActions && buttons.length > 0

        return (
            <div className={classnames('editor-toolbar', css.page)}>
                {!hideActions && actions.map(this._renderAction)}
                {displaySeparator && <span className={css.separator} />}
                {buttons.map(this._renderButton)}
            </div>
        )
    }
}

export default Toolbar
